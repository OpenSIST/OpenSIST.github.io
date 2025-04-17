import localforage from 'localforage'; // Import localforage
import { getDisplayName } from './UserData'; // Use getDisplayName
import { GET_COMMENTS, ADD_COMMENT, LIKE_COMMENT, DELETE_COMMENT } from '../APIs/APIs'; // Import API endpoints
import { headerGenerator, handleErrors } from './Common'; // Import common utilities

const COMMENT_KEY = 'comments';
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

/**
 * Fetches all comments for a specific post.
 * @param {string} postId - The ID of the post.
 * @param {boolean} forceRefresh - Whether to bypass cache (if applicable).
 * @returns {Promise<Array<object>>} - A promise resolving to an array of comment objects.
 */
export async function getComments(postId, forceRefresh = false) {
    if (!postId) {
        return [];
    }
    
    // Check cache first unless forceRefresh is true
    const cacheKey = `post-comments-${postId}`;
    let comments = null;
    
    if (!forceRefresh) {
        const cachedData = await localforage.getItem(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp) < COMMENT_CACHE_EXPIRATION) {
            return cachedData.comments;
        }
    }
    
    try {
        // Fetch from server
        const response = await fetch(GET_COMMENTS, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ postId })
        });
        
        await handleErrors(response);
        comments = await response.json();
        
        // Update cache
        await localforage.setItem(cacheKey, {
            comments: comments,
            timestamp: Date.now()
        });
        
        return comments.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error("Error fetching comments from server:", error);
        
        // Fallback to local cache if available (even if expired)
        const cachedData = await localforage.getItem(cacheKey);
        if (cachedData) {
            console.log("Using cached comments data as fallback");
            return cachedData.comments;
        }
        
        // Last resort - try the old local storage format
        const allComments = await localforage.getItem(COMMENT_KEY) || [];
        return allComments.filter(comment => comment.postId === postId)
                         .sort((a, b) => a.timestamp - b.timestamp);
    }
}

/**
 * Adds a new comment.
 * @param {object} commentData - The comment data.
 * @param {string} commentData.postId - The ID of the post being commented on.
 * @param {string} commentData.content - The content of the comment.
 * @param {string | null} [commentData.parentId=null] - The ID of the parent comment if it's a reply.
 * @returns {Promise<object>} - A promise resolving to the newly added comment object.
 */
export async function addComment({ postId, content, parentId = null }) {
    const authorDisplayName = await getDisplayName();
    if (!authorDisplayName) {
        throw new Error('User not logged in or display name not found.');
    }
    if (!content || !content.trim()) {
        throw new Error('Comment content cannot be empty.');
    }

    let targetAuthor = null;
    
    // If it's a reply, find the parent comment's author
    if (parentId) {
        try {
            // Try to get from cache first
            const cacheKey = `post-comments-${postId}`;
            const cachedData = await localforage.getItem(cacheKey);
            
            if (cachedData) {
                const parentComment = cachedData.comments.find(c => c.commentId === parentId);
                if (parentComment) {
                    targetAuthor = parentComment.author;
                }
            }
            
            // If not found in cache, we'll let the server handle finding the target author
        } catch (error) {
            console.error("Error finding parent comment author:", error);
            // Continue without targetAuthor - the server should handle this
        }
    }

    try {
        // Send to server
        const response = await fetch(ADD_COMMENT, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({
                postId,
                content: content.trim(),
                parentId,
                targetAuthor
            })
        });
        
        await handleErrors(response);
        const newComment = await response.json();
        
        // Update local cache
        await updateCommentCache(postId, async (cachedComments) => {
            cachedComments.push(newComment);
            return cachedComments;
        });
        
        return newComment;
    } catch (error) {
        console.error("Error adding comment to server:", error);
        
        // Fallback to local storage in case of network issues
        const allComments = await localforage.getItem(COMMENT_KEY) || [];
        
        const newComment = {
            commentId: crypto.randomUUID(),
            postId,
            author: authorDisplayName,
            content: content.trim(),
            timestamp: Date.now(),
            parentId,
            targetAuthor,
            likes: 0,
            likedBy: [],
            isDeleted: false,
            pendingSync: true // Mark as needing sync with server
        };

        allComments.push(newComment);
        await localforage.setItem(COMMENT_KEY, allComments);
        
        // Also update the post-specific cache
        await updateCommentCache(postId, async (cachedComments) => {
            cachedComments.push(newComment);
            return cachedComments;
        });
        
        return newComment;
    }
}

/**
 * Helper function to update comment cache for a specific post
 */
async function updateCommentCache(postId, updateFn) {
    const cacheKey = `post-comments-${postId}`;
    let cachedData = await localforage.getItem(cacheKey) || { comments: [], timestamp: 0 };
    
    cachedData.comments = await updateFn(cachedData.comments);
    cachedData.timestamp = Date.now();
    
    await localforage.setItem(cacheKey, cachedData);
}

/**
 * Likes a comment (toggles like status).
 * @param {string} commentId - The ID of the comment to like.
 * @returns {Promise<boolean>} - Whether the comment is now liked (true) or unliked (false).
 */
export async function toggleLikeComment(commentId) {
    if (!commentId) {
        throw new Error('Comment ID is required');
    }

    const currentUser = await getDisplayName();
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    try {
        // Send like/unlike to server
        const response = await fetch(LIKE_COMMENT, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ commentId })
        });
        
        await handleErrors(response);
        const result = await response.json();
        
        // No need to update cache here - we'll refresh comments after the like operation
        
        return result.isLiked;
    } catch (error) {
        console.error("Error liking comment on server:", error);
        
        // Fallback to local-only operation
        const allComments = await localforage.getItem(COMMENT_KEY) || [];
        
        // Find the target comment and update its likes
        let targetComment = null;
        let isNowLiked = false;
        let postId = null;

        for (let i = 0; i < allComments.length; i++) {
            if (allComments[i].commentId === commentId) {
                targetComment = allComments[i];
                postId = targetComment.postId;
                
                // Initialize likedBy array if it doesn't exist
                if (!targetComment.likedBy) {
                    targetComment.likedBy = [];
                }
                
                // Check if user already liked this comment
                const likedIndex = targetComment.likedBy.indexOf(currentUser);
                
                if (likedIndex >= 0) {
                    // User already liked it, so unlike
                    targetComment.likedBy.splice(likedIndex, 1);
                    targetComment.likes = Math.max(0, (targetComment.likes || 0) - 1);
                    isNowLiked = false;
                } else {
                    // User hasn't liked it yet, so like it
                    targetComment.likedBy.push(currentUser);
                    targetComment.likes = (targetComment.likes || 0) + 1;
                    isNowLiked = true;
                }
                
                // Mark comment as needing sync
                targetComment.likeStatusPendingSync = true;
                break;
            }
        }

        if (!targetComment) {
            throw new Error('Comment not found');
        }

        await localforage.setItem(COMMENT_KEY, allComments);
        
        // Update post-specific cache if available
        if (postId) {
            await updateCommentCache(postId, async (cachedComments) => {
                const commentIndex = cachedComments.findIndex(c => c.commentId === commentId);
                if (commentIndex >= 0) {
                    // Update the cached comment with new like status
                    cachedComments[commentIndex] = targetComment;
                }
                return cachedComments;
            });
        }
        
        return isNowLiked;
    }
}

/**
 * Deletes a comment and all its replies recursively.
 * @param {string} commentId - The ID of the comment to delete.
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId) {
    if (!commentId) {
        throw new Error('Comment ID is required');
    }

    const currentUser = await getDisplayName();
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    try {
        // Send delete request to server
        const response = await fetch(DELETE_COMMENT, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ commentId })
        });
        
        await handleErrors(response);
        
        // Server should handle the deletion of replies - we'll refresh comments after
        
    } catch (error) {
        console.error("Error deleting comment from server:", error);
        
        // Fallback to local-only operation
        let allComments = await localforage.getItem(COMMENT_KEY) || [];
        
        // Find the initial comment to delete
        const commentToDelete = allComments.find(c => c.commentId === commentId);
        
        if (!commentToDelete) {
            console.warn(`Comment with ID ${commentId} not found for deletion.`);
            return; 
        }
        
        // Check if current user is the author of the top-level comment being deleted
        if (commentToDelete.author !== currentUser) {
            throw new Error('You can only delete your own comments');
        }
        
        // Store the postId for cache update
        const postId = commentToDelete.postId;
        
        // --- Recursive Deletion Logic ---
        const idsToDelete = new Set();
        const queue = [commentId]; // Start with the initial comment ID
        
        // Add the initial comment ID to the set
        idsToDelete.add(commentId);

        // Use a queue to find all descendants
        while (queue.length > 0) {
            const currentParentId = queue.shift();
            
            // Find direct children of the current comment
            for (const comment of allComments) {
                if (comment.parentId === currentParentId && !idsToDelete.has(comment.commentId)) {
                    idsToDelete.add(comment.commentId);
                    queue.push(comment.commentId); // Add child to the queue to process its children
                }
            }
        }
        
        // Filter out all comments marked for deletion
        const updatedComments = allComments.filter(comment => !idsToDelete.has(comment.commentId));
        
        await localforage.setItem(COMMENT_KEY, updatedComments);
        
        // Update post-specific cache if available
        if (postId) {
            await updateCommentCache(postId, async (cachedComments) => {
                return cachedComments.filter(comment => !idsToDelete.has(comment.commentId));
            });
        }
    }
}

// Helper function to sync pending changes when online
export async function syncPendingComments() {
    // This could be called on app startup or when network connectivity returns
    // For now, just a placeholder for future implementation
} 