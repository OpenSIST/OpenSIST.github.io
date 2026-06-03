import {apiJson, apiRequest} from "./Common";
import {CREATE_COMMENT_API, CREATE_POST_API, DELETE_CONTENT_API, GET_CONTENT_API, LIST_POSTS_API, MODIFY_CONTENT_API, TOGGLE_LIKE_API} from "../APIs/APIs"

function normalizeTags(tags) {
    if (Array.isArray(tags)) {
        return tags;
    }
    if (typeof tags !== "string") {
        return [];
    }
    try {
        const parsedTags = JSON.parse(tags || "[]");
        return Array.isArray(parsedTags) ? parsedTags : [];
    } catch {
        return [];
    }
}

function normalizePostContent(content) {
    if (!content) {
        return content;
    }
    return {
        ...content,
        id: content.id?.toString(),
        parentId: (content.parentId ?? content.parent_id)?.toString(),
        tags: normalizeTags(content.tags),
        like_count: content.like_count ?? 0,
        liked: Boolean(content.liked),
        is_deleted: Boolean(content.is_deleted),
    };
}

export async function getPosts(query = {}) {
    const postsResult = await apiJson(LIST_POSTS_API);
    const searchTerm = query.searchStr?.toLowerCase() ?? "";
    return [...(postsResult.posts ?? [])].map(normalizePostContent).sort(
        (a, b) => new Date(b.updated_at ?? b.created_at) - new Date(a.updated_at ?? a.created_at)
    ).filter(
        (post) =>
            (post.title ?? "").toLowerCase().includes(searchTerm) ||
            (post.author ?? "").toLowerCase().includes(searchTerm) ||
            post.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
}

export async function getPostThread(postId) {
    try {
        const postResult = await apiJson(GET_CONTENT_API, {body: {postId}});
        return {
            post: normalizePostContent(postResult.post),
            comments: (postResult.comments ?? []).map(normalizePostContent),
        };
    } catch (e) {
        if (e.status === 404) {
            throw new Error('Post not found');
        }
        throw e;
    }
}

export async function getPost(postId) {
    return (await getPostThread(postId)).post;
}

export async function getPostObject(postId) {
    const post = await getPost(postId);
    if (!post) {
        throw new Error("Post not found");
    }

    return post;
}

/**
 * Toggle like on a post or a comment.
 */
export async function toggleLikeContent(contentId) {
    const requestBody = {
        contentId: contentId.toString()
    };

    await requestSuccessfulMutation(TOGGLE_LIKE_API, requestBody, 'toggling content like');
}

/**
 * Remove a post or a comment.
 */
export async function removeContent(contentId) {
    const requestBody = {
        contentId: contentId.toString()
    };

    await requestSuccessfulMutation(DELETE_CONTENT_API, requestBody, 'content deletion');
}

export async function addModifyPost(requestData, type) {
    let API;
    let requestBody;
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
            tags: []
        };
    } else {
        throw new Error(`Invalid type specified for addModifyPost: ${type}`);
    }

    await requestSuccessfulMutation(API, requestBody, `${type} post`);
}

export async function addComment(parentId, commentContent) {
    const requestBody = {
        parentId: parentId.toString(),
        content: commentContent,
    };

    await requestSuccessfulMutation(CREATE_COMMENT_API, requestBody, 'creating comment');
}

async function requestSuccessfulMutation(API, requestBody, action) {
    const response = await apiRequest(API, {body: requestBody});
    try {
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || `API request failed for ${action}.`);
        }
    } catch (error) {
        if (error instanceof SyntaxError && response.ok) {
            return;
        }
        throw error;
    }
}
