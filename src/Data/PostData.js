import localforage from "localforage";
import {ADD_POST, GET_POST_CONTENT, MODIFY_POST, POST_LIST, REMOVE_POST} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import {getApplicant, getApplicants, setApplicant} from "./ApplicantData";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min

export async function getPosts(isRefresh = false) {
    const applicants = await getApplicants(isRefresh);
    let posts = await localforage.getItem('posts');
    if (isRefresh || posts === null || (Date.now() - posts.Date) > CACHE_EXPIRATION) {
        const response = await fetch(POST_LIST, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
        });
        await handleErrors(response);
        posts = await response.json();
        posts['data'] = posts['data'].map((post) => {
            const applicant = applicants.find((applicant) => applicant?.Posts?.includes(post.PostID));
            if (applicant) {
                post.Author = applicant.ApplicantID;
            }
            return post;
        });
        // TODO: potential problem of asynchronized cache
        await setPosts(posts['data']);
    }
    posts['data'] = posts['data'].sort((a, b) => new Date(b.modified) - new Date(a.modified));
    return posts['data'];
}

export async function setPosts(posts) {
    if (!posts) {
        return;
    }
    posts = {'data': posts, 'Date': Date.now()};
    await localforage.setItem('posts', posts);
}

export async function getPost(postId, isRefresh = false) {
    const posts = await getPosts(isRefresh);
    // TODO: when the post is not found
    return posts.find((post) => post.PostID === postId);
}

export async function setPost(post) {
    if (!post) {
        return;
    }
    const posts = await getPosts();
    const index = posts.findIndex((p) => p.PostID === post.PostID);
    if (index !== -1) {
        posts[index] = post;
    } else {
        posts.push(post);
    }
    await setPosts(posts);
}

export async function getPostContent(postId, isRefresh = false) {
    let postContent = await localforage.getItem(`${postId}-Content`);
    if (isRefresh || postContent === null || (Date.now() - postContent.Date) > CACHE_EXPIRATION) {
        const response = await fetch(GET_POST_CONTENT, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({PostID: postId}),
        });
        // TODO: follow the same pattern as getProgramDesc
        await handleErrors(response);
        postContent = await response.json();
        await setPostContent(postId, postContent['content']);
    }
    return postContent['content'];
}

export async function setPostContent(postId, content) {
    if (!content) {
        return;
    }
    content = {'content': content, 'Date': Date.now()};
    await localforage.setItem(`${postId}-Content`, content);
}

export async function getPostObject(postId, isRefresh = false) {
    const post = await getPost(postId, isRefresh);
    const content = await getPostContent(postId, isRefresh);
    return {
        ...post,
        Content: content,
    };
}

export async function setPostObject(postObj) {
    if (!postObj) {
        return;
    }
    await setPostContent(postObj.PostID, postObj.Content);
    delete postObj.Content;
    await setPost(postObj)
}

export async function removePost(postId, author) {
    const response = await fetch(REMOVE_POST, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({PostID: postId}),
    });
    await handleErrors(response);
    await deletePostContent(postId);
    const applicant = await getApplicant(author);
    applicant.Posts = applicant.Posts.filter((post) => post !== postId);
    await setApplicant(applicant);
    const posts = await getPosts();
    await setPosts(posts.filter((post) => post.PostID !== postId));
}

export async function deletePostContent(postId) {
    await localforage.removeItem(`${postId}-Content`);
}

export async function addModifyPost(requestBody, type) {
    const API = type === 'new' ? ADD_POST : MODIFY_POST;
    console.log(requestBody, type, API)
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
        await setPostObject(postObj);
        const applicant = await getApplicant(postObj.Author);
        applicant.Posts.push(postId);
        await setApplicant(applicant);
    } else if (type === 'edit') {
        let postObj = await getPostObject(requestBody.PostID);
        postObj.Title = requestBody.content.Title;
        postObj.Content = requestBody.content.Content;
        postObj.modified = Date.now();
        await setPostObject(postObj);
    }
}