import localforage from "localforage";
import {redirect} from "react-router-dom";
import {
    GET_AVATAR,
    GET_DISPLAY_NAME,
    GET_METADATA,
    LOGIN,
    LOGOUT,
    REGISTER,
    RESET_PASSWORD,
    UPLOAD_AVATAR
} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import {useState} from "react";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min

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
        let data = await (await response).json();
        const user_info = {
            user: username,
            session: data.token,
            expireAt: data.expireAt,
        }
        await setUserInfo(user_info);
        await getDisplayName();
        return redirect("/");
    }
}

export async function registerReset(email, password, token, status) {
    const api = status === 'reset' ? RESET_PASSWORD : REGISTER;
    const response = await fetch(api, {
        method: "POST",
        mode: "cors",
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
    Object.entries(user_info).map(async ([key, value]) => {
        await localforage.setItem(key, value)
    })
}

export async function logout() {
    const response = await fetch(LOGOUT, {
        method: 'POST',
        headers: await headerGenerator(true),
    })
    if (response.status !== 200 && response.status !== 401) {
        const content = await response.json();
        alert(`${content.error}, Error code: ${response.status}`);
    }
    await localforage.removeItem('user');
    await localforage.removeItem('session');
    await localforage.removeItem('expireAt');
    await localforage.removeItem('displayName');
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
    let fileSuffix = avatar.name.split('.');
    fileSuffix = fileSuffix[fileSuffix.length - 1];
    const response = await fetch(UPLOAD_AVATAR, {
        method: 'POST',
        mode: "cors",
        credentials: "include",
        headers: await headerGenerator(true,
            `image/${fileSuffix}`
        ),
        body: avatar
    })
    await handleErrors(response);
    const avatarId = await response.json();
    await setAvatarID(avatarId['avatar_id']);
    await setAvatar(avatar);
}

export async function setAvatarID(avatarId) {
    const displayName = await getDisplayName();
    await getMetaData(displayName, true);
    let metadata = await getMetaData(displayName, false);
    metadata["Avatar"] = avatarId;
    await setMetaData(metadata, displayName);

}

export async function getAvatar(avatarId, displayName = null, isRefresh = false) {
    if (!avatarId || avatarId === '') {
        return null;
    }
    if (!displayName) {
        displayName = await getDisplayName();
    }
    let avatar = await localforage.getItem(`${displayName}-avatar`);
    if (isRefresh || !avatar || (Date.now() - avatar['Date']) > CACHE_EXPIRATION) {
        const response = await fetch(GET_AVATAR, {
            method: 'POST',
            headers: await headerGenerator(true),
            body: JSON.stringify({avatar_id: avatarId})
        })
        await handleErrors(response);
        avatar = await response.blob();
        await setAvatar(avatar, displayName);
        avatar = {avatar: avatar}
    }
    return URL.createObjectURL(avatar["avatar"]);
}

export async function setAvatar(avatar, avatarId, displayName = null) {
    if (!displayName) {
        displayName = await getDisplayName();
    }
    avatar = {avatar: avatar, Date: Date.now()}
    await localforage.setItem(`${displayName}-avatar`, avatar);
}

export async function getMetaData(displayName = null, isRefresh = false) {
    /*
    * Get the user metadata from the server or local storage
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: metadata
    */
    if (!displayName) {
        displayName = await getDisplayName(isRefresh);
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
    return metadata['result'];
}

export async function setMetaData(metadata, displayName = null) {
    /*
    * Set the user metadata to the local storage
    * @param metadata [Object]: metadata
    */
    if (displayName === null) {
        displayName = await getDisplayName();
    }
    metadata = {'result': metadata, 'Date': Date.now()}
    await localforage.setItem(`${displayName}-metadata`, metadata);
}

export async function getDisplayName(isRefresh = false) {
    let displayName = await localforage.getItem('displayName');
    if (isRefresh || !displayName || (Date.now() - displayName['Date']) > CACHE_EXPIRATION) {
        const response = await fetch(GET_DISPLAY_NAME, {
            method: 'POST',
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