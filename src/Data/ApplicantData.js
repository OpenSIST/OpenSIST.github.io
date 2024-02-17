import localforage from "localforage";
import {
    ADD_MODIFY_APPLICANT,
    APPLICANT_LIST,
    GET_APPLICANT_ID_BY_USER_ID,
    REMOVE_APPLICANT
} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";

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

export async function getApplicantIDByUserID(userId, isRefresh = false) {
    /*
    * Get the list of applicantIDs from the server or local storage by userId
    * @param userId [String]: userId
    * @return: list of applicants
    */
    // await localforage.removeItem(`${userId}-applicants`)  //TODO: remove this line
    let applicants = await localforage.getItem(`${userId}-applicants`);
    if (isRefresh || applicants === null || (Date.now() - applicants.Date) > CACHE_EXPIRATION) {
        const response = await fetch(GET_APPLICANT_ID_BY_USER_ID, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({display_name: userId})
        });
        await handleErrors(response)
        applicants = await response.json();
        await setApplicantIDByUserID(userId, applicants['result']);
    }
    return applicants['result'];
}

export async function setApplicantIDByUserID(userId, applicants) {
    /*
    * Set the list of applicants to the local storage (i.e. localforage.getItem('applicants'))
    * @param userId [String]: userId
    * @param applicants [Array]: list of applicants
    */
    applicants = {'result': applicants, 'Date': Date.now()}
    await localforage.setItem(`${userId}-applicants`, applicants);
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
    const user = await localforage.getItem('user');
    if (applicant.ApplicantID.split('@')[0] === user) {
        const applicants = await getApplicantIDByUserID(user, true);
        if (applicants.indexOf(applicant.ApplicantID) === -1) {
            applicants.push(applicant.ApplicantID);
            await setApplicantIDByUserID(user, applicants);
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
            content: {...(requestBody.content), Programs: {}},
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
    await deleteApplicantIDByUserID(applicantId);
}

export async function deleteApplicantIDByUserID(applicantId) {
    /*
    * Remove the applicant from the local storage.
    * @param applicantId [String]: applicantId
    */
    const userId = await localforage.getItem('user');
    const applicants = await getApplicantIDByUserID(userId, true);
    await setApplicantIDByUserID(userId, applicants.filter(p => p !== applicantId));
}