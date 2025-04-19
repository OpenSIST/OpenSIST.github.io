import localforage from 'localforage'; // Import localforage
import { getDisplayName } from './UserData'; // Use getDisplayName
// Import NEW API endpoints
import { 
    GET_CONTENT_API, 
    CREATE_COMMENT_API, 
    TOGGLE_LIKE_API, 
    MODIFY_CONTENT_API, 
    DELETE_CONTENT_API 
} from '../APIs/APIs'; // Import API endpoints
import { headerGenerator, handleErrors } from './Common'; // Import common utilities

// const COMMENT_KEY = 'comments'; // No longer primary storage, only fallback for getComments if API fails initially
// const COMMENT_CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes cache expiration

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
//     liked: boolean, // Whether the current user has liked this comment
//     isDeleted: boolean // Whether this comment has been soft-deleted
// }

/**
 * Helper function to map API comment structure to frontend structure
 */
const mapApiCommentToFrontend = (apiComment, allComments = [], originalPostId) => {
    if (!apiComment || (apiComment.type !== 'comment' && apiComment.type !== 'subcomment')) {
        return null; 
    }

    const parentComment = allComments.find(c => c.id === apiComment.parent_id);
    const targetAuthor = parentComment ? parentComment.author : null;
    const frontendParentId = apiComment.parent_id === originalPostId ? null : apiComment.parent_id;

    return {
        commentId: apiComment.id,
        postId: originalPostId,
        author: apiComment.author,
        content: apiComment.content,
        timestamp: new Date(apiComment.created_at).getTime(),
        parentId: frontendParentId,
        targetAuthor: targetAuthor,
        likes: apiComment.like_count,
        liked: apiComment.liked,
        isDeleted: apiComment.is_deleted,
        modified: new Date(apiComment.updated_at).getTime(),
        comment_type: apiComment.type,
    };
};

/**
 * Fetches all comments for a specific post
 */
export async function getComments(postId, forceRefresh = false) {
    if (!postId) {
        console.error("getComments called without postId");
        return [];
    }
    
    const cacheKey = `post-content-${postId}`;
    
    try {
        const response = await fetch(GET_CONTENT_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ postId })
        });
        
        await handleErrors(response);
        const result = await response.json();

        if (!result.success || !Array.isArray(result.comments)) {
             throw new Error(result.error || 'Failed to fetch comments or invalid format');
        }

        const apiComments = result.comments.filter(item => item.type === 'comment' || item.type === 'subcomment');
        const frontendComments = apiComments
            .map(apiComment => mapApiCommentToFrontend(apiComment, apiComments, postId))
            .filter(comment => comment !== null);
        
        await localforage.setItem(cacheKey, {
            comments: frontendComments,
            timestamp: Date.now()
        });
        
        return frontendComments.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error("Error fetching comments from server:", error);
        
        try {
            const cachedData = await localforage.getItem(cacheKey);
            if (cachedData && cachedData.comments) {
                console.warn("Using cached comments data as fallback");
                return cachedData.comments;
            }
        } catch (fallbackError) {
             console.error("Error reading comment cache during fallback:", fallbackError);
        }
        
        return []; 
    }
}

/**
 * Adds a new comment
 */
export async function addComment({ postId, content, parentId=null }) {
    const authorDisplayName = await getDisplayName();
    if (!authorDisplayName) {
        throw new Error('User not logged in or display name not found.');
    }
    if (!content || !content.trim()) {
        throw new Error('Comment content cannot be empty.');
    }
    if (!postId) {
        throw new Error('Post ID is required to add a comment.');
    }

    const apiParentId = parentId === null ? postId : parentId;

    if (!apiParentId) {
         throw new Error('Cannot determine parent ID for comment creation.');
    }
    
    try {
        const response = await fetch(CREATE_COMMENT_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({
                parentId: apiParentId.toString(), 
                content: content.trim()
            })
        });
        
        await handleErrors(response);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to create comment on server.');
        }
        
        const cacheKey = `post-content-${postId}`;
        await localforage.removeItem(cacheKey);

    } catch (error) {
        console.error("Error adding comment via API:", error);
        throw error;
    }
}

/**
 * Likes/unlikes a comment
 */
export async function toggleLikeComment(commentId, postId) {
    if (!commentId) {
        throw new Error('Comment ID is required for like toggle');
    }
    if (!postId) {
        console.error("Post ID is required to toggle like and invalidate cache.");
        throw new Error('Post ID is required for like toggle');
    }

    const currentUser = await getDisplayName();
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    try {
        const response = await fetch(TOGGLE_LIKE_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ contentId: commentId.toString() })
        });
        
        await handleErrors(response);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to toggle like on server.');
        }
        
        const cacheKey = `post-content-${postId}`;
        await localforage.removeItem(cacheKey);

    } catch (error) {
        console.error("Error toggling like via API:", error);
        throw error;
    }
}

/**
 * Deletes a comment
 */
export async function deleteComment(commentId, postId) {
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
        const response = await fetch(DELETE_CONTENT_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ contentId: commentId.toString() })
        });
        
        await handleErrors(response);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to delete comment on server.');
        }
        
        const cacheKey = `post-content-${postId}`;
        await localforage.removeItem(cacheKey);

    } catch (error) {
        console.error("Error deleting comment via API:", error);
        throw error;
    }
}

/**
 * Modifies a comment's content
 */
export async function modifyComment(commentId, newContent, postId) {
    if (!commentId || !newContent || !postId) {
        throw new Error('Comment ID, new content, and Post ID are required for modification');
    }

    const currentUser = await getDisplayName();
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    try {
        const response = await fetch(MODIFY_CONTENT_API, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({
                contentId: commentId.toString(),
                title: null,
                content: newContent.trim(),
                tags: null
            })
        });

        await handleErrors(response);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to modify comment on server.');
        }

        const cacheKey = `post-content-${postId}`;
        await localforage.removeItem(cacheKey);

    } catch (error) {
        console.error("Error modifying comment via API:", error);
        throw error;
    }
}

// Removed syncPendingComments as offline actions are no longer supported for mutations.
// Helper function updateCommentCache is also removed as mutations invalidate cache instead. 