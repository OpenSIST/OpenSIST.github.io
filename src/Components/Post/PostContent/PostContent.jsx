import {getPostObject, removePost} from "../../../Data/PostData";
import {Form, Link, redirect, useLoaderData} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
    Box,
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
    Input,
    Tooltip,
    Typography, Paper
} from "@mui/material";
import {Delete, Edit, Refresh} from "@mui/icons-material";
import React, {useState} from "react";
import {BoldTypography, useSmallPage} from "../../common";
import {isAuthApplicant} from "../../../Data/ApplicantData";
import "./PostContent.css"
import {getAvatar, getMetaData} from "../../../Data/UserData";
import Grid2 from "@mui/material/Unstable_Grid2";

export async function loader({params}) {
    const postId = params.postId;
    try {
        const postObj = await getPostObject(postId);
        const editable = await isAuthApplicant(postObj?.Author);
        const metaData = postObj?.Author ? await getMetaData(postObj?.Author.split("@")[0]) : {};
        const avatar = await getAvatar(metaData?.Avatar, postObj?.Author);
        return {postObj, editable, avatar};
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
    const {postObj, editable, avatar} = useLoaderData();
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
                <Box sx={{pb: "0.5rem", display: 'flex', gap: '1rem'}}>
                    <Avatar src={avatar} sx={{height: (smallPage ? "5rem" : "4rem"), width: (smallPage ? "5rem" : "4rem"), cursor: 'pointer'}} component={Link}
                            to={`/datapoints/applicant/${postObj.Author}`}/>
                    <Grid2 container>
                        <Grid2 xs={12}>
                            <BoldTypography variant="h6" component={Link} to={`/datapoints/applicant/${postObj.Author}`}
                                            sx={{
                                                cursor: 'pointer',
                                                textDecoration: "none",
                                            }}
                            >
                                {postObj.Author}
                            </BoldTypography>
                        </Grid2>
                        <Grid2 component={Typography} xs={12} md={5}>
                            创建于: {new Date(postObj.created).toISOString().split('T')[0]}
                        </Grid2>
                        <Grid2 component={Typography} xs={12} md={7}>
                            最后修改于: {new Date(postObj.modified).toISOString().split('T')[0]}
                        </Grid2>
                    </Grid2>
                </Box>
                <Box className='ReviseRefreshButtonGroup'>
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
                </Box>
            </Box>
            <Paper sx={{display: 'flex', flexDirection: 'column', p: '1rem', height: '100%', overflowY: 'auto'}}>
                <Typography variant={'h4'} sx={{display: 'flex', position: 'relative', mb: '1rem'}}>
                    {postObj.Title}
                </Typography>
                <ReactMarkdown>
                    {postObj.Content}
                </ReactMarkdown>
            </Paper>
        </>
    )
}