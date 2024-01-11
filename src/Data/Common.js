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
