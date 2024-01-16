import {Link, useNavigate} from "react-router-dom";
import "./StatusBlock.css";
import React, {useEffect, useState} from "react";
import localforage from "localforage";
import {logout} from "../../../Data/UserData";
import { useUnAuthorized} from "../../common";
import {Avatar, IconButton, ListItemIcon, Menu, MenuItem, Tooltip} from "@mui/material";
import {AccountBox, LockReset, Logout} from "@mui/icons-material";

export function StatusBlock() {
    const navigate = useNavigate();
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

    useEffect(() => {
        if (user === null) {
            navigate("/login");
        }
    }, [user]);

    if (useUnAuthorized()) {
        return null;
    }
    return (
        <div className='StatusBlock'>
            <Tooltip title="Account settings">
                <IconButton onClick={handleMenu}>
                    <Avatar>{user.slice(0, 1).toUpperCase()}</Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            // '& .MuiAvatar-root': {
                            //     width: 32,
                            //     height: 32,
                            //     ml: -0.5,
                            //     mr: 1,
                            // },
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
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem to="/profile" component={Link} onClick={handleClose}>
                    <ListItemIcon>
                        <AccountBox fontSize="small"/>
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem to="/reset" component={Link} onClick={handleClose}>
                    <ListItemIcon>
                        <LockReset fontSize="small" />
                    </ListItemIcon>
                    Reset Password
                </MenuItem>
                <MenuItem to="/login" component={Link} onClick={handleLogout} >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </div>
    );
}