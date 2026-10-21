import {ADD_FILE, FILE_LIST, GET_FILE_CONTENT, MODIFY_FILE, REMOVE_FILE} from "../APIs/APIs";
import {apiJson, apiRequest} from "./Common";
import {removeCacheValue} from "./CacheStore";

export async function getFiles() {
    const files = await apiJson(FILE_LIST);
    return files.data ?? [];
}

export async function getFile(fileId) {
    const files = await getFiles();
    const file = files.find((currentFile) => currentFile.PostID.toString() === fileId.toString());
    if (!file) {
        throw new Error('File not found');
    }
    return file;
}

export async function getFileObject(fileId) {
    const file = await getFile(fileId);
    const content = await getFileContent(fileId);
    return {
        ...file,
        Content: content,
    };
}

export async function getFileContent(fileId) {
    const response = await apiRequest(GET_FILE_CONTENT, {body: {PostID: fileId}});
    const blob = await response.blob();
    const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], {type: "application/pdf"});
    return URL.createObjectURL(pdfBlob);
}

export async function addModifyFile(requestBody, type) {
    const endpoint = {new: ADD_FILE, edit: MODIFY_FILE}[type];
    if (!endpoint) {
        throw new Error(`Invalid file mutation type: ${type}`);
    }
    await apiRequest(endpoint, {body: requestBody});
    await removeCacheValue("applicants");
}

export async function removeFile(fileId) {
    await apiRequest(REMOVE_FILE, {body: {PostID: fileId}});
    await removeCacheValue("applicants");
}
