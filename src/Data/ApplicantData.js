import localforage from "localforage";
import {ADD_MODIFY_APPLICANT, APPLICANT_LIST, REMOVE_APPLICANT} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import {getDisplayName, getMetaData, setMetaData} from "./UserData";

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
    // await localforage.removeItem('applicants')  //TODO: remove this line
    let applicants = await localforage.getItem('applicants');

    if (isRefresh || applicants === null || (Date.now() - applicants.Date) > CACHE_EXPIRATION) {
        const response = await fetch(APPLICANT_LIST, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
        });
        await handleErrors(response)
        applicants = await response.json();
        await setApplicants(applicants['data']);
    }
    return applicants['data'];
}

export async function getApplicantIDByDisplayName(isRefresh = false) {
    /*
    * Get the list of applicantIDs from the server or local storage by displayName
    * @return: list of applicants
    */
    const displayName = await getDisplayName(isRefresh);
    const metaData = await getMetaData(displayName, isRefresh);
    return metaData.ApplicantIDs;
}

export async function setApplicantIDByDisplayName(applicants) {
    /*
    * Set the list of applicants to the local storage (i.e. localforage.getItem('applicants'))
    * @param applicants [Array]: list of applicants
    */
    const displayName = await getDisplayName();
    let metaData = await getMetaData(displayName, true);
    metaData.ApplicantIDs = applicants;
    await setMetaData(metaData, displayName);
    // applicants = {'result': applicants, 'Date': Date.now()}
    // await localforage.setItem(`${displayName}-applicants`, applicants);
}

export async function deleteApplicantIDByDisplayName(applicantId) {
    /*
    * Remove the applicant from the local storage.
    * @param applicantId [String]: applicantId
    */
    // const userId = await localforage.getItem('user');
    // const displayName = getDisplayName();
    const applicants = await getApplicantIDByDisplayName(true);
    await setApplicantIDByDisplayName(applicants.filter(p => p !== applicantId));
}

export async function getApplicant(applicantId, isRefresh = false) {
    /*
    * Get the applicant from the server or local storage by applicantId
    * @param applicantId [String]: applicantId
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: applicant
    */
    const applicants = await getApplicants(isRefresh);
    return applicants.find(p => p.ApplicantID === applicantId);
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
    const applicants = await getApplicants(true);
    if (applicants.find(p => p.ApplicantID === applicant.ApplicantID) !== undefined) {
        applicants[applicants.indexOf(applicant)] = applicant;
    } else {
        applicants.push(applicant);
    }
    await setApplicants(applicants);
    const displayName = await getDisplayName();
    if (applicant.ApplicantID.split('@')[0] === displayName) {
        const applicants = await getApplicantIDByDisplayName(true);
        if (applicants.indexOf(applicant.ApplicantID) === -1) {
            applicants.push(applicant.ApplicantID);
            await setApplicantIDByDisplayName(applicants);
        }
    }
}

export async function addModifyApplicant(requestBody, userId) {
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
            content: requestBody.content,
        }),
    });
    await handleErrors(response);
    await setApplicant(requestBody.content);
}

export async function removeApplicant(applicantId) {
    /*
    * Remove the applicant from the local storage and the server.
    * @param applicantId [String]: applicantId
    */
    const response = await fetch(REMOVE_APPLICANT, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({
            ApplicantID: applicantId,
        }),
    });

    await handleErrors(response);
    const applicants = await getApplicants();
    await setApplicants(applicants.filter(p => p.ApplicantID !== applicantId));
    await deleteApplicantIDByDisplayName(applicantId);
}


export async function isAuthApplicant(applicantId) {
    /*
    * Check if the user is authorized to access the applicant
    * @param applicantId [String]: applicantId
    * @return: [Boolean]: whether the user is authorized to access the applicant
    */
    const authApplicants = await getApplicantIDByDisplayName();
    return authApplicants.indexOf(applicantId) !== -1;
}