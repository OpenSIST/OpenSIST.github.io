import {Form, redirect, useLoaderData, useNavigate, useSubmit} from "react-router-dom";
import {Button, ButtonGroup, TextField, Typography, useTheme} from "@mui/material";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import MarkDownEditor from "../Program/MarkDownEditor/MarkDownEditor";
import {addModifyPost, formatPostContentSize, getPostObject, getUtf8ByteLength, POST_CONTENT_MAX_BYTES} from "../../../Data/PostData";
import {getDisplayName} from "../../../Data/UserData";
import {decodePathParam, postsPostPath} from "../../RouteUtils";

const IMAGE_DATA_URL_PATTERN = /(!\[[^\]]*]\()(data:image\/(?:png|jpeg|jpg|gif|webp|bmp|avif);base64,[^)]+)(\))/gi;
const POST_IMAGE_TOKEN_PREFIX = "opensist-image:";

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.toString());
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function createPostImageToken() {
    return `${POST_IMAGE_TOKEN_PREFIX}${crypto.randomUUID()}`;
}

function createPostAttachmentFromFile(file) {
    return {
        file,
        token: createPostImageToken(),
    };
}

function getEstimatedDataUrlBytes(attachment) {
    if (attachment.dataUrl) {
        return getUtf8ByteLength(attachment.dataUrl);
    }
    const prefix = `data:${attachment.file.type || "image/png"};base64,`;
    return getUtf8ByteLength(prefix) + Math.ceil(attachment.file.size / 3) * 4;
}

function countOccurrences(value, searchValue) {
    if (!searchValue) {
        return 0;
    }
    let count = 0;
    let index = value.indexOf(searchValue);
    while (index !== -1) {
        count += 1;
        index = value.indexOf(searchValue, index + searchValue.length);
    }
    return count;
}

async function getAttachmentDataUrl(attachment) {
    if (!attachment.dataUrl) {
        attachment.dataUrl = await readFileAsDataUrl(attachment.file);
    }
    return attachment.dataUrl;
}

function preparePostContentForEditing(content) {
    const attachments = new Map();
    const editableContent = (content ?? "").replace(IMAGE_DATA_URL_PATTERN, (match, prefix, dataUrl, suffix) => {
        const token = createPostImageToken();
        attachments.set(token, {dataUrl, token});
        return `${prefix}${token}${suffix}`;
    });
    return {attachments, content: editableContent};
}

function estimateFinalPostContentBytes(content, attachments) {
    let size = getUtf8ByteLength(content);
    attachments.forEach((attachment, token) => {
        const occurrences = countOccurrences(content, token);
        if (occurrences === 0) {
            return;
        }
        size -= getUtf8ByteLength(token) * occurrences;
        size += getEstimatedDataUrlBytes(attachment) * occurrences;
    });
    return size;
}

async function finalizePostContentAttachments(content, attachments) {
    let finalizedContent = content;
    for (const [token, attachment] of attachments) {
        if (!finalizedContent.includes(token)) {
            continue;
        }
        const dataUrl = await getAttachmentDataUrl(attachment);
        finalizedContent = finalizedContent.replaceAll(token, dataUrl);
    }
    return finalizedContent;
}

function getPostAttachmentPreviewUrl(src, attachments) {
    const attachment = attachments.get(src);
    return attachment ? getAttachmentDataUrl(attachment) : src;
}

export async function loader({params}) {
    const postId = decodePathParam(params?.postId);
    const postObj = postId ? await getPostObject(postId) : null;
    const displayName = await getDisplayName();
    if (postObj && postObj.author !== displayName) {
        throw new Error(`Sorry, you are not authorized to edit this post.`);
    }
    return {postObj};
}

export async function action({request, params}) {
    const formData = await request.formData();
    const title = formData.get("Title");
    const content = formData.get("Content");
    const actionType = formData.get("ActionType");
    const requestBody = {
        content: {
            Title: title,
            Content: content
        }
    }
    if (actionType === 'new') {
        requestBody.content.type = 'post';
    } else if (actionType === 'edit') {
        requestBody.PostID = decodePathParam(params.postId);
    }

    await addModifyPost(requestBody, actionType);
    return redirect(actionType === 'edit' ? postsPostPath(params.postId) : "/posts");
}

export default function AddModifyPost({type}) {
    const mode = type === "new" ? "添加" : "编辑";
    const navigate = useNavigate();
    const submit = useSubmit();
    const loaderData = useLoaderData();
    const postObj = loaderData?.postObj;
    const preparedPostContent = useMemo(
        () => preparePostContentForEditing(postObj?.content ?? ""),
        [postObj?.content]
    );
    const [title, setTitle] = useState(postObj?.title ?? "");
    const [content, setContent] = useState(preparedPostContent.content);
    const [attachments, setAttachments] = useState(preparedPostContent.attachments);
    const [contentError, setContentError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const attachmentsRef = useRef(attachments);
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    const contentBytes = estimateFinalPostContentBytes(content, attachments);
    const contentTooLarge = contentBytes > POST_CONTENT_MAX_BYTES;
    const postContentMessage = contentTooLarge
        ? `文章内容不能超过 ${formatPostContentSize(POST_CONTENT_MAX_BYTES)}，当前 ${formatPostContentSize(contentBytes)}。`
        : contentError;
    useEffect(() => {
        attachmentsRef.current = attachments;
    }, [attachments]);

    const handleAttachmentPrepared = useCallback((file) => {
        const attachment = createPostAttachmentFromFile(file);
        const nextAttachments = new Map(attachmentsRef.current);
        nextAttachments.set(attachment.token, attachment);
        attachmentsRef.current = nextAttachments;
        setAttachments(nextAttachments);
        return attachment.token;
    }, []);
    const resolveAttachmentPreview = useCallback(
        (src) => getPostAttachmentPreviewUrl(src, attachmentsRef.current),
        []
    );

    async function handleSubmit(event) {
        event.preventDefault();
        if (contentTooLarge || submitting) {
            return;
        }
        const form = event.currentTarget;
        const submitter = event.nativeEvent.submitter;
        setSubmitting(true);
        try {
            const finalizedContent = await finalizePostContentAttachments(content, attachmentsRef.current);
            const finalizedContentBytes = getUtf8ByteLength(finalizedContent);
            if (finalizedContentBytes > POST_CONTENT_MAX_BYTES) {
                setContentError(`文章内容不能超过 ${formatPostContentSize(POST_CONTENT_MAX_BYTES)}，当前 ${formatPostContentSize(finalizedContentBytes)}。`);
                return;
            }
            const formData = new FormData(form);
            if (submitter?.name) {
                formData.set(submitter.name, submitter.value);
            }
            formData.set("Content", finalizedContent);
            submit(formData, {method: "post"});
        } catch (error) {
            setContentError(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Form
            method='post'
            onSubmit={handleSubmit}
            style={{display: 'flex', flexDirection: 'column', height: "100%", gap: "1rem"}}
        >
            <Typography variant="h4" sx={{alignSelf: 'center'}}>{mode}文章</Typography>
            <TextField
                label="题目"
                variant="standard"
                name='Title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <MarkDownEditor
                Description={content}
                setDescription={(value) => {
                    setContent(value);
                    if (contentError) {
                        setContentError("");
                    }
                }}
                darkMode={darkMode}
                allowAttachments
                onAttachmentPrepared={handleAttachmentPrepared}
                resolveAttachmentPreview={resolveAttachmentPreview}
                onMarkdownError={setContentError}
            />
            <Typography variant="caption" color={postContentMessage ? "error" : "text.secondary"}>
                {postContentMessage || `内容大小 ${formatPostContentSize(contentBytes)} / ${formatPostContentSize(POST_CONTENT_MAX_BYTES)}`}
            </Typography>
            <textarea name="Content" hidden={true} value={content} readOnly/>
            <ButtonGroup>
                <Button type="submit" name="ActionType" value={type} disabled={contentTooLarge || submitting}> 提交 </Button>
                <Button onClick={() => navigate(-1)}> 取消 </Button>
            </ButtonGroup>
        </Form>
    )
}
