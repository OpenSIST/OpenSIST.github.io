import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";
import {LoadingBackdrop} from "./common";
import {Paper, useTheme} from "@mui/material";


function Home() {
    const theme = useTheme();
    const darkMode = theme.palette.mode === "dark";
    return (
        <Paper>
            <TopBar/>
            <Outlet/>
            <LoadingBackdrop/>
        </Paper>
    );
}

export default Home;