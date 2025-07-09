import localforage from "localforage";
import {GET_CONTENT_API, LIST_POSTS_API, CREATE_POST_API, MODIFY_CONTENT_API, DELETE_CONTENT_API} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";

// const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min

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

export async function getPost(postId, isRefresh = false) {
    const posts = await getPosts(isRefresh);
    if (!posts) {
        throw new Error('Post not found');
    }
    return posts.find((post) => post.id.toString() === postId);
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

    return postContent['post']['content'];
}

export async function getPostObject(postId, isRefresh = false) {
    const post = await getPost(postId, isRefresh);
    const content = await getPostContent(postId, isRefresh);
    
    if (!post || !content) {
        throw new Error("Post or content not found");
    }
    
    return {
        ...post,
        content: content,
    };
}

/**
 * Removes a post
 */
export async function removePost(postId, author) {
    const API = DELETE_CONTENT_API;
    const requestBody = {
        contentId: postId.toString()
    };

    const response = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify(requestBody),
    });

    await handleErrors(response);

    try {
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || `API request failed for delete post.`);
        }
    } catch (e) {
        if (!response.ok) {
            throw new Error(`API request failed for delete post with status ${response.status}`);
        }
    }

    await getPosts(true);
    await localforage.removeItem(`${postId}-Content`);
}

export async function deletePostContent(postId) {
    await localforage.removeItem(`${postId}-Content`);
}

/**
 * Adds a new post or modifies an existing one
 */
export async function addModifyPost(requestData, type) {
    let API;
    let requestBody;
    const headers = await headerGenerator(true);

    if (type === 'new') {
        API = CREATE_POST_API;
        requestBody = {
            title: requestData.content.Title,
            content: requestData.content.Content,
            tags: []
        };
    } else if (type === 'edit') {
        API = MODIFY_CONTENT_API;
        requestBody = {
            contentId: requestData.PostID.toString(),
            title: requestData.content.Title,
            content: requestData.content.Content,
            tags: null
        };
    } else {
        throw new Error(`Invalid type specified for addModifyPost: ${type}`);
    }

    const response = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(requestBody),
    });

    await handleErrors(response);

    try {
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || `API request failed for ${type} post.`);
        }
    } catch (e) {
        if (!response.ok) {
            throw new Error(`API request failed for ${type} post with status ${response.status}`);
        }
    }

    await getPosts(true);
}