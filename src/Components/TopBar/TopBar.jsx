import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import {useNavigate} from "react-router-dom";
import {AppBar, SvgIcon, Toolbar, useTheme} from "@mui/material";
import {grey} from "@mui/material/colors";
import {ReactComponent as LightIcon} from '../icons/header.svg';
import {ReactComponent as DarkIcon} from '../icons/header-dark.svg';
import {ReactComponent as LightShortIcon} from '../icons/light.svg';
import {ReactComponent as DarkShortIcon} from '../icons/dark.svg';
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
                elevation={1}
                sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[800] : grey[200],
                    color: (theme) => theme.palette.mode === 'dark' ? grey[100] : grey[900],
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