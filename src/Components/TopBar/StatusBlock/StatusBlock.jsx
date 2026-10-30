import {Form, Link, useLoaderData, useNavigate} from "react-router-dom";
import "./StatusBlock.css";
import React, {useContext, useEffect} from "react";
import {getAvatar, getDisplayName, getIsAdmin, getMetadata, logout, useUser} from "../../../Data/UserData";
import {Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography, useTheme} from "@mui/material";
import {AccountBoxRounded, AdminPanelSettingsRounded, ExitToAppRounded, LockResetRounded, StarRounded} from "@mui/icons-material";
import {ThemeContext} from "../../../index";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {emptyCache} from "../../../Data/Common";
import {startCoreCacheSync} from "../../../Data/CoreCacheSync";

export async function loader() {
    const displayName = await getDisplayName();
    const [metadata, isAdmin] = await Promise.all([
        getMetadata(displayName),
        getIsAdmin(),
    ]);
    const avatarUrl = await getAvatar(metadata?.Avatar, displayName);
    return {displayName, avatarUrl, isAdmin};
}

export async function action() {
    return logout();
}

export function StatusBlock() {
    const {displayName, avatarUrl, isAdmin} = useLoaderData();
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
            emptyCache().then(() => {
                if (window.location.pathname !== '/agreement') {
                    navigate('/login');
                }
            });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!user) {
            return undefined;
        }
        return startCoreCacheSync();
    }, [user]);

    return (<Box sx={{display: 'flex'}}>
        <Tooltip title={`${theme.palette.mode === 'dark' ? '关闭' : '打开'}夜间模式`} arrow>
            <IconButton onClick={toggleTheme} sx={{m: 'auto'}}>
                {theme.palette.mode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon/>}
            </IconButton>
        </Tooltip>
        {user ? <>
            <Tooltip title="Account settings" arrow>
                <IconButton onClick={handleMenu}>
                    <Avatar src={avatarUrl} sx={{bgcolor: 'primary.main'}}>{displayName?.slice(0, 1).toUpperCase()}</Avatar>
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
                        <AccountBoxRounded fontSize="small"/>
                    </ListItemIcon>
                    <Typography>Profile</Typography>
                </MenuItem>
                <MenuItem to={`/favorites`} component={Link} onClick={handleClose}>
                    <ListItemIcon>
                        <StarRounded fontSize="small"/>
                    </ListItemIcon>
                    Favorites
                </MenuItem>
                <MenuItem to="/reset" component={Link} onClick={handleClose}>
                    <ListItemIcon>
                        <LockResetRounded fontSize="small"/>
                    </ListItemIcon>
                    Reset Password
                </MenuItem>
                {isAdmin ? [
                    <Divider key="admin-divider"/>,
                    <MenuItem key="admin-link" to="/admin" component={Link} onClick={handleClose}>
                        <ListItemIcon>
                            <AdminPanelSettingsRounded fontSize="small"/>
                        </ListItemIcon>
                        Admin
                    </MenuItem>,
                ] : null}
                <Form method='post'>
                    <MenuItem component='button' type='submit' sx={{width: "100%"}} onClick={handleClose}>
                        <ListItemIcon>
                            <ExitToAppRounded fontSize="small"/>
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Form>
            </Menu>
        </> : null}
    </Box>);
}
