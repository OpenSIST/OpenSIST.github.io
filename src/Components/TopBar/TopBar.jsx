import React, {useEffect, useState} from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import {Link} from "react-router-dom";
import {AppBar, Button, SvgIcon, Toolbar, Typography, useTheme} from "@mui/material";
import {grey} from "@mui/material/colors";
import localforage from "localforage";
import { ReactComponent as LightIcon} from '../icons/light.svg';
import { ReactComponent as DarkIcon} from '../icons/dark.svg';

function TopBar() {
    const [user, setUser] = useState(null);
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    useEffect(() => {
        localforage.getItem('user').then((value) => {
            setUser(value);
        });
    }, []);
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
                <Button component={Link} to={user ? "/" : "/login"} sx={{gap: "10px"}}>
                    <SvgIcon component={darkMode ? DarkIcon : LightIcon} inheritViewBox sx={{fontSize: '2.5rem'}}/>
                    <Typography sx={{cursor: 'pointer'}} variant="h4">OpenSIST</Typography>
                </Button>
                <NavBar/>
                <StatusBlock/>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;