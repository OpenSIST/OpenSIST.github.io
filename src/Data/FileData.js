import {ADD_FILE, FILE_LIST, GET_FILE_CONTENT, MODIFY_FILE, REMOVE_FILE} from "../APIs/APIs";
import {apiJson, apiRequest} from "./Common";
import {getApplicant, setApplicant} from "./ApplicantData";

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
    const response = await apiRequest(endpoint, {body: requestBody});
    if (type === 'new') {
        const postId = (await response.json()).PostID;
        const postObj = {
            Title: requestBody.content.Title,
            PostID: postId,
            Author: requestBody.ApplicantID,
            type: requestBody.content.type,
            created: Date.now(),
            modified: Date.now()
        };
        const applicant = await getApplicant(postObj.Author);
        await setApplicant({...applicant, Posts: [...(applicant.Posts ?? []), postId]});
    }
}

export async function removeFile(fileId, author) {
    await apiRequest(REMOVE_FILE, {body: {PostID: fileId}});
    const applicant = await getApplicant(author);
    await setApplicant({
        ...applicant,
        Posts: applicant.Posts.filter((post) => post.toString() !== fileId.toString()),
    });
}
