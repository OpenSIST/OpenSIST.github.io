import {ADD_FILE, FILE_LIST, GET_FILE_CONTENT, MODIFY_FILE, REMOVE_FILE} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import {getApplicant, setApplicant} from "./ApplicantData";

export async function getFiles(isRefresh = false, query = {}) {
    const response = await fetch(FILE_LIST, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
    });
    await handleErrors(response);
    let files = await response.json();
    files['data'] = files['data'].sort((a, b) => new Date(b.modified) - new Date(a.modified));
    return files['data'];
}
export async function getFile(fileId, isRefresh = false) {
    const files = await getFiles();
    if (!files) {
        throw new Error('Post not found');
    }
    console.log(files)
    return files.find((file) => file.PostID.toString() === fileId);
}

export async function getFileObject(fileId, isRefresh = false) {
    const file = await getFile(fileId, isRefresh);
    const content = await getFileContent(fileId, isRefresh);
    return {
        ...file,
        Content: content,
    };
}

export async function getFileContent(fileId, isRefresh = false) {
    console.log(fileId)
    const response = await fetch(GET_FILE_CONTENT, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({PostID: fileId}),
    });
    await handleErrors(response);

    const fileContent = await response.json();
    console.log(fileContent);

    return fileContent['content'];
}


export async function addModifyFile(requestBody, type) {
    const API = type === 'new' ? ADD_FILE : MODIFY_FILE;
    const response = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify(requestBody),
    });
    await handleErrors(response);
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
        if (!applicant.Posts) {
            applicant.Posts = [];
        }
        applicant.Posts.push(postId);
        await setApplicant(applicant);
    }
}

export async function removeFile(fileId, author) {
    const response = await fetch(REMOVE_FILE, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({PostID: fileId}),
    });
    await handleErrors(response);
    const applicant = await getApplicant(author);
    applicant.Posts = applicant.Posts.filter((post) => post !== fileId);
    await setApplicant(applicant);
}