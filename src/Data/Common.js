import univList from "./UnivList.json";
import localforage from "localforage";

export async function headerGenerator(auth = false) {
    /*
    * Generate the header for fetch
    * @param auth [boolean]: whether the request is authenticated
    * @return: header
     */
    const header = {
        'Content-Type': 'application/json',
        'Connection': 'close',
    }
    const session = await localforage.getItem('session');
    // console.log(session)
    if (auth) {
        header['Authorization'] = `Bearer ${session}`;
    }
    return header;
}

export async function handleErrors(response) {
    /*
    * Handle the error of the response
    * @param response [Response]: response from fetch
    * @return: response
     */
    if (response.status === 401) {
        window.location.href = "/login";
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

export const colorMapping = [
    {label: 'US \u{1F1FA}\u{1F1F8}', color: 'rgb(21,168,47)'},
    {label: 'CA \u{1F1E8}\u{1F1E6}', color: 'rgb(25,35,185)'},
    {label: 'EU \u{1F1EA}\u{1F1FA}', color: 'rgb(67,144,213)'},
    {label: 'UK \u{1F1EC}\u{1F1E7}', color: 'rgb(227,195,68)'},
    {label: 'HK \u{1F1ED}\u{1F1F0}', color: 'rgb(234,64,95)'},
    {label: 'SG \u{1F1F8}\u{1F1EC}', color: 'rgb(220,126,49)'},
    {label: 'Others', color: 'rgb(128,128,128)'},
    {label: 'CS', color: 'rgb(21,168,47)'},
    {label: 'EE', color: 'rgb(67,144,213)'},
    {label: 'IE', color: 'rgb(220,126,49)'},
]

export const regionFlagMapping = {
    "US": "\u{1F1FA}\u{1F1F8}",
    "EU": "\u{1F1EA}\u{1F1FA}",
    "UK": "\u{1F1EC}\u{1F1E7}",
    "CA": "\u{1F1E8}\u{1F1E6}",
    "HK": "\u{1F1ED}\u{1F1F0}",
    "SG": "\u{1F1F8}\u{1F1EC}",
    'Others': ''
}

export const univAbbrFullNameMapping = univList.reduce((acc, univ) => {
    acc[univ.abbr] = univ.fullName;
    return acc;
}, {});