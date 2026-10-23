import {ADD_MODIFY_FILE, GET_FILE_CONTENT, REMOVE_FILE} from "../APIs/APIs";
import {apiRequest} from "./Common";
import {removeCacheValue} from "./CacheStore";

export async function getFileContent(fileId) {
    const response = await apiRequest(GET_FILE_CONTENT, {body: {PostID: fileId}});
    const blob = await response.blob();
    const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], {type: "application/pdf"});
    return URL.createObjectURL(pdfBlob);
}

export async function addModifyFile(requestBody) {
    await apiRequest(ADD_MODIFY_FILE, {body: requestBody});
    await removeCacheValue("applicants");
}

export async function removeFile(fileId) {
    await apiRequest(REMOVE_FILE, {body: {PostID: fileId}});
    await removeCacheValue("applicants");
}
