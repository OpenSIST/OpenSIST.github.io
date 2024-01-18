import localforage from "localforage";
import {redirect} from "react-router-dom";
import {LOGIN, LOGOUT, IS_LOGIN} from "../APIs/APIs";
import {headerGenerator} from "./Common";

export async function checkLogin() {
    const session = await localforage.getItem('session');
    const expireAt = await localforage.getItem('expireAt');
    const now = Date.now() / 1000;
    console.log("We are here!")
    const response = await fetch(IS_LOGIN, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
    });
    return session && now < expireAt && response.status === 200;
}

export async function login(username, password) {
    const email = username + "@shanghaitech.edu.cn";
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

export async function setUserInfo(user_info) {
    Object.entries(user_info).map(async ([key, value]) => {
        await localforage.setItem(key, value)
    })
}

export async function logout() {
    const session = await localforage.getItem('session');
    console.log(session)
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
    // return redirect("/login");
}