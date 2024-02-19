import {Form, Link, useLoaderData, useNavigate} from "react-router-dom";
import "./StatusBlock.css";
import React, {useContext, useEffect} from "react";
import localforage from "localforage";
import {getAvatar, getDisplayName, getMetaData, logout, useUser} from "../../../Data/UserData";
import {Avatar, Box, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, useTheme} from "@mui/material";
import {AccountBox, LockReset, Logout} from "@mui/icons-material";
import {blue} from "@mui/material/colors";
import {ThemeContext} from "../../../index";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export async function loader() {
    let displayName = null;
    let avatarUrl = null;
    const session = await localforage.getItem('session');
    const expireAt = await localforage.getItem('expireAt');
    if (session && expireAt > Date.now() / 1000) {
        displayName = await getDisplayName();
        const metaData = await getMetaData();
        avatarUrl = await getAvatar(metaData?.Avatar);
    }
    return {displayName, avatarUrl};

}

export async function action() {
    return await logout();
}

export function StatusBlock() {
    const {displayName, avatarUrl} = useLoaderData();
    const navigate = useNavigate();
    const theme = useTheme();
    const {toggleTheme} = useContext(ThemeContext);
    const user = useUser();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        if (user === null) {
            navigate('/login');
        }
    }, [user]);

    localforage.setItem('theme', theme.palette.mode).then()

    return (<Box sx={{display: 'flex', mr: '1vw'}}>
        <IconButton onClick={toggleTheme} sx={{m: 'auto'}}>
            {theme.palette.mode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon/>}
        </IconButton>
        {user ? <>
            <Tooltip title="Account settings">
                <IconButton onClick={handleMenu}>
                    <Avatar src={avatarUrl} sx={{bgcolor: blue[500]}}>{displayName?.slice(0, 1).toUpperCase()}</Avatar>
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
                <MenuItem to={`/profile`} component={Link} onClick={handleClose}>
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
                <Form method='post'>
                    <MenuItem component='button' type='submit' sx={{width: "100%"}} onClick={handleClose}>
                        <ListItemIcon>
                            <Logout fontSize="small"/>
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Form>
            </Menu>
        </> : null}
    </Box>);
}