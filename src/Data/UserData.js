import localforage from "localforage";
import {redirect} from "react-router-dom";

export async function checkLogin() {
    const session = await localforage.getItem('session');
    const expireAt = await localforage.getItem('expireAt');
    const now = Date.now() / 1000;
    return session && now < expireAt
}

export async function login(username, password) {
    const email = username + "@shanghaitech.edu.cn";
    const response = await fetch("https://opensist-auth.caoster.workers.dev/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
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
        alert("Login successfully!");
        return redirect("/");
    }
}

export async function setUserInfo(user_info) {
    Object.entries(user_info).map(async ([key, value]) => {
        await localforage.setItem(key, value)
    })
}