import React from "react";
import "./NavBar.css";
import {Link, useLocation} from "react-router-dom";
import {Tab, Tabs} from "@mui/material";
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
            name: "申请季数据汇总",
            path: "/datapoints",
        }, {
            name: "项目信息表",
            path: "/programs",
        }, {
            name: "经验分享帖",
            path: "/posts",
        }, {
            name: "常见问题",
            path: "/FAQ",
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
