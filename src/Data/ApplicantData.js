import localforage from "localforage";
import {ADD_MODIFY_APPLICANT, REMOVE_APPLICANT, APPLICANT_LIST} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import {getPrograms, setPrograms} from "./ProgramData";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min

export async function getApplicants(isRefresh = false, query = {}) {
    /*
    * Get the list of applicants from the server or local storage
    * @param isRefresh [Boolean]: whether to refresh the data
    * @param query [Object]: {
    *
    * }
    * @return: list of applicants
    */
    const userId = query?.userId;
    let applicants = localforage.getItem('applicants');

    if (isRefresh || applicants === null || (Date.now() - applicants.Date) > CACHE_EXPIRATION) {
        const response = await fetch(APPLICANT_LIST, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(),
        });
        await handleErrors(response)
        applicants = (await response.json());
        if (userId) {
            applicants = applicants['data'].filter(applicant => applicant.ApplicantID.split('@')[0] === userId);
        } else {
            applicants = applicants['data'];
        }
        await setApplicants(applicants);
    }
    return applicants;
}

export async function getApplicant(applicantID, isRefresh = false) {
    /*
    * Get the applicant from the server or local storage by applicantID
    * @param applicantID [String]: applicantID
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: applicant
    */
    const applicants = await getApplicants(isRefresh);
    return applicants.find(applicant => applicant.ApplicantID === applicantID);
}

export async function setApplicants(applicants) {
    /*
    * Set the list of applicants to the local storage (i.e. localforage.getItem('applicants'))
    * @param applicants [Array]: list of applicants
    */
    applicants = {'data': applicants, 'Date': Date.now()}
    await localforage.setItem('applicants', applicants);
}


export async function setApplicant(applicant) {
    /*
    * Set the applicant to the local storage (i.e. localforage.getItem('applicants'))
    * @param applicant [Object]: applicant
    */
    const applicants = await getApplicants();
    if (applicants.find(p => p.ApplicantID === applicant.ApplicantID) !== undefined) {
        applicants[applicants.indexOf(applicant)] = applicant;
    }
    await setPrograms(applicants);
}

export async function addModifyApplicant(requestBody) {
    /*
    * Set the applicant to the local storage (i.e. localforage.getItem('applicants')), and post to the server.
    * @param applicant [Object]: applicant information
    */

    const response = await fetch(ADD_MODIFY_APPLICANT, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({
            newApplicant: requestBody.newApplicant,
            content: {...(requestBody.content), Programs: []},
        }),
    });
    await handleErrors(response)
    await setApplicant(requestBody.content);
}