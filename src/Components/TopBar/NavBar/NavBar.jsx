import React from "react";
import "./NavBar.css";
import {matchPath, useLocation, Link} from "react-router-dom";
import {useUnAuthorized} from "../../common";
import {Tabs, Tab} from "@mui/material";

function useRouteMatch(patterns) {
    const {pathname} = useLocation();

    for (let i = 0; i < patterns.length; i += 1) {
        const pattern = patterns[i];
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
            name: "关于我们",
            path: "/about-us", // TODO: write ABOUT US page
        },
        {
            name: "项目信息表",
            path: "/programs",
        },
        {
            name: "申请人信息表",
            path: "/applicants",
        },
    ]
    const routeMatch = useRouteMatch(navItems.map((item) => item.path));
    const currentTab = routeMatch ?? false;

    if (useUnAuthorized()) {
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
                />
            ))}
        </Tabs>
    );
}
