import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";
import {LoadingBackdrop} from "./common";
import {Paper} from "@mui/material";


function Home() {
    return (
        <Paper>
            <TopBar/>
            <Outlet/>
            <LoadingBackdrop/>
        </Paper>
    );
}

export default Home;