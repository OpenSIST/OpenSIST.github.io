import React from "react";
import "./NavBar.css";
import {useLocation, Link} from "react-router-dom";
import {Tabs, Tab} from "@mui/material";
import {useUser} from "../../../Data/UserData";

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
            name: "使用指南",
            path: "/how-to-use",
        }, {
            name: "申请季数据汇总",
            path: "/datapoints",
        }, {
            name: "项目信息表",
            path: "/programs",
        }, {
            name: "申请分享帖",
            path: "/posts",
        }, {
            name: "常见问题",
            path: "/FAQ",
        }, {
            name: "关于我们",
            path: "/about-us",
        }
    ]
    const routeMatch = useRouteMatch(navItems.map((item) => item.path));
    const currentTab = routeMatch ?? false;

    if (!useUser()) {
        return null;
    }
    return (
        <Tabs
            value={currentTab}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            role="navigation"
        >
            {navItems.map((item, index): React.ReactNode => (
                <Tab
                    key={index}
                    label={item.name}
                    value={item.path}
                    to={item.path}
                    component={Link}
                    // sx={{fontSize: "1.2rem"}}
                />
            ))}
        </Tabs>
    );
}
