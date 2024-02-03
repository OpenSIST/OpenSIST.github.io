import React, {useState} from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import {useNavigate} from "react-router-dom";
import {AppBar, SvgIcon, Toolbar, useTheme} from "@mui/material";
import {grey} from "@mui/material/colors";
import localforage from "localforage";
import {ReactComponent as LightIcon} from '../icons/header.svg';
import {ReactComponent as DarkIcon} from '../icons/header-dark.svg';

function TopBar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    localforage.getItem('user').then((value) => {
        setUser(value);
    });
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
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
                <SvgIcon
                    component={darkMode ? DarkIcon : LightIcon}
                    inheritViewBox
                    onClick={() => navigate(user ? "/" : "/login")}
                    sx={{
                        height: "40px",
                        fontSize: '10em',
                        cursor: 'pointer',
                    }}
                />
                <NavBar/>
                <StatusBlock/>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;