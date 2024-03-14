import {getPosts} from "../../Data/PostData";
import {Form, Link, Outlet, useLoaderData} from "react-router-dom";
import {CollapseSideBar} from "../common";
import {Divider, IconButton, List, ListItemButton, ListItemText, Paper, useTheme} from "@mui/material";
import {grey} from "@mui/material/colors";
import {Refresh} from "@mui/icons-material";
import "./PostPage.css"
import React, {Fragment} from "react";

export async function loader() {
    const posts = await getPosts();
    return {posts};
}

export async function action() {
    return await getPosts(true);
}

export default function PostPage() {
    const {posts} = useLoaderData();
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <>
            <CollapseSideBar sx={{
                '& .MuiDrawer-paper': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[900] : grey[50],
                    width: '250px',
                    height: 'calc(100vh - 120px)',
                    p: '20px',
                    mt: '10px'
                }
            }}>
                <Paper>
                    <Form method='post'>
                        <IconButton type="submit">
                            <Refresh/>
                        </IconButton>
                    </Form>
                    <Paper
                        variant='elevation'
                        elevation={darkMode ? 0 : 1}
                        sx={{
                            bgcolor: darkMode ? grey[800] : '#fff',
                            height: "100%",
                            overflowY: "auto"
                        }}
                    >
                        <List
                            component='nav'
                            sx={{
                                borderRadius: '5px',
                                overflowY: 'auto'
                            }}
                        >
                            {posts.map((post) => (
                                <Fragment key={post.PostID}>
                                    <ListItemButton component={Link} to={`/posts/${post.PostID}`}>
                                        <ListItemText primary={post.Title} secondary={post.Author}/>
                                    </ListItemButton>
                                    <Divider component="li" light/>
                                </Fragment>
                            ))}
                        </List>
                    </Paper>
                </Paper>
            </CollapseSideBar>
            <Paper
                className="PostContent"
                sx={{
                    bgcolor: (theme) => theme.palette.mode === "dark" ? grey[900] : grey[50],
                }}
            >
                <Outlet/>
            </Paper>
        </>
    )
}

export function PostIndex() {
    return (
        <>
            <h1>Posts</h1>
        </>
    )
}