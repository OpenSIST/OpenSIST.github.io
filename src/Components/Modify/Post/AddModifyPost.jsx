import {Form, redirect, useLoaderData, useNavigate} from "react-router-dom";
import {Button, ButtonGroup, TextField, Typography, useTheme} from "@mui/material";
import React, {useState} from "react";
import MarkDownEditor from "../Program/MarkDownEditor/MarkDownEditor";
import {addModifyPost, getPostObject} from "../../../Data/PostData";
import {getDisplayName} from "../../../Data/UserData";
import {decodePathParam, postsPostPath} from "../../RouteUtils";

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
    const loaderData = useLoaderData();
    const postObj = loaderData?.postObj;
    const [title, setTitle] = useState(postObj?.title ?? "");
    const [content, setContent] = useState(postObj?.content ?? "");
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';

    return (
        <Form method='post' style={{display: 'flex', flexDirection: 'column', height: "100%", gap: "1rem"}}>
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
                setDescription={setContent}
                darkMode={darkMode}
            />
            <textarea name="Content" hidden={true} value={content} readOnly/>
            <ButtonGroup>
                <Button type="submit" name="ActionType" value={type}> 提交 </Button>
                <Button onClick={() => navigate(-1)}> 取消 </Button>
            </ButtonGroup>
        </Form>
    )
}
