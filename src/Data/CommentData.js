import localforage from 'localforage'; // Import localforage
import { getDisplayName } from './UserData'; // Use getDisplayName
// Import NEW API endpoints
import { 
    GET_CONTENT_API, 
    CREATE_COMMENT_API, 
    TOGGLE_LIKE_API, 
    MODIFY_CONTENT_API 
} from '../APIs/APIs'; // Import API endpoints
import { headerGenerator, handleErrors } from './Common'; // Import common utilities

// const COMMENT_KEY = 'comments'; // No longer primary storage, only fallback for getComments if API fails initially
const COMMENT_CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes cache expiration

// --- Comment Schema --- (Informal)
// {
//     commentId: string (uuid),
//     postId: string,
//     author: string (e.g., 'user display name'),
//     content: string,
//     timestamp: number (Date.now()),
//     parentId: string | null (for replies),
//     targetAuthor: string | null, // Author of the parent comment, if it's a reply
//     likes: number,
//     likedBy: string[], // Array of user display names who liked this comment
//     isDeleted: boolean // Whether this comment has been soft-deleted
// }

// --- Helper function to map API comment structure to frontend structure ---
// API structure: { id, parentId, type, title, content, author, tags, like_count, is_deleted, created_at, updated_at }
// Frontend structure: { commentId, postId, author, content, timestamp, parentId, targetAuthor, likes, likedBy, isDeleted, modified }
const mapApiCommentToFrontend = (apiComment, allComments = [], originalPostId) => {
    if (!apiComment || (apiComment.type !== 'comment' && apiComment.type !== 'subcomment')) { // Ensure it's a comment
        return null; 
    }

    const parentComment = allComments.find(c => c.id === apiComment.parent_id);
    const targetAuthor = parentComment ? parentComment.author : null;
    
    // Check if the parentId is the original postId, indicating a root comment
    const frontendParentId = apiComment.parent_id === originalPostId ? null : apiComment.parent_id;

    return {
        commentId: apiComment.id, // Map id -> commentId
        postId: originalPostId, // Add original postId
        author: apiComment.author,
        content: apiComment.content,
        timestamp: new Date(apiComment.created_at).getTime(), // Map created_at -> timestamp (number)
        parentId: frontendParentId, // Use derived parentId (null for root)
        targetAuthor: targetAuthor, // Add targetAuthor based on parent
        likes: apiComment.like_count, // Map like_count -> likes
        likedBy: [], // API doesn't provide this, initialize as empty. Like status needs UI handling.
        isDeleted: apiComment.is_deleted, // Map is_deleted -> isDeleted
        modified: new Date(apiComment.updated_at).getTime(), // Map updated_at -> modified (number)
        comment_type: apiComment.type, // Add comment_type field
        // Remove pendingSync flags as offline actions are removed
    };
};

/**
 * Fetches all comments for a specific post using the new API.
 * @param {string} postId - The ID of the post.
 * @param {boolean} forceRefresh - Whether to bypass cache.
 * @returns {Promise<Array<object>>} - A promise resolving to an array of frontend-formatted comment objects.
 */
export async function getComments(postId, forceRefresh = false) {
    if (!postId) {
        console.error("getComments called without postId");
        return [];
    }
    
    const cacheKey = `post-content-${postId}`; // Use a different key for content
    
    // if (!forceRefresh) {
    //     try {
    //         const cachedData = await localforage.getItem(cacheKey);
    //         if (cachedData && (Date.now() - cachedData.timestamp) < COMMENT_CACHE_EXPIRATION) {
    //             // Ensure cached data is in the correct frontend format
    //             // Re-run mapping if needed or assume it was stored correctly
    //             return cachedData.comments; 
    //         }
    //     } catch (cacheError) {
    //         console.error("Error reading comment cache:", cacheError);
    //     }
    // }
    try {
        // Fetch from server using GET_CONTENT_API
        const response = await fetch(GET_CONTENT_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ postId }) // API expects postId
        });
        // console.log("Post_ID: ", postId);
        // console.log("Response: ", response);
        
        await handleErrors(response);
        const result = await response.json();

        if (!result.success || !Array.isArray(result.comments)) {
             throw new Error(result.error || 'Failed to fetch comments or invalid format');
        }

        // Filter out the actual post if it's included, keep only comments
        // And map API response to frontend format
        const apiComments = result.comments.filter(item => item.type === 'comment' || item.type === 'subcomment');
        // console.log("API Comments: ", apiComments);
        const frontendComments = apiComments
            .map(apiComment => mapApiCommentToFrontend(apiComment, apiComments, postId))
            .filter(comment => comment !== null); // Filter out any null results from mapping
        
        // Update cache with frontend-formatted comments
        await localforage.setItem(cacheKey, {
            comments: frontendComments,
            timestamp: Date.now()
        });
        // console.log("Frontend Comments: ", frontendComments);
        return frontendComments.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error("Error fetching comments from server:", error);
        
        // Fallback to local cache if available (even if expired)
        try {
            const cachedData = await localforage.getItem(cacheKey);
            if (cachedData && cachedData.comments) {
                console.warn("Using expired/stale cached comments data as fallback");
                return cachedData.comments;
            }
        } catch (fallbackError) {
             console.error("Error reading comment cache during fallback:", fallbackError);
        }
        
        // If absolutely no cache, return empty
        return []; 
    }
}

/**
 * Adds a new comment using the new API.
 * @param {object} commentData - The comment data.
 * @param {string} commentData.postId - The ID of the post being commented on.
 * @param {string} commentData.content - The content of the comment.
 * @param {string | null} [commentData.parentId=null] - The ID of the parent comment if it's a reply.
 * @returns {Promise<void>} - Resolves when the operation is complete (doesn't return the new comment).
 */
export async function addComment({ postId, content, parentId }) {
    const authorDisplayName = await getDisplayName(); // Still need this for potential errors
    if (!authorDisplayName) {
        throw new Error('User not logged in or display name not found.');
    }
    if (!content || !content.trim()) {
        throw new Error('Comment content cannot be empty.');
    }
    if (!postId) {
        throw new Error('Post ID is required to add a comment.');
    }

    // Determine the parentId for the API call
    // If parentId from frontend is null, it's a root comment, API parent is the postId
    // Otherwise, it's a reply, API parent is the parent comment's id
    console.log("POST ID: ", postId);
    console.log("PARENT ID: ", parentId);
    const apiParentId = parentId === null ? postId : parentId;
    
    // Ensure apiParentId is never null if postId is valid
    if (!apiParentId) {
         throw new Error('Cannot determine parent ID for comment creation.');
    }

    console.log("API Parent ID: ", apiParentId);
    try {
        // Send to server using CREATE_COMMENT_API
        const response = await fetch(CREATE_COMMENT_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({
                // API expects parentId (post or comment id) and content
                parentId: apiParentId.toString(), 
                content: content.trim()
            })
        });
        
        await handleErrors(response);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to create comment on server.');
        }
        
        // **Important**: API does not return the new comment object.
        // We MUST force a refresh in the component after this call.
        // We also invalidate the cache here so the refresh gets new data.
        const cacheKey = `post-content-${postId}`;
        await localforage.removeItem(cacheKey);

    } catch (error) {
        console.error("Error adding comment via API:", error);
        // Re-throw the error to be handled by the UI component
        throw error; 
        // NOTE: Offline fallback for adding comments removed due to API limitations (no new ID returned).
    }
}

/**
 * Likes/unlikes a comment using the new API.
 * @param {string} commentId - The ID of the comment to like/unlike.
 * @param {string} postId - The ID of the post the comment belongs to (needed for cache invalidation).
 * @returns {Promise<void>} - Resolves when the operation is complete.
 */
export async function toggleLikeComment(commentId, postId) { // Added postId parameter
    if (!commentId) {
        throw new Error('Comment ID is required for like toggle');
    }
     if (!postId) {
        // Need postId to invalidate cache correctly after operation
        console.error("Post ID is required to toggle like and invalidate cache.");
        throw new Error('Post ID is required for like toggle');
    }

    const currentUser = await getDisplayName();
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    try {
        // Send like/unlike to server using TOGGLE_LIKE_API
        const response = await fetch(TOGGLE_LIKE_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ contentId: commentId }) // API expects contentId
        });
        
        await handleErrors(response);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to toggle like on server.');
        }
        
        // **Important**: API does not return the updated comment state.
        // We MUST force a refresh in the component after this call.
        // Invalidate the cache.
        const cacheKey = `post-content-${postId}`;
        await localforage.removeItem(cacheKey);
        
        // Cannot reliably return the new liked state. Component must rely on refresh.
        // return result.isLiked; // This field doesn't exist in the new API response

    } catch (error) {
        console.error("Error toggling like via API:", error);
        // Re-throw error for UI handling
        throw error;
        // NOTE: Offline fallback for like toggle removed.
    }
}

/**
 * Deletes a comment using the modify API (marks as deleted).
 * @param {string} commentId - The ID of the comment to delete.
 * @param {string} postId - The ID of the post the comment belongs to (needed for cache invalidation).
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId, postId) { // Added postId parameter
    if (!commentId) {
        throw new Error('Comment ID is required for deletion');
    }
     if (!postId) {
        console.error("Post ID is required to delete comment and invalidate cache.");
        throw new Error('Post ID is required for deletion');
    }

    const currentUser = await getDisplayName();
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    try {
        // Send delete request using MODIFY_CONTENT_API
        // We'll mark it as deleted by setting content to a specific marker
        // or potentially an 'is_deleted' flag if the backend supports it via modify.
        // Assuming setting content to '[deleted]' for now. Title/Tags are null for comments.
        const response = await fetch(MODIFY_CONTENT_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ 
                contentId: commentId, 
                // title: null, // Not applicable for comment
                content: '[评论已删除]', // Mark content as deleted
                tags: null // Not applicable for comment
                // If backend preferred marking via a flag:
                // is_deleted: true 
            })
        });
        
        await handleErrors(response);
        const result = await response.json();

         if (!result.success) {
            // Handle specific errors like 403 Unauthorized, 404 Not Found
            if (response.status === 403) {
                 throw new Error('Unauthorized to delete this comment.');
            }
             if (response.status === 404) {
                 throw new Error('Comment not found or already deleted.');
            }
            throw new Error(result.error || 'Failed to delete comment on server.');
        }
        
        // **Important**: API confirms modification success.
        // We MUST force a refresh in the component.
        // Invalidate the cache.
        const cacheKey = `post-content-${postId}`;
        await localforage.removeItem(cacheKey);
        
    } catch (error) {
        console.error("Error deleting comment via API:", error);
        // Re-throw for UI handling
        throw error;
        // NOTE: Offline fallback for delete removed.
    }
}

// Removed syncPendingComments as offline actions are no longer supported for mutations.
// Helper function updateCommentCache is also removed as mutations invalidate cache instead. 