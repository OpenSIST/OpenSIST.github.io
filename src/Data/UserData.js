import localforage from "localforage";
import {redirect} from "react-router-dom";
import {
    GET_AVATAR,
    GET_DISPLAY_NAME,
    GET_METADATA,
    LOGIN,
    LOGOUT,
    REGISTER,
    RESET_PASSWORD, TOGGLE_NICKNAME, UPDATE_CONTACT,
    UPLOAD_AVATAR,
    COLLECT_PROGRAM,
    UNCOLLECT_PROGRAM,
} from "../APIs/APIs";
import {blobToBase64, emptyCache, handleErrors, headerGenerator} from "./Common";
import {useState} from "react";
import {getApplicants, setApplicants} from "./ApplicantData";
import {getRecordByApplicant, setRecord} from "./RecordData";
import {getPosts} from "./PostData";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min
// const CACHE_EXPIRATION = 1; // 10 min

export async function login(email, password) {
    const username = email.split('@')[0];
    const response = await fetch(LOGIN, {
        method: "POST",
        credentials: "include",
        headers: await headerGenerator(),
        body: JSON.stringify({email, password}),
    })
    if (response.status !== 200) {
        const content = await response.json();
        alert(`${content.error}, Error code: ${response.status}`)
        return redirect("/login");
    } else {
        const user_info = {
            user: username
        }
        await setUserInfo(user_info);
        return redirect("/");
    }
}

export async function registerReset(email, password, token, status) {
    const api = status === 'reset' ? RESET_PASSWORD : REGISTER;
    const response = await fetch(api, {
        method: "POST",
        credentials: "include",
        headers: await headerGenerator(),
        body: JSON.stringify({email, password, token}),
    });

    if (response.status === 200) {
        return redirect("/login");
    } else {
        const content = await response.json();
        const path = status === 'reset' ? '/reset' : '/register';
        alert(`${content.error}, Error code: ${response.status}`);
        return redirect(path);
    }
}

export async function setUserInfo(user_info) {
    if (!user_info) {
        return;
    }
    await Promise.all(Object.entries(user_info).map(async ([key, value]) => {
        if (value) {
            await localforage.setItem(key, value)
        }
    }))
}

export async function logout() {
    const response = await fetch(LOGOUT, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
    })
    if (response.status !== 200 && response.status !== 401) {
        const content = await response.json();
        alert(`${content.error}, Error code: ${response.status}`);
    }
    // await localforage.clear();  // clear all the cache data
    await emptyCache(); // clear all the cache data
    return redirect("/login");
}

export function useUser() {
    const [user, setUser] = useState('')
    localforage.getItem('user').then((value) => {
        setUser(value)
    })
    return user
}

export async function uploadAvatar(avatar) {
    avatar = await blobToBase64(avatar);
    const response = await fetch(UPLOAD_AVATAR, {
        method: 'POST',
        credentials: "include",
        headers: await headerGenerator(true),
        body: avatar
    })
    await handleErrors(response);
    const avatarId = await response.json();
    await setAvatarID(avatarId['avatar_id']);
    await setAvatar(avatar);
}

export async function setAvatarID(avatarId) {
    if (!avatarId) {
        return;
    }
    const displayName = await getDisplayName();
    let metadata = await getMetaData(displayName);
    metadata["Avatar"] = avatarId;
    await setMetaData(metadata, displayName);

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
    let avatar = await localforage.getItem(`${displayName}-avatar`);
    if (isRefresh || !avatar || (Date.now() - avatar['Date']) > CACHE_EXPIRATION) {
        const response = await fetch(GET_AVATAR, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({avatar_id: avatarId})
        })
        await handleErrors(response);
        avatar = await response.text();
        await setAvatar(avatar, displayName);
        avatar = {avatar: avatar}
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
    avatar = {avatar: avatar, Date: Date.now()}
    await localforage.setItem(`${displayName}-avatar`, avatar);
}

/**
 * Get applicant metadata
 * @param {string} displayName - The display name of the applicant
 * @param {boolean} isRefresh - Whether to refresh cache
 * @returns {Promise<object>} - A promise resolving to metadata with Avatar and latestYear
 */
export async function getMetaData(displayName = null, isRefresh = false) {
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
    let metadata = await localforage.getItem(`${displayName}-metadata`);
    if (isRefresh || metadata === null || (Date.now() - metadata.Date) > CACHE_EXPIRATION) {
        const response = await fetch(GET_METADATA, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({display_name: displayName})
        });
        await handleErrors(response)
        metadata = await response.json();
        await setMetaData(metadata['result'], displayName);
    }
    
    // Add latestYear to metadata before returning
    try {
        const latestYear = await findLatestYearForApplicant(displayName);
        metadata['result'] = {
            ...metadata['result'],
            latestYear
        };
    } catch (error) {
        console.error("Error finding latest year:", error);
        // Continue even if finding latest year fails
    }
    
    return metadata['result'];
}

/**
 * Find the latest year with data for a given applicant
 * @param {string} displayName - The display name of the applicant
 * @returns {Promise<number|null>} - Latest year or null if no data found
 */
async function findLatestYearForApplicant(displayName) {
    try {
        // Get the user's metadata which should contain ApplicantIDs
        const metadata = await localforage.getItem(`${displayName}-metadata`);
        
        if (!metadata || !metadata.result || !metadata.result.ApplicantIDs) {
            return [];
        }
        
        const applicantIDs = metadata.result.ApplicantIDs.filter(Boolean);
        
        if (applicantIDs.length === 0) {
            return [];
        }
        
        // Extract years from ApplicantIDs which should be in format displayName@year
        const validYears = applicantIDs
            .map(id => {
                // Extract the part after @ which should be the year
                const parts = id.split('@');
                if (parts.length > 1) {
                    return parseInt(parts[1], 10);
                }
                return null;
            })
            .filter(Boolean); // Filter out any null results from invalid formats
        
        if (validYears.length === 0) {
            return [];
        }
        
        // Return the most recent year
        return Math.max(...validYears);
    } catch (error) {
        console.error("Error finding latest year for applicant:", error);
        return null;
    }
}

export async function setMetaData(metadata, displayName = null) {
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

    metadata = {'result': metadata, 'Date': Date.now()}
    await localforage.setItem(`${displayName}-metadata`, metadata);
}

export async function getDisplayName(isRefresh = false) {
    let displayName = await localforage.getItem('displayName');
    if (isRefresh || !displayName || (Date.now() - displayName['Date']) > CACHE_EXPIRATION) {
        const response = await fetch(GET_DISPLAY_NAME, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
        })
        await handleErrors(response);
        displayName = await response.json();
        await setDisplayName(displayName['name']);
    }
    return displayName['name'];
}

export async function setDisplayName(displayName) {
    if (!displayName) {
        return;
    }
    displayName = {name: displayName, Date: Date.now()}
    await localforage.setItem('displayName', displayName);
}

export async function toggleAnonymous() {
    let ori_displayName = await getDisplayName();
    let ori_metaData = await getMetaData(ori_displayName);
    let ori_avatar = await getAvatar(ori_metaData.Avatar, ori_displayName, false);
    let ori_applicants = ori_metaData.ApplicantIDs;
    let ori_all_applicants = await getApplicants();
    let ori_applicant_records = await Promise.all(ori_applicants.map(async (applicant) => {
        return await getRecordByApplicant(applicant);
    }))

    const response = await fetch(TOGGLE_NICKNAME, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
    });
    await handleErrors(response);
    let displayName = (await response.json())['name'];
    await setDisplayName(displayName);

    await localforage.removeItem(`${ori_displayName}-metaData`);
    ori_metaData.ApplicantIDs = ori_metaData.ApplicantIDs.map((applicant) => {
        return `${displayName}@${applicant.split('@')[1]}`;
    })

    await setMetaData(ori_metaData, displayName);
    await localforage.removeItem(`${ori_displayName}-avatar`);

    await setAvatar(ori_avatar, displayName);

    ori_all_applicants = ori_all_applicants.map((applicant) => {
        if (ori_applicants.includes(applicant.ApplicantID)) {
            applicant.ApplicantID = `${displayName}@${applicant.ApplicantID.split('@')[1]}`;
        }
        return applicant;
    })
    // TODO: the new display name may equal to some deprecated display name in cache
    await setApplicants(ori_all_applicants);
    await Promise.all(ori_applicant_records.map(async (records) => {
        await Promise.all(Object.entries(records).map(async ([recordId, content]) => {
            await localforage.removeItem(`record-${recordId}`);
            content.ApplicantID = `${displayName}@${content.ApplicantID.split('@')[1]}`;
            content.RecordID = `${content.ApplicantID}|${content.ProgramID}`;
            await setRecord(content);
        }))
    }))

}

export async function updateContact(contact) {
    contact = JSON.parse(contact);
    const response = await fetch(UPDATE_CONTACT, {
        method: 'POST',
        credentials: "include",
        headers: await headerGenerator(true),
        body: JSON.stringify({newContact: contact})
    });
    await handleErrors(response);

    let metadata = await getMetaData();
    metadata['Contact'] = contact;
    await setMetaData(metadata);
}

export async function collectProgram(programID) {
    const response = await fetch(COLLECT_PROGRAM, {
        method: 'POST',
        credentials: "include",
        headers: await headerGenerator(true),
        body: JSON.stringify({ProgramID: programID})
    })
    await handleErrors(response);

    let metaData = await getMetaData()
    metaData.ProgramCollection = metaData.ProgramCollection ?? [];
    metaData.ProgramCollection.push(programID);
    await setMetaData(metaData)
}

export async function uncollectProgram(programID) {
    const response = await fetch(UNCOLLECT_PROGRAM, {
        method: 'POST',
        credentials: "include",
        headers: await headerGenerator(true),
        body: JSON.stringify({ProgramID: programID})
    })
    await handleErrors(response);

    let metaData = await getMetaData()
    metaData.ProgramCollection.splice(metaData.ProgramCollection.indexOf(programID), 1)
    await setMetaData(metaData)
}