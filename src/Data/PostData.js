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

export async function setPosts(posts) {
    if (!posts) {
        return;
    }
    posts = {'data': posts, 'Date': Date.now()};
    await localforage.setItem('posts', posts);
}

export async function getPost(postId, isRefresh = false) {
    const posts = await getPosts(isRefresh);
    // console.log("POST ID: ", postId);
    // console.log("POSTS: ", posts);
    if (!posts) {
        throw new Error('Post not found');
    }
    return posts.find((post) => post.id.toString() === postId);
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
    // console.log("POST CONTENT: ", postContent);
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
    console.log("[PostData] Getting post object:", postId);
    console.log("[PostData] Post data:", post);
    console.log("[PostData] Content data:", content);
    
    if (!post || !content) {
        throw new Error("Post or content not found");
    }
    
    return {
        ...post,
        content: content,
    };
}

export async function setPostObject(postObj) {
    if (!postObj) {
        return;
    }
    console.log("[PostData] Setting post object:", postObj);
    
    if (postObj.content) {
        await setPostContent(postObj.id, postObj.content);
    }
    
    // 更新缓存中的帖子数据
    const posts = await getPosts(false);
    const index = posts.findIndex(p => p.id === postObj.id);
    
    if (index !== -1) {
        posts[index] = { ...posts[index], ...postObj };
        await setPosts(posts);
    }
}

/**
 * Removes a post using the new DELETE_CONTENT_API.
 * @param {string} postId - The ID of the post to remove.
 * @param {string} author - The author's display name (may not be needed if backend uses auth context).
 */
export async function removePost(postId, author) {
    const API = DELETE_CONTENT_API;
    const requestBody = {
        contentId: postId.toString()
    };
    console.log(`[PostData] Sending delete post request to ${API}:`, requestBody);

    const response = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify(requestBody),
    });

    await handleErrors(response);

    try {
        const result = await response.json();
        console.log(`[PostData] Delete post response from ${API}:`, result);
        if (!result.success) {
            throw new Error(result.error || `API request failed for delete post.`);
        }
    } catch (e) {
        console.log(`[PostData] Delete post response from ${API}: No JSON content or error reading JSON. Status: ${response.status}`);
        if (!response.ok) {
            throw new Error(`API request failed for delete post with status ${response.status}`);
        }
    }

    await getPosts(true);
    await localforage.removeItem(`${postId}-Content`);
}

export async function deletePostContent(postId) {
    // This function is likely no longer needed as deletion is handled by MODIFY_CONTENT_API
    console.warn("[PostData] deletePostContent is deprecated and likely no longer needed.");
    await localforage.removeItem(`${postId}-Content`);
}

/**
 * Adds a new post or modifies an existing one using the new API endpoints.
 * @param {object} requestData - Data for the request.
 * For new posts: { content: { Title: string, Content: string }, ApplicantID: string } (ApplicantID might be unused if backend uses auth context)
 * For editing posts: { PostID: string, content: { Title: string, Content: string } }
 * @param {'new' | 'edit'} type - The type of operation.
 */
export async function addModifyPost(requestData, type) {
    let API;
    let requestBody;
    const headers = await headerGenerator(true);

    if (type === 'new') {
        API = CREATE_POST_API; // Use /api/post/create_post
        // API Spec: { title: string, content: string, tags: array } 
        // Assuming backend infers author from auth token.
        // Using empty tags array for now.
        requestBody = {
            title: requestData.content.Title,
            content: requestData.content.Content,
            tags: [] // Defaulting to empty tags
        };
        console.log(`[PostData] Sending ${type} post request to ${API}:`, requestBody);
    } else if (type === 'edit') {
        API = MODIFY_CONTENT_API; // Use /api/post/modify_content
        // API Spec: { contentId: string, title: string|null, content: string, tags: array|null }
        requestBody = {
            contentId: requestData.PostID.toString(), // Ensure it's a string
            title: requestData.content.Title,
            content: requestData.content.Content,
            tags: null // Setting tags to null for modification as we don't handle them yet
        };
        console.log(`[PostData] Sending ${type} post request to ${API}:`, requestBody);
    } else {
        throw new Error(`Invalid type specified for addModifyPost: ${type}`);
    }

    const response = await fetch(API, {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(requestBody),
    });

    await handleErrors(response); // Check for HTTP errors

    try {
        const result = await response.json();
        console.log(`[PostData] ${type} post response from ${API}:`, result);
        if (!result.success) {
            throw new Error(result.error || `API request failed for ${type} post.`);
        }
    } catch (e) {
        // Handle cases where response might not be JSON or success field is missing
        console.log(`[PostData] ${type} post response from ${API}: No JSON content or error reading JSON.`);
        // Even if no JSON, a 2xx status means success, so we proceed to refresh
    }

    // Refresh the posts list from the server to ensure UI consistency
    // This is necessary for 'new' posts to get the generated ID and details,
    // and simplest for 'edit'/'delete' as well.
    await getPosts(true);

    // Note: Manual cache updates removed in favor of refreshing the list.
}