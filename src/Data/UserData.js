import localforage from "localforage";
import {redirect} from "react-router-dom";
import {
    COLLECT_PROGRAM,
    GET_AVATAR,
    GET_DISPLAY_NAME,
    GET_METADATA_BATCH,
    LOGIN,
    LOGOUT,
    REGISTER,
    RESET_PASSWORD,
    TOGGLE_NICKNAME,
    UNCOLLECT_PROGRAM,
    UPDATE_CONTACT,
    UPLOAD_AVATAR,
} from "../APIs/APIs";
import {apiJson, apiRequest, apiText, blobToBase64, emptyCache} from "./Common";
import {
    BACKGROUND_PRIORITY,
    beginCacheRequests,
    CACHE_CLEARED_EVENT,
    FOREGROUND_PRIORITY,
    getCacheEpoch,
    isCacheEntryExpired,
    loadCachedValue,
    readCacheEntry,
    removeCacheValue,
    writeCacheValue
} from "./CacheStore";
import {useEffect, useState} from "react";
import {getApplicants, setApplicants} from "./ApplicantData";
import {getRecordByApplicant, updateCachedRecords} from "./RecordData";

const avatarCacheKey = (displayName, avatarId) => `${displayName}-avatar-${avatarId}`;
const metadataCacheKey = (displayName) => `${displayName}-metadata`;
const USER_CHANGED_EVENT = "opensist-user-changed";

function notifyUserChanged() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(USER_CHANGED_EVENT));
    }
}

async function authRequest(path, body) {
    return fetch(path, {
        method: "POST",
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        ...(body && {body: JSON.stringify(body)}),
    });
}

export async function login(email, password) {
    const username = email.split('@')[0];
    const response = await authRequest(LOGIN, {email, password});
    if (response.status !== 200) {
        const content = await response.json();
        alert(`${content.error}, Error code: ${response.status}`)
        return redirect("/login");
    }
    const userInfo = {
        user: username
    }
    await setUserInfo(userInfo);
    return redirect("/");
}

export async function registerReset(email, password, token, status) {
    const api = status === 'reset' ? RESET_PASSWORD : REGISTER;
    const response = await authRequest(api, {email, password, token});

    if (response.status === 200) {
        return redirect("/login");
    }
    const content = await response.json();
    const path = status === 'reset' ? '/reset' : '/register';
    alert(`${content.error}, Error code: ${response.status}`);
    return redirect(path);
}

export async function setUserInfo(userInfo) {
    if (!userInfo) {
        return;
    }
    await Promise.all(Object.entries(userInfo)
        .filter(([, value]) => value)
        .map(([key, value]) => localforage.setItem(key, value)));
    notifyUserChanged();
}

export async function logout() {
    const response = await authRequest(LOGOUT);
    if (response.status !== 200 && response.status !== 401) {
        const content = await response.json();
        alert(`${content.error}, Error code: ${response.status}`);
    }
    await emptyCache();
    notifyUserChanged();
    return redirect("/login");
}

export function useUser() {
    const [user, setUser] = useState('');
    useEffect(() => {
        let mounted = true;
        const refreshUser = () => localforage.getItem('user').then((value) => {
            if (mounted) {
                setUser(value);
            }
        });
        void refreshUser();
        window.addEventListener(USER_CHANGED_EVENT, refreshUser);
        window.addEventListener(CACHE_CLEARED_EVENT, refreshUser);
        return () => {
            mounted = false;
            window.removeEventListener(USER_CHANGED_EVENT, refreshUser);
            window.removeEventListener(CACHE_CLEARED_EVENT, refreshUser);
        };
    }, []);
    return user;
}

export async function uploadAvatar(avatar) {
    avatar = await blobToBase64(avatar);
    const response = await apiRequest(UPLOAD_AVATAR, {body: avatar});
    const avatarId = await response.json();
    await setAvatarID(avatarId['avatar_id']);
    await setAvatar(avatar, null, avatarId['avatar_id']);
}

export async function setAvatarID(avatarId) {
    if (!avatarId) {
        return;
    }
    const displayName = await getDisplayName();
    const metadata = await getMetadata(displayName);
    await setMetadata({...metadata, Avatar: avatarId}, displayName);

}

export async function getAvatar(avatarId, displayName = null, isRefresh = false, {priority = FOREGROUND_PRIORITY} = {}) {
    if (!avatarId || avatarId === '') {
        return null;
    }
    if (!displayName) {
        displayName = await getDisplayName(isRefresh, {priority});
    }
    if (!displayName) {
        return null;
    }
    return loadCachedValue({
        key: avatarCacheKey(displayName, avatarId),
        legacyFields: ["avatar"],
        forceRefresh: isRefresh,
        priority,
        load: () => apiText(GET_AVATAR, {
            body: {avatar_id: avatarId},
            fetchPriority: priority,
        }),
    });
}

export async function setAvatar(avatar, displayName = null, avatarId = null) {
    if (!avatar) {
        return
    }
    if (!displayName) {
        displayName = await getDisplayName();
    }
    if (!avatarId) {
        avatarId = (await getMetadata(displayName))?.Avatar;
    }
    if (!displayName || !avatarId) {
        return;
    }
    await writeCacheValue(avatarCacheKey(displayName, avatarId), avatar);
}

/**
 * Get applicant metadata
 * @param {string} displayName - The display name of the applicant
 * @param {boolean} isRefresh - Whether to refresh cache
 * @returns {Promise<object>} - A promise resolving to metadata with Avatar and latestYear
 */
export async function getMetadata(displayName = null, isRefresh = false, {priority = FOREGROUND_PRIORITY} = {}) {
    /*
    * Get the user metadata from the server or local storage
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: metadata
    */
    if (!displayName) {
        displayName = await getDisplayName(isRefresh, {priority});
    }
    if (!displayName) {
        return null;
    }
    const metadata = await getMetadataBatch([displayName], isRefresh, {priority});
    return metadata[displayName] ?? metadataWithLatestYear({});
}

export async function getMetadataBatch(displayNames, isRefresh = false, {priority = FOREGROUND_PRIORITY} = {}) {
    const uniqueDisplayNames = [...new Set(displayNames)].filter(Boolean);
    const requestEpoch = getCacheEpoch();
    const entries = await Promise.all(uniqueDisplayNames.map((displayName) => (
        readCacheEntry(metadataCacheKey(displayName), {legacyFields: ["result"], requestEpoch})
    )));
    if (requestEpoch !== getCacheEpoch()) {
        return {};
    }

    const cachedMetadata = Object.fromEntries(uniqueDisplayNames.flatMap((displayName, index) => (
        entries[index] ? [[displayName, metadataWithLatestYear(entries[index].value)]] : []
    )));
    const expiredDisplayNames = uniqueDisplayNames.filter((displayName, index) => (
        isCacheEntryExpired(entries[index], isRefresh)
    ));
    const request = beginCacheRequests(expiredDisplayNames.map(metadataCacheKey), priority, requestEpoch);
    const requestDisplayNames = request.keys.map(displayNameFromMetadataCacheKey);

    if (requestDisplayNames.length === 0) {
        return cachedMetadata;
    }

    try {
        const response = await apiJson(GET_METADATA_BATCH, {
            body: {display_names: requestDisplayNames},
            fetchPriority: priority,
        });
        const refreshedRawMetadata = requestDisplayNames.reduce((metadataByName, displayName) => ({
            ...metadataByName,
            [displayName]: response.data?.[displayName] ?? null,
        }), {});
        const cacheWrites = requestDisplayNames.map((displayName) => {
            const key = metadataCacheKey(displayName);
            return writeCacheValue(key, refreshedRawMetadata[displayName], {
                requestEpoch: request.epoch,
                requestVersion: request.versionFor(key),
            });
        });
        if (priority === BACKGROUND_PRIORITY) {
            await Promise.all(cacheWrites);
        } else {
            cacheWrites.forEach((cacheWrite) => void cacheWrite.catch(() => {
            }));
        }
        const refreshedMetadata = Object.fromEntries(
            Object.entries(refreshedRawMetadata).map(([displayName, metadata]) => (
                [displayName, metadataWithLatestYear(metadata)]
            ))
        );
        return {
            ...cachedMetadata,
            ...refreshedMetadata,
        };
    } finally {
        request.release();
    }
}

/**
 * Find the latest year with data for a given applicant
 * @param {string[]} applicantIDs - Applicant IDs in the form "displayName@year"
 * @returns {Promise<number|null>} - Latest year or null if no data found
 */
function findLatestYearForApplicant(applicantIDs = []) {
    const validYears = applicantIDs
        .map(id => Number.parseInt(id.split('@')[1], 10))
        .filter(Number.isFinite);
    return validYears.length > 0 ? Math.max(...validYears) : null;
}

function metadataWithLatestYear(metadata) {
    const result = metadata ?? {};
    return {
        ...result,
        latestYear: findLatestYearForApplicant(result.ApplicantIDs),
    };
}

function displayNameFromMetadataCacheKey(key) {
    return key.slice(0, -"-metadata".length);
}

export async function setMetadata(metadata, displayName = null) {
    /*
    * Set the user metadata to the local storage
    * @param metadata [Object]: metadata
    */
    if (!metadata) {
        return;
    }
    if (displayName === null) {
        displayName = await getDisplayName();
    }
    if (!displayName) {
        return;
    }

    const persistedMetadata = {...metadata};
    delete persistedMetadata.latestYear;
    await writeCacheValue(metadataCacheKey(displayName), persistedMetadata);
}

export async function getDisplayName(isRefresh = false, {priority = FOREGROUND_PRIORITY} = {}) {
    return loadCachedValue({
        key: "displayName",
        legacyFields: ["name"],
        forceRefresh: isRefresh,
        priority,
        load: async () => {
            const displayName = await apiJson(GET_DISPLAY_NAME, {
                allowUnauthorized: true,
                fetchPriority: priority,
            });
            return displayName.name;
        },
    });
}

export async function setDisplayName(displayName) {
    if (!displayName) {
        return;
    }
    await writeCacheValue("displayName", displayName);
}

export async function toggleAnonymous() {
    const originalDisplayName = await getDisplayName();
    const originalMetadata = await getMetadata(originalDisplayName);
    const originalAvatar = await getAvatar(originalMetadata.Avatar, originalDisplayName, false);
    const originalApplicantIds = originalMetadata.ApplicantIDs ?? [];
    const allApplicants = await getApplicants();
    const applicantRecords = await Promise.all(originalApplicantIds.map((applicantId) => getRecordByApplicant(applicantId)));

    const displayName = (await apiJson(TOGGLE_NICKNAME))['name'];
    await setDisplayName(displayName);

    await removeCacheValue(metadataCacheKey(originalDisplayName));
    const updatedApplicantIds = originalApplicantIds.map((applicant) => {
        return `${displayName}@${applicant.split('@')[1]}`;
    });
    const updatedMetadata = {
        ...originalMetadata,
        ApplicantIDs: updatedApplicantIds,
    };
    await setMetadata(updatedMetadata, displayName);
    await removeCacheValue(avatarCacheKey(originalDisplayName, originalMetadata.Avatar));

    await setAvatar(originalAvatar, displayName, originalMetadata.Avatar);

    const originalApplicantIdSet = new Set(originalApplicantIds);
    const updatedApplicantIdSet = new Set(updatedApplicantIds);
    const updatedApplicants = allApplicants
        .filter((applicant) => {
            return originalApplicantIdSet.has(applicant.ApplicantID) || !updatedApplicantIdSet.has(applicant.ApplicantID);
        })
        .map((applicant) => {
            if (originalApplicantIdSet.has(applicant.ApplicantID)) {
                return {
                    ...applicant,
                    ApplicantID: `${displayName}@${applicant.ApplicantID.split('@')[1]}`,
                };
            }
            return applicant;
        })
    await Promise.all([
        setApplicants(updatedApplicants),
        removeCacheValue('programs'),
    ]);
    await updateCachedRecords((records) => {
        const updatedRecords = {...records};
        applicantRecords.forEach((recordGroup) => {
            Object.entries(recordGroup).forEach(([recordId, content]) => {
                delete updatedRecords[recordId];
                const ApplicantID = `${displayName}@${content.ApplicantID.split('@')[1]}`;
                const updatedRecord = {
                    ...content,
                    ApplicantID,
                    RecordID: `${ApplicantID}|${content.ProgramID}`,
                };
                updatedRecords[updatedRecord.RecordID] = updatedRecord;
            });
        });
        return updatedRecords;
    });

}

export async function updateContact(contact) {
    const normalizedContact = typeof contact === 'string' ? JSON.parse(contact) : contact;
    await apiRequest(UPDATE_CONTACT, {body: {newContact: normalizedContact}});

    const metadata = await getMetadata();
    await setMetadata({...metadata, Contact: normalizedContact});
}

export async function collectProgram(programID) {
    await apiRequest(COLLECT_PROGRAM, {body: {ProgramID: programID}});

    const metadata = await getMetadata();
    await setMetadata({
        ...metadata,
        ProgramCollection: [...new Set([...(metadata.ProgramCollection ?? []), programID])],
    });
}

export async function uncollectProgram(programID) {
    await apiRequest(UNCOLLECT_PROGRAM, {body: {ProgramID: programID}});

    const metadata = await getMetadata();
    await setMetadata({
        ...metadata,
        ProgramCollection: (metadata.ProgramCollection ?? []).filter(id => id !== programID),
    });
}
