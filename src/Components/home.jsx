import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";
import {LoadingBackdrop} from "./common";
import {Paper} from "@mui/material";

function Home() {
    return (
        <Paper elevation={0} >
            <TopBar/>
            <Paper
                className="ContentBlock"
                elevation={0}
            >
                <Outlet/>
            </Paper>
            <LoadingBackdrop/>
        </Paper>
    );
}

export default Home;
