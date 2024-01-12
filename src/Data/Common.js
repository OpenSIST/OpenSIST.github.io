import {useNavigate} from "react-router-dom";

export async function handleErrors(response) {
    /*
    * Handle the error of the response
    * @param response [Response]: response from fetch
    * @return: response
     */
    if (response.status === 401) {
        window.location.href = "/login";
    }
    if (response.status !== 200) {
        const content = await response.json();
        throw new Error(`${content.error}, Error code: ${response.status}`)
    }
    return response;
}

export const regionMapping = {
    "US": "United States",
    "EU": "Europe",
    "UK": "United Kingdom",
    "CA": "Canada",
    "HK": "Hong Kong",
    "SG": "Singapore"
}

export const degreeOptions = [
    {value: 'MS', label: 'Master'},
    {value: 'PhD', label: 'PhD'}
]

export const majorOptions = [
    {value: 'CS', label: 'CS'},
    {value: 'EE', label: 'EE'},
    {value: 'IE', label: 'IE'}
]

export const regionOptions = [
    {value: 'US', label: `US \u{1F1FA}\u{1F1F8}`},
    {value: 'CA', label: 'CA \u{1F1E8}\u{1F1E6}'},
    {value: 'EU', label: 'EU \u{1F1EA}\u{1F1FA}'},
    {value: 'UK', label: 'UK \u{1F1EC}\u{1F1E7}'},
    {value: 'HK', label: 'HK \u{1F1ED}\u{1F1F0}'},
    {value: 'SG', label: 'SG \u{1F1F8}\u{1F1EC}'},
    {value: 'Others', label: 'Others'}
]

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