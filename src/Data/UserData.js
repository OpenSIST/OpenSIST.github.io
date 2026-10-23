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
    const normalizedEmail = email.trim().toLowerCase();
    const username = normalizedEmail.split('@')[0];
    const response = await authRequest(LOGIN, {email: normalizedEmail, password});
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
    const normalizedEmail = email.trim().toLowerCase();
    const api = status === 'reset' ? RESET_PASSWORD : REGISTER;
    const response = await authRequest(api, {email: normalizedEmail, password, token});

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
    const displayName = await getDisplayName();
    const previousMetadataEntry = displayName
        ? await readCacheEntry(metadataCacheKey(displayName), {legacyFields: ["result"]})
        : null;
    const previousAvatarId = previousMetadataEntry?.value?.Avatar;

    avatar = await blobToBase64(avatar);
    const response = await apiRequest(UPLOAD_AVATAR, {body: avatar});
    const avatarId = (await response.json())?.['avatar_id'];

    if (displayName) {
        await Promise.all([
            removeCacheValue(metadataCacheKey(displayName)),
            ...(previousAvatarId ? [removeCacheValue(avatarCacheKey(displayName, previousAvatarId))] : []),
            ...(avatarId ? [removeCacheValue(avatarCacheKey(displayName, avatarId))] : []),
        ]);
    }
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

export async function invalidateMetadataCache(displayName = null) {
    if (!displayName) {
        displayName = await getDisplayName();
    }
    if (!displayName) {
        return;
    }
    await removeCacheValue(metadataCacheKey(displayName));
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

export async function toggleAnonymous() {
    const originalDisplayName = await getDisplayName();
    const originalMetadataEntry = originalDisplayName
        ? await readCacheEntry(metadataCacheKey(originalDisplayName), {legacyFields: ["result"]})
        : null;
    const originalAvatarId = originalMetadataEntry?.value?.Avatar;

    const response = await apiJson(TOGGLE_NICKNAME);
    const nextDisplayName = response?.['name'];

    await Promise.all([
        removeCacheValue("displayName"),
        removeCacheValue("applicants"),
        removeCacheValue("records"),
        ...(originalDisplayName ? [removeCacheValue(metadataCacheKey(originalDisplayName))] : []),
        ...(nextDisplayName ? [removeCacheValue(metadataCacheKey(nextDisplayName))] : []),
        ...(originalDisplayName && originalAvatarId
            ? [removeCacheValue(avatarCacheKey(originalDisplayName, originalAvatarId))]
            : []),
    ]);
}

export async function updateContact(contact) {
    const normalizedContact = typeof contact === 'string' ? JSON.parse(contact) : contact;
    await apiRequest(UPDATE_CONTACT, {body: {newContact: normalizedContact}});
    await invalidateMetadataCache();
}

export async function collectProgram(programID) {
    await apiRequest(COLLECT_PROGRAM, {body: {ProgramID: programID}});
    await invalidateMetadataCache();
}

export async function uncollectProgram(programID) {
    await apiRequest(UNCOLLECT_PROGRAM, {body: {ProgramID: programID}});
    await invalidateMetadataCache();
}
