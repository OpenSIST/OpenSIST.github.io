import {getPostObject} from "../../../Data/PostData";
import {Form, Link, useLoaderData} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import {Edit, Refresh} from "@mui/icons-material";
import React from "react";
import {useSmallPage} from "../../common";
import {isAuthApplicant} from "../../../Data/ApplicantData";
import "./PostContent.css"
import {TimeTick2String} from "../../../Data/Common";

export async function loader({params}) {
    const postId = params.postId;
    const postObj = await getPostObject(postId);
    const editable = await isAuthApplicant(postObj.Author)
    return {postObj, editable};
}

export default function PostContent() {
    const {postObj, editable} = useLoaderData();
    const smallPage = useSmallPage();
    return (
        <>
            <Box className="PostContentHeader" sx={{pb: "0.5rem"}}>
                <Typography variant={smallPage ? 'h4' : 'h3'} sx={{display: 'flex', position: 'relative'}}>
                    {postObj.Title}
                </Typography>
                {editable ? <div className='ReviseRefreshButtonGroup'>
                    <Tooltip title="编辑项目简介" arrow>
                        <IconButton component={Link} to={`edit${window.location.search}`}>
                            <Edit/>
                        </IconButton>
                    </Tooltip>
                    <Form method='post' style={{display: 'flex'}}>
                        <Tooltip title="刷新项目内容" arrow>
                            <IconButton type='submit' name="ActionType" value="Refresh">
                                <Refresh/>
                            </IconButton>
                        </Tooltip>
                    </Form>
                </div> : null}
            </Box>
            <Box className="PostContentHeader" sx={{pb: "0.5rem"}}>
                <Typography variant={smallPage ? 'h4' : 'h5'} sx={{display: 'flex', position: 'relative'}}>
                    {postObj.Author}
                </Typography>
                <Box>
                    <Typography>
                        创建于: {new Date(postObj.created).toISOString().split('T')[0]}
                    </Typography>
                    <Typography>
                        {/*最后更改于: {TimeTick2String(postObj.modified)}*/}
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