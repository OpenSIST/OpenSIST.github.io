import univList from "./UnivList.json";
import {CACHE_EXPIRATION, clearDataCache} from "./CacheStore";

export {CACHE_EXPIRATION};

function createHeaders(contentType = 'application/json') {
    return {'Content-Type': contentType};
}

export async function apiRequest(path, {allowUnauthorized = false, body, contentType, fetchPriority, headers, ...options} = {}) {
    const response = await fetch(path, {
        method: 'POST',
        credentials: 'include',
        headers: {
            ...createHeaders(contentType),
            ...headers,
        },
        ...options,
        ...(fetchPriority ? {priority: fetchPriority} : {}),
        ...(body === undefined
            ? {}
            : {body: typeof body === 'string' ? body : JSON.stringify(body)}),
    });
    await handleErrors(response, {allowUnauthorized});
    return response;
}

export async function apiJson(path, options) {
    return (await apiRequest(path, options)).json();
}

export async function apiText(path, options) {
    return (await apiRequest(path, options)).text();
}

export async function emptyCache() {
    await clearDataCache();
}

export async function handleErrors(response, {allowUnauthorized = false} = {}) {
    /*
    * Handle the error of the response
    * @param response [Response]: response from fetch
    * @return: response
     */
    if (response.status === 401) {
        await emptyCache();
        if (allowUnauthorized) {
            return response;
        }
        if (!["/agreement", "/login", "/register", "/reset"].includes(window.location.pathname)) {
            window.location.assign("/login");
        }
        throw new Response('', {
            status: response.status,
            statusText: response.statusText,
        });
    }
    if (!response.ok) {
        const content = await response.json().catch(() => ({}));
        throw new Response('', {
            status: response.status,
            statusText: content.error ?? response.statusText,
        });
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

/**
 * Converts a UTC date string to local time.
 *
 * @param {string} dateString - UTC date string in format "YYYY-MM-DD HH:mm:ss"
 * @param {bool} dateOnly - Whether to return only the date part ("YYYY-MM-DD")
 * @returns {string} - Formatted local date string
 */
export function utcToLocal(dateString, dateOnly = false) {
    const utcString = dateString.replace(" ", "T") + "Z";
    const date = new Date(utcString);

    const pad = (n) => String(n).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return dateOnly
        ? `${year}-${month}-${day}`
        : `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
