import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";
import {LoadingBackdrop} from "./common";
import {Paper, useTheme} from "@mui/material";
import ReactMarkdown from "react-markdown";

function Home() {
    const theme = useTheme();
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
            <ReactMarkdown>
                [![License: GPL
                v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
            </ReactMarkdown>
            <a href="https://github.com/opensist/opensist.github.io">
                <img alt="GitHub Repo stars"
                     src="https://img.shields.io/github/stars/opensist/opensist.github.io?style=social"/>
            </a>
            <div>
                <p>
                    各位申请海外留学的SISTor们，欢迎来到OpenSIST，我们旨在为大家提供一个更加开放的留学申请信息分享平台，希望大家在这里能够打破信息壁垒，让自己的申请规划有更多有价值的信息参考。
                </p>
                <p>
                    <strong>如果你喜欢这个网站，请点亮Star支持我们！</strong>
                </p>
                <h2>网站声明：</h2>
                <ul>
                    <li>
                        本网站为OpenSIST的阶段性临时演示网站，<b style={{color: 'red'}}>严禁</b>公开演示网址。
                    </li>
                    <li>
                        本项目目前仍处在开发阶段, 请各位用户谅解网站可能存在的不便,
                        目前绝大多数网站设计和功能尚未完成，部分页面（包括此页面）属临时搭建，并不代表最终成品。
                    </li>
                    <li>
                        请各位用户遵守网站的<a href="/agreement">隐私条款及用户守则</a>。
                    </li>
                </ul>

            </div>
        </div>
    );
}

export default Home;
export {HomeIndex};