import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";
import {LoadingBackdrop} from "./common";
import {Paper} from "@mui/material";


function Home() {
    return (
        <Paper elevation={0}>
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

function HomeIndex() {
    return (
        <div style={{width: '70%'}}>
            <h1 style={{textAlign: 'center'}}>欢迎来到OpenSIST</h1>
            <div>
                各位申请海外留学的SISTor们，欢迎来到OpenSIST，我们旨在为大家提供一个更加开放的留学申请信息分享平台，希望大家在这里能够打破信息壁垒，让自己的申请规划有更多有价值的信息参考。
            </div>
        </div>
    );
}

export default Home;
export {HomeIndex};