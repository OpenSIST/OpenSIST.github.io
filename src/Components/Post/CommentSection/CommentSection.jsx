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
    Snackbar
} from '@mui/material';
import { 
    ThumbUpOutlined, 
    ThumbUp, 
    DeleteOutline, 
    MoreVert, 
    Reply,
    ImageOutlined,
    CloudOff
} from '@mui/icons-material';
import './CommentSection.css';
import { getComments, addComment, toggleLikeComment, deleteComment, syncPendingComments } from '../../../Data/CommentData';
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
    userMetaDataMap,      // Added prop: Map of { displayName: { avatarUrl, latestYear } }
    isOffline = false     // New prop: Whether the app is currently offline
}) => {
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [replyError, setReplyError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeProcessing, setIsLikeProcessing] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const isMenuOpen = Boolean(menuAnchorEl);
    
    // Get metadata for the comment author from the passed map
    const authorMeta = userMetaDataMap?.get(comment.author);
    // Get metadata for the current user for the reply avatar
    const currentUserMeta = userMetaDataMap?.get(currentUserDisplayName);
    
    // Check if the current user is the author of this comment
    const isCommentAuthor = currentUserDisplayName === comment.author;
    
    // Check if the current user has liked this comment
    useEffect(() => {
        if (comment.likedBy && currentUserDisplayName) {
            setIsLiked(comment.likedBy.includes(currentUserDisplayName));
        }
    }, [comment.likedBy, currentUserDisplayName]);

    // Handle submitting a reply from the mini-form
    const handleInternalReplySubmit = async () => {
        if (!replyContent.trim() || isSubmittingReply) return;

        setIsSubmittingReply(true);
        setReplyError(null);
        try {
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
            const newLikedState = await onLikeComment(comment.commentId);
            setIsLiked(newLikedState);
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
            await onDeleteComment(comment.commentId);
        } catch (err) {
            console.error("Error deleting comment:", err);
            // Could show error toast/message here
        }
    };

    // Construct the content HTML, adding the mention prefix if necessary
    const renderContentHtml = () => {
        let contentHtml = comment.content || '';
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
    const isReplyInputVisible = comment.commentId === activeReplyCommentId;

    // Add visual indicator for comments pending sync
    const isPendingSync = comment.pendingSync || comment.likeStatusPendingSync;

    return (
        <Box className={`comment-item ${isReply ? 'comment-item-reply' : ''} ${isPendingSync ? 'comment-pending-sync' : ''}`}>
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
                        {isPostAuthor && comment.author === currentUserDisplayName && (
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
                                    {isSubmittingReply ? <CircularProgress size={18} /> : isOffline ? '离线发布' : '发布'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Add sync pending indicator if needed */}
                {isPendingSync && (
                    <Tooltip title="等待同步">
                        <Chip 
                            icon={<CloudOff fontSize="small" />}
                            label="待同步" 
                            size="small"
                            className="sync-pending-badge"
                            sx={{
                                height: '16px',
                                fontSize: '10px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                marginLeft: '8px'
                            }}
                        />
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
});

// --- Helper function to build nested comment structure --- 
// --- Optimized Helper function to build nested comment structure --- 
const buildCommentTreeOptimized = (comments) => {
    if (!comments || comments.length === 0) return [];

    const commentMap = new Map();
    const childrenMap = new Map(); // parentId -> [childComment, childComment, ...]
    const rootComments = [];

    // First pass: Map comments and group children by parentId
    comments.forEach(comment => {
        // Store the original comment object in the map, maybe add replies array later if needed for display
        commentMap.set(comment.commentId, { ...comment }); 
        if (comment.parentId) {
            if (!childrenMap.has(comment.parentId)) {
                childrenMap.set(comment.parentId, []);
            }
            childrenMap.get(comment.parentId).push(comment); // Store the original comment object
        } else {
            // For root comments, get the object we just stored in the map
            rootComments.push(commentMap.get(comment.commentId)); 
        }
    });

    // Function to recursively find all descendants (flat)
    const getFlatRepliesRecursive = (parentId) => {
        let replies = [];
        const directChildren = childrenMap.get(parentId) || [];
        directChildren.forEach(child => {
            // Get the potentially enhanced comment object from the map
            const childFromMap = commentMap.get(child.commentId);
            if (childFromMap) {
                replies.push(childFromMap); // Add the direct child (from map)
                 // Recursively add its descendants
                replies = replies.concat(getFlatRepliesRecursive(child.commentId));
            }
        });
        return replies;
    };

    // Second pass: Build flatReplies for each root comment
    rootComments.forEach(root => {
        root.flatReplies = getFlatRepliesRecursive(root.commentId)
                            .sort((a, b) => a.timestamp - b.timestamp); // Sort flat replies by time
    });

    // Sort root comments by time
    rootComments.sort((a, b) => a.timestamp - b.timestamp);

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
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showOfflineNotice, setShowOfflineNotice] = useState(false);
    const fileInputRef = useRef(null);
    const quillRef = useRef(null);

    // Fetch comments function - 移到这里以确保在使用之前定义
    const fetchComments = useCallback(async (forceRefresh = false) => {
        if (!postId) return; // Don't fetch if postId is not available yet
        setIsLoading(true);
        setError(null);
        try {
            const fetchedComments = await getComments(postId, forceRefresh);
            // --- Start: Fetch metadata for comment authors ---
            const authorDisplayNames = new Set();
            fetchedComments.forEach(comment => {
                if (comment.author) authorDisplayNames.add(comment.author);
            });
            
            const authorsToFetch = Array.from(authorDisplayNames).filter(name => !userMetaDataMap.has(name));
            
            if (authorsToFetch.length > 0) {
                const metaPromises = authorsToFetch.map(name => 
                    // Use getMetaData here as well
                    getMetaData(name.split("@")[0]).then(meta => ({ name, meta })) 
                );
                const metaResults = await Promise.allSettled(metaPromises);

                const avatarPromises = [];
                const newMetaData = new Map();

                metaResults.forEach(result => {
                    if (result.status === 'fulfilled') {
                        const { name, meta } = result.value;
                        // Prepare to fetch avatar URL
                        avatarPromises.push(
                            getAvatar(meta?.Avatar, name).then(avatarUrl => ({ 
                                name, 
                                latestYear: meta?.latestYear,
                                avatarUrl
                            }))
                        );
                    } else {
                        console.error(`Failed to fetch metadata for ${result.reason?.config?.url}:`, result.reason);
                        // Optionally store null data for failed authors to prevent re-fetching
                        // newMetaData.set(failedAuthorName, { avatarUrl: null, latestYear: null });
                    }
                });

                const avatarResults = await Promise.allSettled(avatarPromises);
                
                avatarResults.forEach(result => {
                     if (result.status === 'fulfilled') {
                        const { name, latestYear, avatarUrl } = result.value;
                        newMetaData.set(name, { avatarUrl, latestYear });
                    } else {
                        console.error(`Failed to fetch avatar:`, result.reason);
                        // Handle avatar fetch failure - maybe store null avatarUrl?
                    }
                });

                // Update the state map with newly fetched data
                if (newMetaData.size > 0) {
                    setUserMetaDataMap(prevMap => new Map([...prevMap, ...newMetaData]));
                }
            }
            // --- End: Fetch metadata for comment authors ---
            
            setComments(buildCommentTreeOptimized(fetchedComments)); // Use optimized function
        } catch (err) {
            console.error("Error fetching comments:", err);
            setError('Failed to load comments. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [postId, userMetaDataMap]);

    // Check online status
    useEffect(() => {
        function handleOnline() {
            setIsOffline(false);
            // When coming back online, attempt to sync any pending comments
            syncPendingComments().then(() => {
                // Refresh comments after syncing
                fetchComments(true);
            }).catch(error => {
                console.error("Error syncing pending comments:", error);
            });
        }
        
        function handleOffline() {
            setIsOffline(true);
            setShowOfflineNotice(true);
        }
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [fetchComments]);

    // Fetch current user info on mount
    useEffect(() => {
        getDisplayName().then(async displayName => {
            if (displayName) {
                setCurrentUserDisplayName(displayName);
                // Fetch metadata (avatar + year) for current user using getMetaData
                try {
                    const metaData = await getMetaData(displayName.split("@")[0]);
                    const avatarUrl = await getAvatar(metaData?.Avatar, displayName);
                    const latestYear = metaData?.latestYear;
                    setUserMetaDataMap(prevMap => new Map(prevMap).set(displayName, { avatarUrl, latestYear }));
                } catch (err) {
                    console.error(`Failed to fetch metadata for ${displayName}:`, err);
                    // Set default/empty data in map to avoid errors later?
                    setUserMetaDataMap(prevMap => new Map(prevMap).set(displayName, { avatarUrl: null, latestYear: null }));
                }
            }
        });
    }, []);

    // Fetch comments on mount and when postId changes
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Function to insert image (Base64) into Quill
    const insertImageIntoQuill = (base64Data) => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const range = quill.getSelection(true); // Get current cursor position
            // Insert image at cursor position
            quill.insertEmbed(range.index, 'image', base64Data, 'user'); 
            // Move cursor after the image
            quill.setSelection(range.index + 1, 0, 'user');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle image selection from file input
    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Insert the Base64 image directly into Quill editor
                insertImageIntoQuill(reader.result);
            };
            reader.readAsDataURL(file);
            setError(null); 
        } else {
            setError("Please select a valid image file.");
        }
        // Clear file input value in case user selects same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
    };
    
    // Handle pasting image from clipboard
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
                        // Insert the Base64 image directly into Quill editor
                        insertImageIntoQuill(reader.result);
                    };
                    reader.readAsDataURL(file);
                    setError(null);
                    break; 
                }
            }
        }
        // Allow default paste for non-image content
    };

    // Trigger hidden file input click
    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };
    
    // Handle MAIN comment submission (top level)
    const handleSubmitComment = async () => {
        const quill = quillRef.current?.getEditor();
        const delta = quill?.getContents();
        const isEmpty = !delta || (delta.length() === 1 && delta.ops[0].insert === '\n'); // Check if editor is effectively empty
        
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
        
        // Get content as HTML from Quill state
        const contentToSave = newCommentContent;
        
        try {
            // Pass HTML content to addComment
            await addComment({ postId, content: contentToSave, parentId: null }); 
            setNewCommentContent(''); // Clear Quill editor
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await fetchComments(true); // Force refresh to get the latest data from server
        } catch (err) {
            console.error("Error adding comment:", err);
            setError(err.message || 'Failed to post comment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle REPLY submission (called from Comment component)
    // Memoize with useCallback
    const handleReplySubmit = useCallback(async (parentId, replyContent) => {
        try {
            await addComment({ postId, content: replyContent, parentId });
            await fetchComments(true); // Force refresh to get the latest data from server
        } catch (err) {
            console.error("Error adding reply:", err);
            throw err; // Re-throw the error to be caught by the calling component (Comment's mini-form)
        }
    }, [postId, fetchComments]); // Dependencies

    // Handle liking a comment
    // Memoize with useCallback and remove optimistic update for now
    const handleLikeComment = useCallback(async (commentId) => {
        try {
            // Call API (toggle) and get actual result
            const isNowLiked = await toggleLikeComment(commentId);
            // Refresh comments to get the accurate state after API call
            await fetchComments(true); // Force refresh to get the latest data from server
            return isNowLiked;
        } catch (err) {
            console.error("Error toggling like:", err);
            // Revert back to accurate state on error
            await fetchComments();
            throw err;
        }
    }, [fetchComments]); // Simplified dependencies

    // Handle deleting a comment
    // Memoize with useCallback
    const handleDeleteComment = useCallback(async (commentId) => {
        try {
            await deleteComment(commentId);
            // Refresh comments after successful deletion
            await fetchComments(true); // Force refresh to get the latest data from server
        } catch (err) {
            console.error("Error deleting comment:", err);
            throw err;
        }
    }, [fetchComments]); // Dependency

    // Callback to toggle the reply input for a specific comment
    const handleToggleReplyInput = useCallback((commentId) => {
        setActiveReplyCommentId(prevId => (prevId === commentId ? null : commentId));
    }, []);

    // Get current user meta for the input avatar link
    const currentUserMetaForInput = userMetaDataMap.get(currentUserDisplayName);

    // Handle closing offline notice
    const handleCloseOfflineNotice = () => {
        setShowOfflineNotice(false);
    };

    return (
        <Box className="comment-section-container">
            <Typography variant="h6" className="comment-section-title">评论区 {`(${comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})`}</Typography>
            <Divider sx={{ my: 2 }} />

            {/* Offline indicator */}
            <Snackbar
                open={showOfflineNotice}
                autoHideDuration={6000}
                onClose={handleCloseOfflineNotice}
                message={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CloudOff fontSize="small" />
                        <span>您当前处于离线状态。评论将在恢复网络连接后同步。</span>
                    </Box>
                }
                sx={{ '& .MuiSnackbarContent-root': { bgcolor: 'warning.main' } }}
            />

            {isOffline && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CloudOff fontSize="small" />
                        <Typography>您当前处于离线状态。评论将在恢复网络连接后同步。</Typography>
                    </Box>
                </Alert>
            )}

            {/* --- Modified Comment Input Field --- */}
            <Box className="comment-input-section">
                {/* Wrap Avatar with Link - Update link and src */}
                <Link 
                    to={`/datapoints/applicant/${currentUserDisplayName}${currentUserMetaForInput?.latestYear ? '@' + currentUserMetaForInput.latestYear : ''}`}
                    style={{ textDecoration: 'none' }}
                    // Prevent clicking when no user is loaded
                    onClick={(e) => !currentUserDisplayName && e.preventDefault()} 
                >
                    {/* Use avatarUrl from map */}
                    <Avatar src={currentUserMetaForInput?.avatarUrl} className="comment-input-avatar" /> 
                </Link>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        <Tooltip title="添加图片">
                            <IconButton size="small" onClick={handleImageButtonClick} disabled={isSubmitting}>
                                <ImageOutlined fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {/* Hidden File Input */} 
                        <Input 
                            type="file"
                            inputRef={fileInputRef}
                            onChange={handleImageSelect}
                            sx={{ display: 'none' }} 
                            inputProps={{ accept: "image/*" }} 
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Button 
                            variant="contained" 
                            className="comment-submit-button" 
                            onClick={handleSubmitComment}
                            disabled={isSubmitting || (!quillRef.current?.getEditor().getText().trim() && !quillRef.current?.getEditor().getContents().ops?.some(op => op.insert?.image))}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : isOffline ? '离线发布' : '发布'}
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
                    {comments.map(rootComment => (
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
                                isOffline={isOffline}
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
                                            isOffline={isOffline}
                                        />
                                    ))}
                                </Box>
                            )}
                        </React.Fragment>
                    ))}
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