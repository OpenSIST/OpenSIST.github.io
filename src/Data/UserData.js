import localforage from "localforage";
import {redirect} from "react-router-dom";
import {
    LOGIN,
    LOGOUT,
    IS_LOGIN,
    REGISTER,
    RESET_PASSWORD, UPLOAD_AVATAR
} from "../APIs/APIs";
import {headerGenerator} from "./Common";
import {useState} from "react";

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
    await localforage.removeItem('user')
    await localforage.removeItem('session')
    await localforage.removeItem('expireAt')
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
    const response = await fetch(UPLOAD_AVATAR, {
        method: 'POST',
        mode: "cors",
        credentials: "include",
        headers: headerGenerator(true),
        body: avatar
    })
    if (response.status !== 200) {
        const content = await response.json();
        alert(`${content.error}, Error code: ${response.status}`);
    }
}