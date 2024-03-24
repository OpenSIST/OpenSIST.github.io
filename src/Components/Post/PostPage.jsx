import {getPosts} from "../../Data/PostData";
import {Form, Link, Outlet, useLoaderData} from "react-router-dom";
import {CollapseSideBar} from "../common";
import {
    Button, ButtonGroup,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Tooltip,
    useTheme
} from "@mui/material";
import {grey} from "@mui/material/colors";
import {Add, Refresh} from "@mui/icons-material";
import "./PostPage.css"
import React, {Fragment} from "react";
import SearchBar from "../ProgramPage/SideBar/SearchBar/SearchBar";

export async function loader({request}) {
    const url = new URL(request.url);
    const searchStr = url.searchParams.get("searchStr");
    let posts = await getPosts(false, {searchStr});
    posts = posts.filter((post) => post.type === 'Post');
    return {posts, searchStr};
}

export async function action() {
    return await getPosts(true);
}

export default function PostPage() {
    const loaderData = useLoaderData();
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
                    mt: '10px',
                    gap: '10px'
                }
            }}>
                <SearchBar query={{searchStr: loaderData.searchStr}} pageName='post'/>
                <ButtonGroup fullWidth>
                    <Form action="/posts/new" style={{width: "100%"}}>
                        <Tooltip title="撰写新文章" arrow>
                            <Button type="submit" fullWidth sx={{
                                transition: 'background-color 0s',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[800] : '#fff',
                            }}>
                                <Add/>
                            </Button>
                        </Tooltip>
                    </Form>
                    <Form method='post' style={{width: "100%"}}>
                        <Tooltip title="刷新列表" arrow>
                            <Button type="submit" fullWidth sx={{
                                transition: 'background-color 0s',
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[800] : '#fff',
                            }}>
                                <Refresh/>
                            </Button>
                        </Tooltip>
                    </Form>
                </ButtonGroup>
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
                        {loaderData.posts.map((post) => (
                            <Fragment key={post.PostID}>
                                <ListItemButton component={Link} to={`/posts/${post.PostID}`}>
                                    <ListItemText primary={post.Title} secondary={post.Author}/>
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
                    bgcolor: (theme) => theme.palette.mode === "dark" ? grey[900] : grey[50],
                }}
            >
                <Outlet/>
            </Paper>
        </>
    )
}