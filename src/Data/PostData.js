import {handleErrors, headerGenerator} from "./Common";
import {
    CREATE_POST_API,
    CREATE_COMMENT_API,
    MODIFY_CONTENT_API,
    TOGGLE_LIKE_API,
    LIST_POSTS_API,
    GET_CONTENT_API,
    DELETE_CONTENT_API
} from "../APIs/APIs"

export async function getPosts(query = {}) {
    const response = await fetch(LIST_POSTS_API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
    });
    await handleErrors(response);

    const postsResult = await response.json();
    postsResult['posts'] = postsResult['posts'].sort(
        (a, b) => new Date(b.updated_at ?? b.created_at) - new Date(a.updated_at ?? b.created_at)
    );
    postsResult['posts'] = postsResult['posts'].filter(
        (post) =>
            post.title.toLowerCase().includes(
                query.searchStr?.toLowerCase() ?? ""
            ) ||
            post.author.toLowerCase().includes(
                query.searchStr?.toLowerCase() ?? ""
            )
    );
    return postsResult['posts'];
}

export async function getPost(postId) {
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
            throw new Error('Post not found');
        }
        throw e;
    }
    const postResult = await response.json();
    return postResult["post"];
}

export async function getPostObject(postId) {
    const post = await getPost(postId);
    const content = post['content'];

    if (!post || !content) {
        throw new Error("Post or content not found");
    }

    return {
        ...post,
        content: content,
    };
}

/**
 * Toggle like on a post or a comment.
 */
export async function toggleLikeContent(contentId) {
    const requestBody = {
        contentId: contentId.toString()
    };

    const response = await fetch(TOGGLE_LIKE_API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify(requestBody),
    });

    await handleErrors(response);

    try {
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || `API request failed for toggling content like.`);
        }
    } catch (e) {
        if (!response.ok) {
            throw new Error(`API request failed for toggling content like with status ${response.status}`);
        }
    }
}

/**
 * Remove a post or a comment.
 */
export async function removeContent(contentId) {
    const requestBody = {
        contentId: contentId.toString()
    };

    const response = await fetch(DELETE_CONTENT_API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify(requestBody),
    });

    await handleErrors(response);

    try {
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || `API request failed for content deletion.`);
        }
    } catch (e) {
        if (!response.ok) {
            throw new Error(`API request failed for content deletion with status ${response.status}`);
        }
    }
}

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
}

export async function addComment(parentId, commentContent) {
    let requestBody = {
        parentId: parentId,
        content: commentContent,
    };

    const response = await fetch(CREATE_COMMENT_API, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify(requestBody),
    });

    await handleErrors(response);

    try {
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || `API request failed for creating comment.`);
        }
    } catch (e) {
        if (!response.ok) {
            throw new Error(`API request failed for creating comment with status ${response.status}`);
        }
    }
}