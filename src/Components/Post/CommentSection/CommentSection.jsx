import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
    Box, 
    Typography, 
    Avatar, 
    TextField,
    Button, 
    Divider, 
    CircularProgress, 
    Alert,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Chip,
    Input,
} from '@mui/material';
import { 
    ThumbUpOutlined, 
    ThumbUp, 
    DeleteOutline, 
    MoreVert, 
    Reply,
    ImageOutlined,
} from '@mui/icons-material';
import './CommentSection.css';
import { getComments, addComment, toggleLikeComment, deleteComment } from '../../../Data/CommentData';
import { getDisplayName, getAvatar, getMetaData } from '../../../Data/UserData';
import { Link } from 'react-router-dom';

// Format timestamp in a more user-friendly way
const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
        const commentDate = new Date(timestamp);
        const now = new Date();
        const diffMs = now - commentDate;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        // Show relative time for recent comments
        if (diffSecs < 60) {
            return '刚刚';
        } else if (diffMins < 60) {
            return `${diffMins}分钟前`;
        } else if (diffHours < 24) {
            return `${diffHours}小时前`;
        } else if (diffDays < 30) {
            return `${diffDays}天前`;
        }
        
        // For older comments, show the date in format: YYYY-MM-DD HH:MM
        const year = commentDate.getFullYear();
        const month = String(commentDate.getMonth() + 1).padStart(2, '0');
        const day = String(commentDate.getDate()).padStart(2, '0');
        const hours = String(commentDate.getHours()).padStart(2, '0');
        const minutes = String(commentDate.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting timestamp:", e);
        return 'Invalid Date';
    }
};

// --- Enhanced Comment Component --- 
const Comment = React.memo(({ 
    comment, 
    onReplySubmit, 
    onLikeComment, 
    onDeleteComment, 
    currentUserDisplayName,
    isPostAuthor = false, // 当前评论是否由帖子作者发布
    postAuthor, 
    isReply = false, // Prop to indicate if it's a reply (added in previous step)
    activeReplyCommentId, // Added prop: ID of the comment whose reply input is open
    onToggleReplyInput,   // Added prop: Handler to open/close reply input
    userMetaDataMap
}) => {
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [replyError, setReplyError] = useState(null);
    // console.log("COMMENT: ", comment);
    const [isLiked] = useState(comment.liked || false);
    const [isLikeProcessing, setIsLikeProcessing] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const isMenuOpen = Boolean(menuAnchorEl);
    
    // Get metadata for the comment author from the passed map
    const authorMeta = userMetaDataMap?.get(comment.author);
    // Get metadata for the current user for the reply avatar
    const currentUserMeta = userMetaDataMap?.get(currentUserDisplayName);
    
    // Check if the current user is the author of this comment
    const isCommentAuthor = currentUserDisplayName === comment.author;

    // Handle submitting a reply from the mini-form
    const handleInternalReplySubmit = async () => {
        if (!replyContent.trim() || isSubmittingReply) return;

        setIsSubmittingReply(true);
        setReplyError(null);
        try {
            // Pass parent comment's commentId as parentId
            await onReplySubmit(comment.commentId, replyContent); 
            setReplyContent('');
            // Close the input after successful submission
            onToggleReplyInput(null); 
        } catch (err) {
            console.error("Error submitting reply:", err);
            setReplyError(err.message || "Failed to post reply.");
        } finally {
            setIsSubmittingReply(false);
        }
    };
    
    // Handle like button click
    const handleLike = async () => {
        if (isLikeProcessing) return;
        
        setIsLikeProcessing(true);
        try {
            // Pass comment's commentId and postId
            await onLikeComment(comment.commentId, comment.postId); // Assuming postId is available or handled by onLikeComment
        } catch (err) {
            console.error("Error liking comment:", err);
            // Could show error toast/message here
        } finally {
            setIsLikeProcessing(false);
        }
    };
    
    // Menu handlers
    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };
    
    const handleDelete = async () => {
        handleMenuClose();
        try {
            // Pass comment's commentId and postId
            await onDeleteComment(comment.commentId, comment.postId); // Assuming postId is available or handled by onDeleteComment
        } catch (err) {
            console.error("Error deleting comment:", err);
            // Could show error toast/message here
        }
    };

    // Construct the content HTML, adding the mention prefix if necessary
    const renderContentHtml = () => {
        let contentHtml = comment.content || '';
        // Use comment.targetAuthor which should be added by buildCommentTreeOptimized
        if (isReply && comment.targetAuthor) { 
            const mentionHtml = `<span class="reply-target-author">回复 @${comment.targetAuthor}: </span>`;
            // Prepend mention HTML. Assumes comment.content starts with <p>
            // More robust logic might be needed if content can start differently.
            if (contentHtml.startsWith('<p>')) {
                 contentHtml = contentHtml.replace('<p>', '<p>' + mentionHtml);
            } else {
                // Fallback if content doesn't start with <p>
                contentHtml = mentionHtml + contentHtml; 
            }
        }
        return contentHtml;
    };

    // Determine if this comment's reply input should be visible
    const isReplyInputVisible = comment.commentId === activeReplyCommentId; // Use commentId

    return (
        <Box className={`comment-item ${isReply ? 'comment-item-reply' : ''}`}>
            <Link to={`/datapoints/applicant/${comment.author}${authorMeta?.latestYear ? '@' + authorMeta.latestYear : ''}`} style={{ textDecoration: 'none' }}>
                <Avatar src={authorMeta?.avatarUrl} className="comment-avatar">
                    {!authorMeta?.avatarUrl ? comment.author?.[0]?.toUpperCase() : null}
                </Avatar>
            </Link>
            <Box className="comment-content">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Typography 
                            variant="subtitle2" 
                            className="comment-author" 
                            component={Link}
                            to={`/datapoints/applicant/${comment.author}${authorMeta?.latestYear ? '@' + authorMeta.latestYear : ''}`}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            {comment.author || 'Anonymous'}
                        </Typography>
                        {isPostAuthor && comment.author === postAuthor && ( // Check if comment author matches post author
                            <Chip 
                                label="作者" 
                                size="small" 
                                className="author-badge"
                                sx={{
                                    height: '16px',
                                    fontSize: '10px',
                                    backgroundColor: '#00a1d6',
                                    color: 'white'
                                }}
                            />
                        )}
                    </Box>
                    
                    {isCommentAuthor && (
                        <Box>
                            <IconButton
                                size="small"
                                onClick={handleMenuOpen}
                                aria-controls={isMenuOpen ? 'comment-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={isMenuOpen ? 'true' : undefined}
                                className="comment-menu-button"
                            >
                                <MoreVert fontSize="small" />
                            </IconButton>
                            <Menu
                                id="comment-menu"
                                anchorEl={menuAnchorEl}
                                open={isMenuOpen}
                                onClose={handleMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'comment-menu-button',
                                }}
                            >
                                <MenuItem onClick={handleDelete} className="delete-menu-item">
                                    <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
                                    删除
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Box>
                
                <Box 
                    className="comment-text quill-render-content"
                    dangerouslySetInnerHTML={{ __html: renderContentHtml() }} 
                />
                
                {/* Group Timestamp and Action Buttons Below Content */}
                <Box className="comment-footer">
                    <Typography variant="caption" className="comment-timestamp">
                        {/* Use timestamp */}
                        {formatTimestamp(comment.timestamp)} 
                    </Typography>
                    
                    <Box className="comment-action-buttons">
                        <Tooltip title={isLiked ? "取消点赞" : "点赞"}>
                            <IconButton 
                                size="small" 
                                onClick={handleLike}
                                disabled={isLikeProcessing}
                                className={`like-button ${isLiked ? 'liked' : ''}`}
                            >
                                {isLiked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                                {/* Use likes */}
                                {comment.likes > 0 && ( 
                                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                                        {comment.likes}
                                    </Typography>
                                )}
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="回复">
                            <IconButton 
                                size="small"
                                // Pass comment's commentId to toggle input
                                onClick={() => onToggleReplyInput(comment.commentId)} 
                                className="reply-button"
                            >
                                <Reply fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Reply Input Section - Render based on external state */}
                {isReplyInputVisible && (
                    <Box className="reply-input-section">
                        <Avatar src={currentUserMeta?.avatarUrl} className="reply-input-avatar" />
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <TextField
                                multiline
                                fullWidth
                                size="small"
                                variant="outlined"
                                // Use comment.author for the placeholder
                                placeholder={`回复 @${comment.author || 'Anonymous'}...`} 
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                disabled={isSubmittingReply}
                                error={!!replyError}
                            />
                            {replyError && <Alert severity="error" sx={{ fontSize: '0.75rem', p: '0 0.5rem' }}>{replyError}</Alert>}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <Button 
                                    size="small" 
                                    // Pass null to close the input
                                    onClick={() => onToggleReplyInput(null)} 
                                    disabled={isSubmittingReply}
                                >
                                    取消
                                </Button>
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    onClick={handleInternalReplySubmit}
                                    disabled={!replyContent.trim() || isSubmittingReply}
                                >
                                    {isSubmittingReply ? <CircularProgress size={18} /> : '发布'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
});

// --- Helper function to build nested comment structure --- 
// --- Optimized Helper function to build nested comment structure --- 
const buildCommentTreeOptimized = (comments) => {
    if (!comments || comments.length === 0) return [];

    const commentMap = new Map(); // Stores comment objects keyed by commentId
    const childrenMap = new Map(); // Stores arrays of children keyed by parentId
    const rootComments = [];

    // First pass: Map comments and group children by parentId
    comments.forEach(comment => {
        // Ensure we have a consistent object structure in the map
        const commentData = { ...comment };
        commentMap.set(commentData.commentId, commentData);

        // Group children using parentId
        if (commentData.parentId) {
            // Ensure parentId doesn't point back to itself (sanity check)
            if (commentData.parentId !== commentData.commentId) {
                 if (!childrenMap.has(commentData.parentId)) {
                    childrenMap.set(commentData.parentId, []);
                }
                childrenMap.get(commentData.parentId).push(commentData);
            } else {
                console.warn("Comment has parentId equal to its own commentId:", commentData);
            }
        }

        // Identify root comments using comment_type
        if (comment.comment_type === 'comment') {
            rootComments.push(commentData); // Add the object from the map
        }
    });

    // Function to recursively find all descendants (flat) and add targetAuthor
    const getFlatRepliesRecursive = (currentParentId) => {
        let replies = [];
        const directChildren = childrenMap.get(currentParentId) || [];

        directChildren.forEach(child => {
            // Get the comment object from the map using the child's commentId
            const childFromMap = commentMap.get(child.commentId);
            if (childFromMap) {
                 // Find the parent comment from the map to get the target author
                const parentComment = commentMap.get(currentParentId); // currentParentId IS the parent's commentId
                if (parentComment) {
                     // If the API didn't provide targetAuthor for subcomments, set it here
                     if (!childFromMap.targetAuthor) {
                         childFromMap.targetAuthor = parentComment.author;
                     }
                } else {
                    console.warn("Parent comment not found in map for ID:", currentParentId);
                }
                replies.push(childFromMap); // Add the direct child

                 // Recursively add its descendants using the child's commentId as the next parentId
                replies = replies.concat(getFlatRepliesRecursive(child.commentId));
            } else {
                 console.warn("Child comment not found in map for ID:", child.commentId);
            }
        });
        return replies;
    };

    // Second pass: Build flatReplies for each root comment
    rootComments.forEach(root => {
        // Use root.commentId to find replies for this root comment
        root.flatReplies = getFlatRepliesRecursive(root.commentId)
                            // Sort flat replies by timestamp
                            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); 
    });

    // Sort root comments by timestamp
    rootComments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); 

    return rootComments;
};

// --- Quill Editor Configuration --- 
const quillModules = {
    toolbar: null // Remove the default toolbar
};

const quillFormats = [
    // Minimal formats needed if toolbar is gone
    // We still need 'image' if we insert images programmatically
    'image',
    'bold', 'italic', 'underline', 'strike', // Keep basic formats if pasted
    'link' // Keep link format if pasted
];

// --- Enhanced CommentSection Component ---
// Wrap with React.memo
const CommentSection = React.memo(({ postId, postAuthor }) => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserDisplayName, setCurrentUserDisplayName] = useState(null);
    const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
    const [userMetaDataMap, setUserMetaDataMap] = useState(new Map());
    const fileInputRef = useRef(null);
    const quillRef = useRef(null);

    // Fetch comments function - 移到这里以确保在使用之前定义
    const fetchComments = useCallback(async (forceRefresh = false) => {
        if (!postId) return; // Don't fetch if postId is not available yet
        setIsLoading(true);
        setError(null);
        try {
            // Assume getComments now returns the array based on the new API format
            const fetchedComments = await getComments(postId, forceRefresh); 
            console.log("DEBUG: Fetched Comments Raw:", fetchedComments); // Log raw data
            // --- Start: Fetch metadata for comment authors ---
            const authorDisplayNames = new Set();
            fetchedComments.forEach(comment => {
                if (comment.author) authorDisplayNames.add(comment.author);
                 // Also add targetAuthor if it exists in the raw data (though likely not)
                 // We derive targetAuthor in buildCommentTreeOptimized
            });
            
            const authorsToFetch = Array.from(authorDisplayNames).filter(name => !userMetaDataMap.has(name));
            
            if (authorsToFetch.length > 0) {
                const metaPromises = authorsToFetch.map(name => 
                    getMetaData(name.split("@")[0]).then(meta => ({ name, meta })) 
                );
                const metaResults = await Promise.allSettled(metaPromises);

                const avatarPromises = [];
                const newMetaData = new Map();

                metaResults.forEach(result => {
                    if (result.status === 'fulfilled') {
                        const { name, meta } = result.value;
                        avatarPromises.push(
                            getAvatar(meta?.Avatar, name).then(avatarUrl => ({ 
                                name, 
                                latestYear: meta?.latestYear,
                                avatarUrl
                            }))
                        );
                    } else {
                        console.error(`Failed to fetch metadata for ${result.reason?.config?.url}:`, result.reason);
                    }
                });

                const avatarResults = await Promise.allSettled(avatarPromises);
                
                avatarResults.forEach(result => {
                     if (result.status === 'fulfilled') {
                        const { name, latestYear, avatarUrl } = result.value;
                        newMetaData.set(name, { avatarUrl, latestYear });
                    } else {
                        console.error(`Failed to fetch avatar:`, result.reason);
                    }
                });

                if (newMetaData.size > 0) {
                    setUserMetaDataMap(prevMap => new Map([...prevMap, ...newMetaData]));
                }
            }
            // --- End: Fetch metadata for comment authors ---
            console.log("DEBUG: Fetched Comments:", fetchedComments); // Log raw data
            const processedComments = buildCommentTreeOptimized(fetchedComments); // Use optimized function
            console.log("DEBUG: Processed Comment Tree:", processedComments); // Log processed tree
            setComments(processedComments);
        } catch (err) {
            console.error("Error fetching comments:", err);
            setError('Failed to load comments. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [postId, userMetaDataMap]); // userMetaDataMap dependency is correct

    // Fetch current user info on mount
    useEffect(() => {
        getDisplayName().then(async displayName => {
            if (displayName) {
                setCurrentUserDisplayName(displayName);
                try {
                    const metaData = await getMetaData(displayName.split("@")[0]);
                    const avatarUrl = await getAvatar(metaData?.Avatar, displayName);
                    const latestYear = metaData?.latestYear;
                    setUserMetaDataMap(prevMap => new Map(prevMap).set(displayName, { avatarUrl, latestYear }));
                } catch (err) {
                    console.error(`Failed to fetch metadata for ${displayName}:`, err);
                    setUserMetaDataMap(prevMap => new Map(prevMap).set(displayName, { avatarUrl: null, latestYear: null }));
                }
            }
        });
    }, []);

    // Fetch comments on mount and when postId changes
    useEffect(() => {
        fetchComments();
    }, [fetchComments]); // fetchComments dependency is correct

    // Function to insert image (Base64) into Quill
    const insertImageIntoQuill = (base64Data) => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const range = quill.getSelection(true); // Get current cursor position
            quill.insertEmbed(range.index, 'image', base64Data, 'user'); 
            quill.setSelection(range.index + 1, 0, 'user');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                insertImageIntoQuill(reader.result);
            };
            reader.readAsDataURL(file);
            setError(null); 
        } else {
            setError("Please select a valid image file.");
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
    };
    
    const handlePaste = (event) => {
        const items = event.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    event.preventDefault(); 
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        insertImageIntoQuill(reader.result);
                    };
                    reader.readAsDataURL(file);
                    setError(null);
                    break; 
                }
            }
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Handle MAIN comment submission (top level)
    const handleSubmitComment = async () => {
        const quill = quillRef.current?.getEditor();
        const delta = quill?.getContents();
        const isEmpty = !delta || (delta.length() === 1 && delta.ops[0].insert === '\n'); 
        
        if (isEmpty || isSubmitting || !currentUserDisplayName) {
            if (!currentUserDisplayName) {
                setError("Cannot post comment: User information not available.");
            } else if (isEmpty) {
                 setError("Comment cannot be empty.");
            }
            return;
        }

        setIsSubmitting(true);
        setError(null);
        
        const contentToSave = newCommentContent;
        
        try {
            // Pass postId, content, and parent_id: null
            await addComment({ postId, content: contentToSave, parent_id: null }); 
            setNewCommentContent(''); // Clear Quill editor
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await fetchComments(true); // Force refresh
        } catch (err) {
            console.error("Error adding comment:", err);
            setError(err.message || 'Failed to post comment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle REPLY submission (called from Comment component)
    // Memoize with useCallback
    const handleReplySubmit = useCallback(async (parentId, replyContent) => { // parentId is the commentId of the comment being replied to
        try {
             // Pass postId, content, and parent_id (using the received parentId which is a commentId)
            await addComment({ postId, content: replyContent, parent_id: parentId });
            await fetchComments(true); // Force refresh
        } catch (err) {
            console.error("Error adding reply:", err);
            throw err; // Re-throw for the Comment component
        }
    }, [postId, fetchComments]); // Dependencies

    // Handle liking a comment
    // Memoize with useCallback 
    const handleLikeComment = useCallback(async (commentId) => { // commentId is the commentId of the comment being liked
        try {
            // Assuming toggleLikeComment expects commentId and postId
            await toggleLikeComment(commentId, postId); 
            await fetchComments(true); // Force refresh for accurate state
        } catch (err) {
            console.error("Error toggling like:", err);
            await fetchComments(); // Revert on error
            throw err;
        }
    }, [fetchComments, postId]); // Dependencies

    // Handle deleting a comment
    // Memoize with useCallback
    const handleDeleteComment = useCallback(async (commentId) => { // commentId is the commentId of the comment being deleted
        try {
            // Assuming deleteComment expects commentId and postId
            await deleteComment(commentId, postId); 
            await fetchComments(true); // Force refresh
        } catch (err) {
            console.error("Error deleting comment:", err);
            throw err;
        }
    }, [fetchComments, postId]); // Dependency

    // Callback to toggle the reply input for a specific comment
    const handleToggleReplyInput = useCallback((commentId) => { // commentId is the commentId of the comment
        setActiveReplyCommentId(prevId => (prevId === commentId ? null : commentId));
    }, []);

    // Get current user meta for the input avatar link
    const currentUserMetaForInput = userMetaDataMap.get(currentUserDisplayName);

    return (
        <Box className="comment-section-container">
             {/* Update comment count calculation based on flatReplies */}
            <Typography variant="h6" className="comment-section-title">评论区 {`(${comments.reduce((acc, c) => acc + 1 + (c.flatReplies?.length || 0), 0)})`}</Typography>
            <Divider sx={{ my: 2 }} />

            {/* Comment Input Field */} 
            <Box className="comment-input-section">
               {/* ... (Avatar link remains similar) ... */}
                <Link 
                    to={`/datapoints/applicant/${currentUserDisplayName}${currentUserMetaForInput?.latestYear ? '@' + currentUserMetaForInput.latestYear : ''}`}
                    style={{ textDecoration: 'none' }}
                    onClick={(e) => !currentUserDisplayName && e.preventDefault()} 
                >
                    <Avatar src={currentUserMetaForInput?.avatarUrl} className="comment-input-avatar" /> 
                </Link>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* ... (Quill editor remains similar) ... */}
                    <ReactQuill 
                        ref={quillRef}
                        theme="snow" 
                        value={newCommentContent}
                        onChange={setNewCommentContent}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="发表你的评论..."
                        onPaste={handlePaste}
                        className="comment-input-editor"
                    />
                    
                    {/* Action Buttons */} 
                    <Box className="comment-input-actions">
                       {/* ... (Image button and input remain similar) ... */}
                        <Tooltip title="添加图片">
                            <IconButton size="small" onClick={handleImageButtonClick} disabled={isSubmitting}>
                                <ImageOutlined fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Input 
                            type="file"
                            inputRef={fileInputRef}
                            onChange={handleImageSelect}
                            sx={{ display: 'none' }} 
                            inputProps={{ accept: "image/*" }} 
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        {/* ... (Submit button remains similar) ... */}
                        <Button 
                            variant="contained" 
                            className="comment-submit-button" 
                            onClick={handleSubmitComment}
                            disabled={isSubmitting || (!quillRef.current?.getEditor().getText().trim() && !quillRef.current?.getEditor().getContents().ops?.some(op => op.insert?.image))}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : '发布'}
                        </Button>
                    </Box>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Divider sx={{ my: 2 }} />

            {/* List Comments */} 
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : comments.length > 0 ? (
                <Box className="comment-list">
                    {/* Iterate through root comments */}
                    {comments.map(rootComment => {
                        console.log("DEBUG: Rendering Root Comment:", rootComment);
                        console.log("DEBUG: Root Comment Flat Replies:", rootComment.flatReplies);
                        return (
                            <React.Fragment key={rootComment.commentId}> 
                                {/* Render the root comment */}
                                <Comment 
                                    comment={rootComment} 
                                    onReplySubmit={handleReplySubmit} 
                                    onLikeComment={handleLikeComment}
                                    onDeleteComment={handleDeleteComment}
                                    currentUserDisplayName={currentUserDisplayName}
                                    isPostAuthor={rootComment.author === postAuthor} 
                                    postAuthor={postAuthor}
                                    activeReplyCommentId={activeReplyCommentId}
                                    onToggleReplyInput={handleToggleReplyInput}
                                    userMetaDataMap={userMetaDataMap}
                                />
                                {/* Render all replies (flat) in an indented container */}
                                {rootComment.flatReplies && rootComment.flatReplies.length > 0 && (
                                    <Box className="comment-replies">
                                        {rootComment.flatReplies.map(reply => (
                                            <Comment 
                                                key={reply.commentId} 
                                                comment={reply} 
                                                onReplySubmit={handleReplySubmit} 
                                                onLikeComment={handleLikeComment}
                                                onDeleteComment={handleDeleteComment}
                                                currentUserDisplayName={currentUserDisplayName}
                                                isPostAuthor={reply.author === postAuthor} 
                                                postAuthor={postAuthor}
                                                activeReplyCommentId={activeReplyCommentId}
                                                onToggleReplyInput={handleToggleReplyInput}
                                                isReply={true}
                                                userMetaDataMap={userMetaDataMap}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Box>
            ) : (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', my: 3 }}>
                    还没有评论，快来抢沙发吧！
                </Typography>
            )}
        </Box>
    );
}); // Close React.memo wrapper

export default CommentSection; 