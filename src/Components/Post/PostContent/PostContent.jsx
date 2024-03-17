import {getPostObject, removePost} from "../../../Data/PostData";
import {Form, Link, redirect, useLoaderData} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {Box, Button, Dialog, DialogActions, DialogTitle, IconButton, Input, Tooltip, Typography} from "@mui/material";
import {Delete, Edit, Refresh} from "@mui/icons-material";
import React, {useState} from "react";
import {useSmallPage} from "../../common";
import {isAuthApplicant} from "../../../Data/ApplicantData";
import "./PostContent.css"

export async function loader({params}) {
    const postId = params.postId;
    try {
        const postObj = await getPostObject(postId);
        const editable = await isAuthApplicant(postObj?.Author)
        return {postObj, editable};
    } catch (e) {
        throw e;
    }
}

export async function action({request, params}) {
    const postId = params.postId;
    const formData = await request.formData();
    const author = formData.get('Author');
    const ActionType = formData.get('ActionType');
    if (ActionType === 'Refresh') {
        return await getPostObject(postId, true);
    } else if (ActionType === 'Delete') {
        await removePost(postId, author);
        return redirect("/posts");
    }
}

export default function PostContent() {
    const {postObj, editable} = useLoaderData();
    const smallPage = useSmallPage();
    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
    };
    return (
        <>
            <Box className="PostContentHeader" sx={{pb: "0.5rem"}}>
                <Typography variant={smallPage ? 'h4' : 'h3'} sx={{display: 'flex', position: 'relative'}}>
                    {postObj.Title}
                </Typography>
                <div className='ReviseRefreshButtonGroup'>
                    {editable ?
                        <>
                            <Tooltip title="编辑内容" arrow>
                                <IconButton component={Link} to={`edit${window.location.search}`}>
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
                                    是否要删除《{postObj.Title}》这篇文章？
                                </DialogTitle>
                                <DialogActions>
                                    <Button onClick={handleClose}>取消</Button>
                                    <Form method="post">
                                        <Input type="hidden" name="Author" value={postObj.Author}/>
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
                </div>
            </Box>
            <Box className="PostContentHeader" sx={{pb: "0.5rem"}}>
                <Typography>
                    作者: {postObj.Author}
                </Typography>
                <Box>
                    <Typography>
                        创建于: {new Date(postObj.created).toISOString().split('T')[0]}
                    </Typography>
                    <Typography>
                        最后更改于: {new Date(postObj.modified).toISOString().split('T')[0]}
                    </Typography>
                </Box>
            </Box>
            <ReactMarkdown>
                {postObj.Content}
            </ReactMarkdown>
        </>
    )
}