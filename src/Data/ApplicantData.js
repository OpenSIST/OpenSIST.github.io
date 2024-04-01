import localforage from "localforage";
import {ADD_MODIFY_APPLICANT, APPLICANT_LIST, REMOVE_APPLICANT} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import {getDisplayName, getMetaData, setMetaData} from "./UserData";
import {deleteRecord, getRecordByApplicant, getRecordByRecordIDs, setRecord} from "./RecordData";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min
// const CACHE_EXPIRATION = 1; // 10 min


export async function getApplicants(isRefresh = false, query = {}) {
    /*
    * Get the list of applicants from the server or local storage
    * @param isRefresh [Boolean]: whether to refresh the data
    * @param query [Object]: {
    *
    * }
    * @return: list of applicants
    */
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
    if (!applicants) {
        return;
    }
    const displayName = await getDisplayName();
    let metaData = await getMetaData(displayName, true);
    metaData.ApplicantIDs = applicants;
    await setMetaData(metaData, displayName);
}

export async function deleteApplicantIDByDisplayName(applicantId) {
    /*
    * Remove the applicant from the local storage.
    * @param applicantId [String]: applicantId
    */
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
    const applicant = applicants.find(p => p.ApplicantID === applicantId);
    if (!applicant) {
        await getMetaData(applicantId.split('@')[0], true);
        throw new Error('Applicant not found');
    }
    return applicant;
}

export async function setApplicants(applicants) {
    /*
    * Set the list of applicants to the local storage (i.e. localforage.getItem('applicants'))
    * @param applicants [Array]: list of applicants
    */
    if (!applicants) {
        return;
    }
    applicants = {'data': applicants, 'Date': Date.now()}
    await localforage.setItem('applicants', applicants);
}

export async function setApplicant(applicant) {
    /*
    * Set the applicant to the local storage (i.e. localforage.getItem('applicants'))
    * @param applicant [Object]: applicant
    */
    if (!applicant) {
        return;
    }
    const applicants = await getApplicants();
    const ori_applicant = applicants.filter(p => p.ApplicantID === applicant.ApplicantID)[0];
    const ori_final_record_id = ori_applicant?.ApplicantID + "|" + ori_applicant?.Final;
    const final_record_id = applicant?.ApplicantID + "|" + applicant?.Final;
    const records = await getRecordByRecordIDs([ori_final_record_id, final_record_id]);
    const ori_final_record = records[ori_final_record_id];
    const final_record = records[final_record_id];
    if (ori_final_record) {
        ori_final_record.Final = false;
        await setRecord(ori_final_record);
    }
    if (final_record) {
        final_record.Final = true;
        await setRecord(final_record);
    }
    if (ori_applicant) {
        applicants[applicants.indexOf(ori_applicant)] = applicant;
    } else {
        applicants.push(applicant);
    }
    await setApplicants(applicants);
    if (await isAuthApplicant(applicant.ApplicantID)) {
        const applicants = await getApplicantIDByDisplayName();
        if (applicants.indexOf(applicant.ApplicantID) === -1) {
            applicants.push(applicant.ApplicantID);
            await setApplicantIDByDisplayName(applicants);
        }
    }
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
    const records = await getRecordByApplicant(applicantId);
    const applicants = await getApplicants();
    await setApplicants(applicants.filter(p => p.ApplicantID !== applicantId));
    await deleteApplicantIDByDisplayName(applicantId);
    // Since the backend prohibits the deletion of an applicant with records, the following code is not necessary actually...
    for (const recordID of Object.keys(records)) {
        await deleteRecord(recordID);
    }
}


export async function isAuthApplicant(applicantId) {
    /*
    * Check if the user is authorized to access the applicant
    * @param applicantId [String]: applicantId
    * @return: [Boolean]: whether the user is authorized to access the applicant
    */
    if (!applicantId) {
        return false;
    }
    const displayName = await getDisplayName();
    return applicantId.split('@')[0] === displayName;
}