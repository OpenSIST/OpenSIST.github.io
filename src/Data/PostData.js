import localforage from "localforage";
import {GET_POST_CONTENT, POST_LIST} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import {getApplicants} from "./ApplicantData";

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
        console.log(posts.data)
        posts['data'] = posts['data'].sort((a, b) => new Date(b.modified) - new Date(a.modified));
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