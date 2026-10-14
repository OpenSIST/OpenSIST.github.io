import {getPosts} from "../../Data/PostData";
import {Link, Outlet, useLoaderData} from "react-router-dom";
import {CollapseSideBar} from "../common";
import {Box, Divider, IconButton, List, ListItemButton, ListItemText, Paper, Tooltip, Typography} from "@mui/material";
import {Add} from "@mui/icons-material";
import "./PostPage.css"
import React, {Fragment} from "react";
import SearchBar from "../ProgramPage/SideBar/SearchBar/SearchBar";
import {postsPostPath} from "../RouteUtils";

export async function loader({request}) {
    const url = new URL(request.url);
    const searchStr = url.searchParams.get("searchStr");
    const posts = await getPosts({searchStr});
    return {posts, searchStr};
}

export default function PostPage() {
    const loaderData = useLoaderData();
    return (
        <>
            <CollapseSideBar sx={{
                '& .MuiDrawer-paper': {
                    bgcolor: (theme) => theme.palette.surface,
                    width: '250px',
                    height: 'calc(100vh - 120px)',
                    p: '20px',
                    mt: '10px',
                    gap: '10px'
                }
            }}>
                <SearchBar query={{searchStr: loaderData.searchStr}} pageName='post'/>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '2px'}}>
                    <Typography variant='caption' sx={{color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em'}}>
                        文章列表
                    </Typography>
                    <Tooltip title="撰写新文章" arrow>
                        <IconButton component={Link} to="/posts/new" size='small' sx={{color: 'text.secondary'}}>
                            <Add fontSize='small'/>
                        </IconButton>
                    </Tooltip>
                </Box>
                <Paper
                    variant='elevation'
                    elevation={0}
                    sx={{
                        bgcolor: (theme) => theme.palette.surfaceVariant,
                        height: "100%",
                        overflowY: "auto"
                    }}
                >
                    <List
                        component='nav'
                        sx={{
                            borderRadius: '8px',
                            overflowY: 'auto'
                        }}
                    >
                        {loaderData.posts.map((post) => (
                            <Fragment key={post.id}>
                                <ListItemButton component={Link} to={postsPostPath(post.id)}>
                                    <ListItemText primary={post.title} secondary={post.author}/>
                                </ListItemButton>
                                <Divider component="li" light/>
                            </Fragment>
                        ))}
                    </List>
                </Paper>
            </CollapseSideBar>
            <Paper
                className="PostContent"
                elevation={0}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: (theme) => theme.palette.surface,
                }}
            >
                <Outlet/>
            </Paper>
        </>
    );
}
