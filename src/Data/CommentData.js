import localforage from 'localforage'; // Import localforage
import { getDisplayName } from './UserData'; // Use getDisplayName

const COMMENT_KEY = 'comments';

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
    // TODO: Implement caching/forceRefresh if needed
    const allComments = await localforage.getItem(COMMENT_KEY) || []; // Use localforage.getItem
    return allComments.filter(comment => comment.postId === postId)
                     .sort((a, b) => a.timestamp - b.timestamp); // Sort by time
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

    const allComments = await localforage.getItem(COMMENT_KEY) || [];
    let targetAuthor = null;

    // If it's a reply, find the parent comment's author
    if (parentId) {
        const parentComment = allComments.find(c => c.commentId === parentId);
        if (parentComment) {
            targetAuthor = parentComment.author;
        } else {
            console.warn(`Parent comment with ID ${parentId} not found when adding reply.`);
            // Decide how to handle: proceed without target, or throw error?
            // For now, proceed without targetAuthor.
        }
    }

    const newComment = {
        commentId: crypto.randomUUID(),
        postId,
        author: authorDisplayName,
        content: content.trim(),
        timestamp: Date.now(),
        parentId,
        targetAuthor, // Store the target author
        likes: 0,
        likedBy: [],
        isDeleted: false
    };

    allComments.push(newComment);
    await localforage.setItem(COMMENT_KEY, allComments);

    return newComment;
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

    const allComments = await localforage.getItem(COMMENT_KEY) || [];
    const currentUser = await getDisplayName();
    
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    // Find the target comment and update its likes
    let targetComment = null;
    let isNowLiked = false;

    for (let i = 0; i < allComments.length; i++) {
        if (allComments[i].commentId === commentId) {
            targetComment = allComments[i];
            
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
            
            break;
        }
    }

    if (!targetComment) {
        throw new Error('Comment not found');
    }

    await localforage.setItem(COMMENT_KEY, allComments);
    return isNowLiked;
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

    let allComments = await localforage.getItem(COMMENT_KEY) || [];
    const currentUser = await getDisplayName();
    
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    // Find the initial comment to delete
    const commentToDelete = allComments.find(c => c.commentId === commentId);
    
    if (!commentToDelete) {
        // Comment might have already been deleted by a parent deletion, which is ok.
        // Or it never existed. For simplicity, just return if not found.
        console.warn(`Comment with ID ${commentId} not found for deletion.`);
        return; 
    }
    
    // Check if current user is the author of the top-level comment being deleted
    if (commentToDelete.author !== currentUser) {
        throw new Error('You can only delete your own comments');
    }
    
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
}

// Potential future functions:
// export async function deleteComment(commentId, author) { ... }
// export async function likeComment(commentId) { ... } 