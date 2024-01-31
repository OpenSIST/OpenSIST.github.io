import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import {Link} from "react-router-dom";
import {AppBar, Button, Toolbar, Typography} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {grey} from "@mui/material/colors";

function TopBar() {
    return (
        <AppBar position='sticky'
                elevation={1}
                sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[800] : grey[200],
                    color: (theme) => theme.palette.mode === 'dark' ? grey[100] : grey[900],
                    display: "block",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}>
            <Toolbar className="TopBar" sx={{
                    minHeight: '60px',
                    '@media (min-width:600px)': {
                        minHeight: '60px',
                    },
                }}>
                <Button component={Link} to={"/"}>
                    <MenuIcon/>
                    <Typography sx={{cursor: 'pointer'}} variant="h5">OpenSIST</Typography>
                </Button>
                <NavBar/>
                <StatusBlock/>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;