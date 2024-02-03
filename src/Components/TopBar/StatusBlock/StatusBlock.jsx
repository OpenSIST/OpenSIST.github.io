import {Link} from "react-router-dom";
import "./StatusBlock.css";
import React, {useContext, useState} from "react";
import localforage from "localforage";
import {logout} from "../../../Data/UserData";
import {useUnAuthorized} from "../../common";
import {Avatar, Box, Button, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, useTheme} from "@mui/material";
import {AccountBox, LockReset, Logout} from "@mui/icons-material";
import {blue} from "@mui/material/colors";
import {ThemeContext} from "../../../index";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export function StatusBlock() {
    const theme = useTheme();
    const {toggleTheme} = useContext(ThemeContext);
    const [user, setUser] = useState('')
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = async () => {
        await logout();
        handleClose();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    localforage.getItem('user').then((value) => setUser(value));

    localforage.setItem('theme', theme.palette.mode).then()

    return (<Box sx={{display: 'flex', mr: '1vw'}}>
            <IconButton onClick={toggleTheme} sx={{m: 'auto'}}>
                {theme.palette.mode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon/>}
            </IconButton>
            {useUnAuthorized() ? null : <>
                <Tooltip title="Account settings">
                    <IconButton onClick={handleMenu}>
                        <Avatar sx={{bgcolor: blue[500]}}>{user?.slice(0, 1).toUpperCase()}</Avatar>
                    </IconButton>
                </Tooltip>
                <Menu
                    id="user-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    slotProps={{
                        paper: {
                            elevation: 0, sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                '&::before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 20,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }
                    }}
                    transformOrigin={{horizontal: 'right', vertical: 'top'}}
                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                >
                    <MenuItem to="/profile" component={Link} onClick={handleClose}>
                        <ListItemIcon>
                            <AccountBox fontSize="small"/>
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem to="/reset" component={Link} onClick={handleClose}>
                        <ListItemIcon>
                            <LockReset fontSize="small"/>
                        </ListItemIcon>
                        Reset Password
                    </MenuItem>
                    <MenuItem to="/login" component={Link} onClick={handleLogout}>
                        <ListItemIcon>
                            <Logout fontSize="small"/>
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </>}
        </Box>);
}