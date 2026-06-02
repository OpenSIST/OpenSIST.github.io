import localforage from "localforage";
import {redirect} from "react-router-dom";
import {COLLECT_PROGRAM, GET_AVATAR, GET_DISPLAY_NAME, GET_METADATA, LOGIN, LOGOUT, REGISTER, RESET_PASSWORD, TOGGLE_NICKNAME, UNCOLLECT_PROGRAM, UPDATE_CONTACT, UPLOAD_AVATAR,} from "../APIs/APIs";
import {apiJson, apiRequest, apiText, blobToBase64, emptyCache, shouldRefreshCache} from "./Common";
import {useEffect, useState} from "react";
import {getApplicants, setApplicants} from "./ApplicantData";
import {getRecordByApplicant, setRecord} from "./RecordData";

const avatarCacheKey = (displayName) => `${displayName}-avatar`;
const metadataCacheKey = (displayName) => `${displayName}-metadata`;

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
}

export async function logout() {
    const response = await authRequest(LOGOUT);
    if (response.status !== 200 && response.status !== 401) {
        const content = await response.json();
        alert(`${content.error}, Error code: ${response.status}`);
    }
    await emptyCache();
    return redirect("/login");
}

export function useUser() {
    const [user, setUser] = useState('');
    useEffect(() => {
        let mounted = true;
        localforage.getItem('user').then((value) => {
            if (mounted) {
                setUser(value);
            }
        });
        return () => {
            mounted = false;
        };
    }, []);
    return user;
}

export async function uploadAvatar(avatar) {
    avatar = await blobToBase64(avatar);
    const response = await apiRequest(UPLOAD_AVATAR, {body: avatar});
    const avatarId = await response.json();
    await setAvatarID(avatarId['avatar_id']);
    await setAvatar(avatar);
}

export async function setAvatarID(avatarId) {
    if (!avatarId) {
        return;
    }
    const displayName = await getDisplayName();
    const metadata = await getMetadata(displayName);
    await setMetadata({...metadata, Avatar: avatarId}, displayName);

}

export async function getAvatar(avatarId, displayName = null, isRefresh = false) {
    if (!avatarId || avatarId === '') {
        return null;
    }
    if (!displayName) {
        displayName = await getDisplayName(isRefresh);
    }
    if (!displayName) {
        return null;
    }
    let avatar = await localforage.getItem(avatarCacheKey(displayName));
    if (shouldRefreshCache(avatar, isRefresh)) {
        avatar = await apiText(GET_AVATAR, {body: {avatar_id: avatarId}});
        await setAvatar(avatar, displayName);
        avatar = {avatar}
    }
    return avatar["avatar"];
}

export async function setAvatar(avatar, displayName = null) {
    if (!avatar) {
        return
    }
    if (!displayName) {
        displayName = await getDisplayName();
    }
    if (!displayName) {
        return;
    }
    avatar = {avatar, Date: Date.now()}
    await localforage.setItem(avatarCacheKey(displayName), avatar);
}

/**
 * Get applicant metadata
 * @param {string} displayName - The display name of the applicant
 * @param {boolean} isRefresh - Whether to refresh cache
 * @returns {Promise<object>} - A promise resolving to metadata with Avatar and latestYear
 */
export async function getMetadata(displayName = null, isRefresh = false) {
    /*
    * Get the user metadata from the server or local storage
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: metadata
    */
    if (!displayName) {
        displayName = await getDisplayName(isRefresh);
    }
    if (!displayName) {
        return null;
    }
    let metadata = await localforage.getItem(metadataCacheKey(displayName));
    if (shouldRefreshCache(metadata, isRefresh)) {
        metadata = await apiJson(GET_METADATA, {body: {display_name: displayName}});
        await setMetadata(metadata['result'], displayName);
    }

    const result = metadata?.result ?? {};
    return {
        ...result,
        latestYear: findLatestYearForApplicant(result.ApplicantIDs),
    };
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
    await localforage.setItem(metadataCacheKey(displayName), {'result': persistedMetadata, 'Date': Date.now()});
}

export async function getDisplayName(isRefresh = false) {
    let displayName = await localforage.getItem('displayName');
    if (shouldRefreshCache(displayName, isRefresh)) {
        displayName = await apiJson(GET_DISPLAY_NAME, {allowUnauthorized: true});
        await setDisplayName(displayName['name']);
    }
    return displayName?.name ?? null;
}

export async function setDisplayName(displayName) {
    if (!displayName) {
        return;
    }
    displayName = {name: displayName, Date: Date.now()}
    await localforage.setItem('displayName', displayName);
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

    await localforage.removeItem(metadataCacheKey(originalDisplayName));
    const updatedApplicantIds = originalMetadata.ApplicantIDs.map((applicant) => {
        return `${displayName}@${applicant.split('@')[1]}`;
    });
    const updatedMetadata = {
        ...originalMetadata,
        ApplicantIDs: updatedApplicantIds,
    };
    await setMetadata(updatedMetadata, displayName);
    await localforage.removeItem(avatarCacheKey(originalDisplayName));

    await setAvatar(originalAvatar, displayName);

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
        localforage.removeItem('programs'),
    ]);
    await Promise.all(applicantRecords.map(async (records) => {
        await Promise.all(Object.entries(records).map(async ([recordId, content]) => {
            await localforage.removeItem(`record-${recordId}`);
            const ApplicantID = `${displayName}@${content.ApplicantID.split('@')[1]}`;
            await setRecord({
                ...content,
                ApplicantID,
                RecordID: `${ApplicantID}|${content.ProgramID}`,
            });
        }))
    }))

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
