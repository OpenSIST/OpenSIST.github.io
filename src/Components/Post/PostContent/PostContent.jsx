import {addComment, getPostThread, removeContent, toggleLikeContent} from "../../../Data/PostData";
import {Form, Link, Outlet, redirect, useLoaderData} from "react-router-dom";
import {Avatar, Box, Button, Dialog, DialogActions, DialogTitle, IconButton, Paper, TextField, Tooltip, Typography} from "@mui/material";
import {Delete, Edit, Favorite, FavoriteBorder, Refresh, Send} from "@mui/icons-material";
import React, {useState} from "react";
import {BoldTypography, useSmallPage} from "../../common";
import "./PostContent.css"
import {getAvatar, getDisplayName, getMetadata} from "../../../Data/UserData";
import Grid2 from "@mui/material/Grid";
import {utcToLocal} from "../../../Data/Common";
import {decodePathParam, postsApplicantPath, postsPostPath} from "../../RouteUtils";
import ReactMarkdown, {defaultUrlTransform} from "react-markdown";

const IMAGE_DATA_URL_PATTERN = /^data:image\/(png|jpeg|jpg|gif|webp|bmp|avif);base64,/i;

function postUrlTransform(value, key, node) {
    if (value.startsWith("data:")) {
        if (key === "src" && node.tagName === "img" && IMAGE_DATA_URL_PATTERN.test(value)) {
            return value;
        }
        return "";
    }
    return defaultUrlTransform(value);
}

const markdownComponents = {
    a({node, href = "", children, ...props}) {
        return (
            <a href={href} {...props}>
                {children}
            </a>
        );
    },
    img({node, ...props}) {
        return (
            <Box
                component="img"
                loading="lazy"
                sx={{
                    borderRadius: "4px",
                    display: "block",
                    height: "auto",
                    maxHeight: {
                        xs: "18rem",
                        sm: "24rem",
                        md: "32rem",
                    },
                    maxWidth: "100%",
                    objectFit: "contain",
                }}
                {...props}
            />
        );
    },
};

function PostMarkdown({children}) {
    return (
        <ReactMarkdown urlTransform={postUrlTransform} components={markdownComponents}>
            {children}
        </ReactMarkdown>
    );
}

function sortNewestFirst(comments) {
    return [...comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function hasVisibleCommentThread(comment, commentsByParentId) {
    return !comment.is_deleted || getVisibleComments(comment.id, commentsByParentId).length > 0;
}

function getVisibleComments(parentId, commentsByParentId) {
    return sortNewestFirst(commentsByParentId[parentId] ?? [])
        .filter((comment) => hasVisibleCommentThread(comment, commentsByParentId));
}

export async function loader({params}) {
    const postId = decodePathParam(params.postId);
    const {post: postObj, comments} = await getPostThread(postId);

    const authorId = postObj?.author;
    const currentDisplayName = await getDisplayName();
    const editable = Boolean(authorId && currentDisplayName && authorId === currentDisplayName);

    const metadata = authorId ? await getMetadata(authorId.split("@")[0]) : {};
    const avatar = await getAvatar(metadata?.Avatar, authorId);
    const latestYear = metadata?.latestYear;
    return {postObj, comments, editable, avatar, latestYear, urlPostId: postId, currentDisplayName};
}

export async function action({request, params}) {
    const postId = decodePathParam(params.postId);
    const formData = await request.formData();
    const ActionType = formData.get('ActionType');
    const contentId = formData.get('ContentID') || postId;
    if (ActionType === 'Delete') {
        await removeContent(contentId);
        return redirect(contentId.toString() === postId.toString() ? "/posts" : request.url);
    }
    if (ActionType === 'ToggleLike') {
        await toggleLikeContent(contentId);
        return redirect(request.url);
    }
    if (ActionType === 'Comment') {
        const parentId = formData.get('ParentID') || postId;
        const content = formData.get('Content')?.trim();
        if (content) {
            await addComment(parentId, content);
        }
        return redirect(request.url);
    }
    return redirect(request.url);
}

export default function PostContent() {
    const {postObj, comments = [], editable, avatar, latestYear, urlPostId, currentDisplayName} = useLoaderData();
    const smallPage = useSmallPage();
    const [open, setOpen] = useState(false);

    if (!postObj) {
        return <Typography>帖子加载失败或不存在。</Typography>;
    }
    const handleClose = () => {
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
    };
    const authorUrl = latestYear ? postsApplicantPath(urlPostId, `${postObj.author}@${latestYear}`) : null;
    const authorLinkProps = authorUrl ? {component: Link, to: authorUrl} : {};
    const commentsByParentId = comments.reduce((acc, comment) => {
        const parentId = comment.parentId;
        acc[parentId] = [...(acc[parentId] ?? []), comment];
        return acc;
    }, {});
    const topLevelComments = getVisibleComments(postObj.id, commentsByParentId);
    return (
        <>
            <Box className="PostContentHeader" sx={{pb: "0.5rem"}}>
                <Box sx={{pb: "0.5rem", display: 'flex', gap: '1rem'}}>
                    <Avatar
                        src={avatar}
                        sx={{
                            height: (smallPage ? "5rem" : "4rem"),
                            width: (smallPage ? "5rem" : "4rem"),
                            cursor: authorUrl ? 'pointer' : 'default'
                        }}
                        {...authorLinkProps}
                    />
                    <Grid2 container>
                        <Grid2 size={12}>
                            <BoldTypography variant="h6"
                                            sx={authorUrl ? {cursor: 'pointer', textDecoration: "none"} : {}}
                                            {...authorLinkProps}
                            >
                                {postObj.author}
                            </BoldTypography>
                        </Grid2>
                        <Grid2
                            component={Typography}
                            size={{
                                xs: 12,
                                md: 5
                            }}>
                            创建于: {utcToLocal(postObj.created_at, true)}
                        </Grid2>
                        <Grid2
                            component={Typography}
                            size={{
                                xs: 12,
                                md: 7
                            }}>
                            最后修改于: {utcToLocal(postObj.updated_at ?? postObj.created_at, true)}
                        </Grid2>
                    </Grid2>
                </Box>
                <Box className='ReviseRefreshButtonGroup'>
                    {editable ?
                        <>
                            <Tooltip title="编辑内容" arrow>
                                <IconButton component={Link} to={`${postsPostPath(urlPostId)}/edit${window.location.search}`}>
                                    <Edit/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="删除内容" arrow>
                                <IconButton onClick={handleOpen} color="error">
                                    <Delete/>
                                </IconButton>
                            </Tooltip>
                            <Dialog open={open} onClose={handleClose}>
                                <DialogTitle>
                                    是否要删除《{postObj.title}》这篇文章？
                                </DialogTitle>
                                <DialogActions>
                                    <Button onClick={handleClose}>取消</Button>
                                    <Form method="post">
                                        <input type="hidden" name="ContentID" value={postObj.id}/>
                                        <Button color='error' type="submit"
                                                name="ActionType" value="Delete"
                                                onClick={handleClose}
                                        >
                                            确定
                                        </Button>
                                    </Form>
                                </DialogActions>
                            </Dialog>
                        </> : null}
                    <Form method='post' style={{display: 'flex'}}>
                        <Tooltip title="刷新内容" arrow>
                            <IconButton type='submit' name="ActionType" value="Refresh">
                                <Refresh/>
                            </IconButton>
                        </Tooltip>
                    </Form>
                </Box>
            </Box>
            <Paper sx={{display: 'flex', flexDirection: 'column', p: '1rem'}}>
                <Typography variant={'h4'} sx={{display: 'flex', position: 'relative', mb: '1rem'}}>
                    {postObj.title}
                </Typography>
                <PostMarkdown>
                    {postObj.content}
                </PostMarkdown>
                <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                    <LikeButton content={postObj}/>
                </Box>
            </Paper>
            <Paper sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 2, p: '1rem'}}>
                <Typography variant="h6">评论</Typography>
                <CommentForm parentId={postObj.id} placeholder="写下评论"/>
                {topLevelComments.length === 0 ? (
                    <Typography color="text.secondary">暂无评论。</Typography>
                ) : topLevelComments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentDisplayName={currentDisplayName}
                        commentsByParentId={commentsByParentId}
                    />
                ))}
            </Paper>
            <Outlet/>
        </>
    );
}

function LikeButton({content}) {
    return (
        <Form method="post" style={{display: 'inline-flex', alignItems: 'center', gap: '0.25rem'}}>
            <input type="hidden" name="ContentID" value={content.id}/>
            <Tooltip title={content.liked ? "取消点赞" : "点赞"} arrow>
                <IconButton type="submit" name="ActionType" value="ToggleLike" color={content.liked ? "error" : "default"}>
                    {content.liked ? <Favorite/> : <FavoriteBorder/>}
                </IconButton>
            </Tooltip>
            <Typography variant="body2">{content.like_count}</Typography>
        </Form>
    );
}

function CommentForm({parentId, placeholder, onSubmitted}) {
    const [content, setContent] = useState("");
    const handleSubmit = (event) => {
        if (!content.trim()) {
            event.preventDefault();
            return;
        }
        setTimeout(() => {
            setContent("");
            onSubmitted?.();
        });
    };
    return (
        <Form method="post" onSubmit={handleSubmit} style={{display: 'flex', gap: '0.5rem', alignItems: 'flex-start'}}>
            <input type="hidden" name="ParentID" value={parentId}/>
            <TextField
                name="Content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={placeholder}
                multiline
                minRows={2}
                size="small"
                fullWidth
            />
            <Tooltip title="发送" arrow>
                <span>
                    <IconButton type="submit" name="ActionType" value="Comment" disabled={!content.trim()}>
                        <Send/>
                    </IconButton>
                </span>
            </Tooltip>
        </Form>
    );
}

function DeleteContentButton({content}) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Tooltip title="删除" arrow>
                <IconButton size="small" onClick={() => setOpen(true)} color="error">
                    <Delete fontSize="small"/>
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>是否要删除这条评论？</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>取消</Button>
                    <Form method="post">
                        <input type="hidden" name="ContentID" value={content.id}/>
                        <Button color="error" type="submit" name="ActionType" value="Delete" onClick={() => setOpen(false)}>
                            确定
                        </Button>
                    </Form>
                </DialogActions>
            </Dialog>
        </>
    );
}

function CommentItem({comment, currentDisplayName, commentsByParentId}) {
    const [replyOpen, setReplyOpen] = useState(false);
    const canManage = Boolean(currentDisplayName && comment.author === currentDisplayName && !comment.is_deleted);
    const canReply = comment.type === "comment" && !comment.is_deleted;
    const visibleReplies = getVisibleComments(comment.id, commentsByParentId);
    return (
        <Box sx={{borderLeft: '2px solid', borderColor: 'divider', pl: 2}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
                <Box>
                    <BoldTypography>{comment.is_deleted ? "已删除评论" : comment.author}</BoldTypography>
                    <Typography variant="caption" color="text.secondary">
                        {utcToLocal(comment.created_at, true)}
                    </Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    {comment.is_deleted ? null : <LikeButton content={comment}/>}
                    {canReply ? (
                        <Button size="small" onClick={() => setReplyOpen((current) => !current)}>
                            回复
                        </Button>
                    ) : null}
                    {canManage ? <DeleteContentButton content={comment}/> : null}
                </Box>
            </Box>
            {comment.is_deleted ? (
                <Typography color="text.secondary" sx={{fontStyle: "italic", my: 1}}>
                    评论已删除
                </Typography>
            ) : (
                <PostMarkdown>
                    {comment.content}
                </PostMarkdown>
            )}
            {replyOpen ? (
                <CommentForm
                    parentId={comment.id}
                    placeholder={`回复 ${comment.author}`}
                    onSubmitted={() => setReplyOpen(false)}
                />
            ) : null}
            {visibleReplies.length > 0 ? (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 2, ml: 2}}>
                    {visibleReplies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentDisplayName={currentDisplayName}
                            commentsByParentId={commentsByParentId}
                        />
                    ))}
                </Box>
            ) : null}
        </Box>
    );
}
