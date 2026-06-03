import {ADD_MODIFY_APPLICANT, APPLICANT_LIST, REMOVE_APPLICANT} from "../APIs/APIs";
import {apiJson, apiRequest} from "./Common";
import {BACKGROUND_PRIORITY, loadCachedValue, writeCacheValue} from "./CacheStore";
import {getDisplayName, getMetadata, setMetadata} from "./UserData";
import {deleteRecord, getRecordByApplicant, getRecordByRecordIDs, setRecord} from "./RecordData";

export async function getApplicants(isRefresh = false, {priority = "foreground"} = {}) {
    /*
    * Get the list of applicants from the server or local storage
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: list of applicants
    */
    return loadCachedValue({
        key: "applicants",
        legacyFields: ["data"],
        forceRefresh: isRefresh,
        priority,
        load: async () => {
            const applicants = await apiJson(APPLICANT_LIST, {
                fetchPriority: priority === BACKGROUND_PRIORITY ? "low" : undefined,
            });
            return applicants.data;
        },
    });
}

export async function getApplicantIDByDisplayName(isRefresh = false) {
    /*
    * Get the list of applicantIDs from the server or local storage by displayName
    * @return: list of applicants
    */
    const displayName = await getDisplayName(isRefresh);
    const metadata = await getMetadata(displayName, isRefresh);
    return metadata.ApplicantIDs;
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
    const metadata = await getMetadata(displayName, true);
    await setMetadata({...metadata, ApplicantIDs: applicants}, displayName);
}

export async function deleteApplicantIDByDisplayName(applicantId) {
    /*
    * Remove the applicant from the local storage.
    * @param applicantId [String]: applicantId
    */
    const applicants = await getApplicantIDByDisplayName(true);
    await setApplicantIDByDisplayName(applicants.filter(p => p !== applicantId));
}

export async function getApplicant(applicantId, isRefresh = false, options = {}) {
    /*
    * Get the applicant from the server or local storage by applicantId
    * @param applicantId [String]: applicantId
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: applicant
    */
    const applicants = await getApplicants(isRefresh, options);
    const applicant = applicants.find(p => p.ApplicantID === applicantId);
    if (!applicant) {
        await getMetadata(applicantId.split('@')[0], true);
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
    await writeCacheValue("applicants", applicants);
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
    const originalApplicant = applicants.find(p => p.ApplicantID === applicant.ApplicantID);
    const originalFinalRecordId = originalApplicant?.Final
        ? `${originalApplicant.ApplicantID}|${originalApplicant.Final}`
        : null;
    const finalRecordId = applicant.Final
        ? `${applicant.ApplicantID}|${applicant.Final}`
        : null;
    const finalRecordIds = [originalFinalRecordId, finalRecordId].filter(Boolean);
    const records = await getRecordByRecordIDs(finalRecordIds);
    const originalFinalRecord = records[originalFinalRecordId];
    const finalRecord = records[finalRecordId];
    if (originalFinalRecord) {
        await setRecord({...originalFinalRecord, Final: false});
    }
    if (finalRecord) {
        await setRecord({...finalRecord, Final: true});
    }
    const updatedApplicants = originalApplicant
        ? applicants.map(currentApplicant => (
            currentApplicant.ApplicantID === applicant.ApplicantID ? applicant : currentApplicant
        ))
        : [...applicants, applicant];
    await setApplicants(updatedApplicants);
    if (await isAuthApplicant(applicant.ApplicantID)) {
        const applicantIds = await getApplicantIDByDisplayName();
        if (!applicantIds.includes(applicant.ApplicantID)) {
            await setApplicantIDByDisplayName([...applicantIds, applicant.ApplicantID]);
        }
    }
}

export async function addModifyApplicant(requestBody) {
    /*
    * Set the applicant to the local storage (i.e. localforage.getItem('applicants')), and post to the server.
    * @param applicant [Object]: applicant information
    */

    await apiRequest(ADD_MODIFY_APPLICANT, {
        body: {
            newApplicant: requestBody.newApplicant,
            content: requestBody.content,
        },
    });
    await setApplicant(requestBody.content);
}

export async function removeApplicant(applicantId) {
    /*
    * Remove the applicant from the local storage and the server.
    * @param applicantId [String]: applicantId
    */
    await apiRequest(REMOVE_APPLICANT, {
        body: {
            ApplicantID: applicantId,
        },
    });

    const records = await getRecordByApplicant(applicantId);
    const applicants = await getApplicants();
    await setApplicants(applicants.filter(p => p.ApplicantID !== applicantId));
    await deleteApplicantIDByDisplayName(applicantId);
    // The backend currently blocks deletion with records, but clear stale local records defensively.
    for (const recordId of Object.keys(records)) {
        await deleteRecord(recordId);
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
    const applicantUsername = applicantId.split('@')[0];
    return applicantUsername === displayName;
}
