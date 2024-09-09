import {Form, Link, redirect, useLoaderData, useNavigate} from "react-router-dom";
import {Button, ButtonGroup, FormControl, MenuItem, TextField, Typography,} from "@mui/material";
import React, {useState} from "react";
import MarkDownEditor from "../Program/MarkDownEditor/MarkDownEditor";
import {addModifyPost, getPostObject} from "../../../Data/PostData";
import {getApplicantIDByDisplayName, getApplicants, isAuthApplicant} from "../../../Data/ApplicantData";
import Autocomplete from "@mui/material/Autocomplete";
import {list2Options} from "../../../Data/Schemas";

export async function loader({params}) {
    const postId = params?.postId;
    const postObj = postId ? await getPostObject(postId) : null;
    const isAuth = await isAuthApplicant(postObj?.Author);
    if (!isAuth && postObj) {
        await getApplicants(true);
        const doubleCheck = await isAuthApplicant(postObj?.Author);
        if (!doubleCheck) {
            // We can guarantee that the user is not authorized to view the profile page.
            throw new Error(`Sorry, you are not authorized to edit this post.`);
        }
    }
    const authorList = await getApplicantIDByDisplayName();
    const authorOption = list2Options(authorList);
    return {postObj, authorOption};
}

export async function action({request, params}) {
    const formData = await request.formData();
    const title = formData.get("Title");
    const content = formData.get("Content");
    const ActionType = formData.get("ActionType");
    let requestBody = {
        content: {
            Title: title,
            Content: content
        }
    }
    if (ActionType === 'new') {
        requestBody.ApplicantID = formData.get('Author');
        requestBody.content.type = 'Post';
    } else if (ActionType === 'edit') {
        requestBody.PostID = params.postId;
    }
    await addModifyPost(requestBody, ActionType);
    return redirect("/posts");
}

export default function AddModifyPost({type}) {
    const mode = type === "new" ? "添加" : "编辑";
    const navigate = useNavigate();
    const loaderData = useLoaderData();
    const postObj = loaderData?.postObj;
    const authorOption = loaderData?.authorOption;
    const [title, setTitle] = useState(postObj?.Title ?? "");
    const [author, setAuthor] = useState(authorOption.find((author => author.value === postObj?.Author)) ?? null);
    const [content, setContent] = useState(postObj?.Content ?? "");
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
            <FormControl>
                <Autocomplete
                    options={authorOption}
                    value={author}
                    onChange={(e, value) => setAuthor(value)}
                    readOnly={type === "edit"}
                    renderInput={(params) => (
                        <>
                            <TextField
                                {...params}
                                label={"作者" + (type === "edit" ? "（不可更改）" : "")}
                                variant="standard" required
                                helperText={<Link to={`/profile/new-applicant`}>暂无申请人选项？点击添加</Link>}
                            />
                            <TextField sx={{display: "none"}} name="Author" value={author?.value || ""}/>
                        </>
                    )}
                    fullWidth
                    required
                >
                    {authorOption.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Autocomplete>
            </FormControl>
            <MarkDownEditor Description={content} setDescription={setContent}/>
            <textarea name="Content" hidden={true} value={content} readOnly/>
            <ButtonGroup>
                <Button type="submit" name="ActionType" value={type}> 提交 </Button>
                <Button onClick={() => navigate("..")}> 取消 </Button>
            </ButtonGroup>
        </Form>
    )
}