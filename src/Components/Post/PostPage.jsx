import {getPosts} from "../../Data/PostData";
import {Link, Outlet, useLoaderData} from "react-router-dom";
import {CollapseSideBar} from "../common";
import {Button, Divider, List, ListItemButton, ListItemText, Paper, Tooltip, useTheme} from "@mui/material";
import {Add} from "@mui/icons-material";
import "./PostPage.css"
import React, {Fragment} from "react";
import SearchBar from "../ProgramPage/SideBar/SearchBar/SearchBar";
import Grid2 from "@mui/material/Grid";
import {postsPostPath} from "../RouteUtils";

export async function loader({request}) {
    const url = new URL(request.url);
    const searchStr = url.searchParams.get("searchStr");
    const posts = await getPosts({searchStr});
    return {posts, searchStr};
}

export default function PostPage() {
    const loaderData = useLoaderData();
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
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
                <Grid2 container sx={{width: '100%'}}>
                    <Tooltip title="撰写新文章" arrow>
                        <Button component={Link} to="/posts/new" variant="outlined" fullWidth sx={{
                            transition: 'background-color 0s',
                            bgcolor: (theme) => theme.palette.surfaceVariant,
                        }}>
                            <Add/>
                        </Button>
                    </Tooltip>
                </Grid2>
                <Paper
                    variant='elevation'
                    elevation={darkMode ? 0 : 1}
                    sx={{
                        bgcolor: (theme) => theme.palette.surfaceVariant,
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
