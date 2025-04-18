import localforage from "localforage";
import {ADD_POST, GET_CONTENT_API, MODIFY_POST, REMOVE_POST, LIST_POSTS_API} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import {getApplicant, setApplicant} from "./ApplicantData";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min

export async function getPosts(isRefresh = false, query = {}) {


    const response = await fetch(LIST_POSTS_API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
    });
    
    await handleErrors(response);
    const posts = await response.json();

    posts['posts'] = posts['posts'].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    return posts['posts'];
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
    if (!posts) {
        throw new Error('Post not found');
    }
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
    const response = await fetch(GET_CONTENT_API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({postId}),
    });
    try {
        await handleErrors(response);
    } catch (e) {
        if (e.status === 404) {
            await getPosts(true);
        }
        throw e;
    }
    const postContent = await response.json();
    console.log("POST CONTENT: ", postContent);
    await setPostContent(postId, postContent['post']['content']);

    return postContent['post']['content'];
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
    
    console.log("CONTENT: ", content);
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
        if (!applicant.Posts) {
            applicant.Posts = [];
        }
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