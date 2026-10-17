import React, {useState} from "react";
import "./NavBar.css";
import {Link, useLocation} from "react-router-dom";
import {Button, Menu, MenuItem, Tab, Tabs} from "@mui/material";
import {useUser} from "../../../Data/UserData";

import {Menu as MenuIcon} from "@mui/icons-material";
import {useSmallPage} from "../../common";

function useRouteMatch(patterns) {
    const {pathname} = useLocation();
    for (let i = 0; i < patterns.length; i += 1) {
        const pattern = patterns[i];
        if (pattern === '/') {
            if (pathname === '/') {
                return '/';
            }
            continue;
        }
        const possibleMatch = pathname.startsWith(pattern) ? pattern : null;
        if (possibleMatch !== null) {
            return possibleMatch;
        }
    }

    return null;
}

export default function NavBar() {
    const navItems = [
        {
            name: "首页",
            path: "/",
        }, {
            name: "申请季数据汇总",
            path: "/datapoints",
        }, {
            name: "项目信息表",
            path: "/programs",
        }, {
            name: "经验分享帖",
            path: "/posts",
        }, {
            name: "帮助中心",
            path: "/FAQ",
        }
    ]
    const routeMatch = useRouteMatch(navItems.map((item) => item.path));
    const currentTab = routeMatch ?? false;

    const smallPage = useSmallPage();
    const [anchor, setAnchor] = useState(null);
    if (!useUser()) {
        return null;
    }
    if (smallPage) {
        return <>
            <Button aria-label="打开导航菜单" aria-haspopup="menu" aria-expanded={Boolean(anchor)}
                    onClick={(event) => setAnchor(event.currentTarget)} startIcon={<MenuIcon/>}
                    sx={{minHeight: 44, flex: 1, justifyContent: 'flex-start', ml: 1, color: 'text.primary'}}>
                {navItems.find((item) => item.path === currentTab)?.name ?? '导航'}
            </Button>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                {navItems.map((item) => <MenuItem key={item.path} component={Link} to={item.path}
                    selected={item.path === currentTab} onClick={() => setAnchor(null)}
                    sx={{minHeight: 48, minWidth: 200}}>{item.name}</MenuItem>)}
            </Menu>
        </>;
    }
    return (
        <Tabs
            value={currentTab}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            role="navigation"
        >
            {navItems.map((item, index) => (
                <Tab
                    key={index}
                    label={item.name}
                    value={item.path}
                    to={item.path}
                    component={Link}
                />
            ))}
        </Tabs>
    );
}
