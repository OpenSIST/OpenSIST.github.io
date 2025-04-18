import univList from "./UnivList.json";
import localforage from "localforage";

export async function headerGenerator(auth = false, contentType = 'application/json') {
    /*
    * Generate the header for fetch
    * @param auth [boolean]: whether the request is authenticated
    * @return: header
     */
    return {
        'Content-Type': contentType,
        'Connection': 'close',
        'X-Content-Type-Options': 'nosniff'
    };
}

export async function emptyCache() {
    /*
    * Empty the cache
     */
    const theme = await localforage.getItem('theme');
    await localforage.clear();
    if (theme) {
        await localforage.setItem('theme', theme);
    }
}

export async function handleErrors(response) {
    /*
    * Handle the error of the response
    * @param response [Response]: response from fetch
    * @return: response
     */
    if (response.status === 401) {
        if (window.location.pathname === "/agreement") {
            return;
        }
        if (!["/login", "/register", "/reset"].includes(window.location.pathname)) {
            window.location.href = "/login";
        }
        await emptyCache();
        return;
    }
    if (response.status !== 200) {
        const content = await response.json();
        throw new Response('', {
            status: response.status,
            statusText: content.error,
        })
    }
    return response;
}

export function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export const univAbbrFullNameMapping = univList.reduce((acc, univ) => {
    acc[univ.abbr] = univ.fullName;
    return acc;
}, {});

export const univColorMapping = univList.reduce((acc, univ) => {
    acc[univ.abbr] = univ.color;
    return acc;
}, {});

export async function loadMarkDown(path) {
    const response = await fetch(path);
    return await response.text();
}