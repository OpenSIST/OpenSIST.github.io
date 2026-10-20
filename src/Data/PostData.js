import {apiJson, apiRequest} from "./Common";
import {CREATE_COMMENT_API, CREATE_POST_API, DELETE_CONTENT_API, GET_CONTENT_API, LIST_POSTS_API, MODIFY_CONTENT_API, TOGGLE_LIKE_API} from "../APIs/APIs"

export const POST_CONTENT_MAX_BYTES = 20 * 1024 * 1024;
export const POST_TITLE_MAX_LENGTH = 200;

const textEncoder = new TextEncoder();

export function getUtf8ByteLength(value = "") {
    return textEncoder.encode(value ?? "").byteLength;
}

export function formatPostContentSize(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function assertPostContentWithinLimit(content) {
    const size = getUtf8ByteLength(content);
    if (size > POST_CONTENT_MAX_BYTES) {
        throw new Error(`Post content cannot exceed ${formatPostContentSize(POST_CONTENT_MAX_BYTES)}.`);
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
            (post.author ?? "").toLowerCase().includes(searchTerm)
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
    const title = requestData.content.Title?.toString().trim() ?? "";
    if (!title) {
        throw new Error("Post title is required.");
    }
    if (title.length > POST_TITLE_MAX_LENGTH) {
        throw new Error(`Post title cannot exceed ${POST_TITLE_MAX_LENGTH} characters.`);
    }
    assertPostContentWithinLimit(requestData.content.Content);
    if (type === 'new') {
        API = CREATE_POST_API;
        requestBody = {
            title,
            content: requestData.content.Content,
        };
    } else if (type === 'edit') {
        API = MODIFY_CONTENT_API;
        requestBody = {
            contentId: requestData.PostID.toString(),
            title,
            content: requestData.content.Content,
        };
    } else {
        throw new Error(`Invalid type specified for addModifyPost: ${type}`);
    }

    await requestSuccessfulMutation(API, requestBody, `${type} post`);
}

export async function addComment(parentId, commentContent) {
    assertPostContentWithinLimit(commentContent);
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
