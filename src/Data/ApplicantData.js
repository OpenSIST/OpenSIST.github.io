import {ADD_MODIFY_APPLICANT, APPLICANT_LIST, REMOVE_APPLICANT} from "../APIs/APIs";
import {apiJson, apiRequest} from "./Common";
import {FOREGROUND_PRIORITY, loadCachedValue, removeCacheValue} from "./CacheStore";
import {getDisplayName, getMetadata, invalidateMetadataCache} from "./UserData";

export async function getApplicants(isRefresh = false, {priority = FOREGROUND_PRIORITY} = {}) {
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
                fetchPriority: priority,
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

export async function addModifyApplicant(requestBody) {
    /*
    * Post applicant creation/update to the server and invalidate local applicant, record, and metadata caches.
    * @param requestBody [Object]: { newApplicant: Boolean, content: Object }
    */
    await apiRequest(ADD_MODIFY_APPLICANT, {
        body: {
            newApplicant: requestBody.newApplicant,
            content: requestBody.content,
        },
    });
    const displayName = requestBody.content?.ApplicantID?.split('@')[0];
    await Promise.all([
        removeCacheValue("applicants"),
        removeCacheValue("records"),
        invalidateMetadataCache(displayName),
    ]);
}

export async function removeApplicant(applicantId) {
    /*
    * Remove the applicant on the server and invalidate local applicant, record, and metadata caches.
    * @param applicantId [String]: applicantId
    */
    await apiRequest(REMOVE_APPLICANT, {
        body: {
            ApplicantID: applicantId,
        },
    });
    const displayName = applicantId?.split('@')[0];
    await Promise.all([
        removeCacheValue("applicants"),
        removeCacheValue("records"),
        invalidateMetadataCache(displayName),
    ]);
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
