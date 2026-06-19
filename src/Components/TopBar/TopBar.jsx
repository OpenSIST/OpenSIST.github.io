import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import {useNavigate} from "react-router-dom";
import {AppBar, SvgIcon, Toolbar, useTheme} from "@mui/material";
import LightIcon from '../icons/header.svg?react';
import DarkIcon from '../icons/header-dark.svg?react';
import LightShortIcon from '../icons/light.svg?react';
import DarkShortIcon from '../icons/dark.svg?react';
import {useUser} from "../../Data/UserData";
import {useSmallPage} from "../common";

function TopBar() {
    const navigate = useNavigate();
    const user = useUser()
    const smallPage = useSmallPage();

    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <AppBar position='sticky'
                elevation={0}
                sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 19, 24, 0.8)' : 'rgba(236, 241, 249, 0.8)',
                    color: (theme) => theme.palette.text.primary,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    display: "block",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}>
            <Toolbar className="TopBar" sx={{
                p: (smallPage ? 0 : 'auto'),
                minHeight: '60px',
                '@media (min-width:600px)': {
                    minHeight: '60px',
                },
            }}>
                <SvgIcon
                    component={darkMode ? (smallPage ? DarkShortIcon : DarkIcon) : (smallPage ? LightShortIcon : LightIcon)}
                    inheritViewBox
                    onClick={() => navigate(user === null ? "/login" : "/")}
                    sx={{
                        height: "40px",
                        width: (smallPage ? "40px" : "auto"),
                        pl: (smallPage ? "8px" : 0),
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
