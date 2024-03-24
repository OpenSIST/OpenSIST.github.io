import TopBar from "./TopBar/TopBar";
import {Outlet, Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {LoadingBackdrop} from "./common";
import {Button, Divider, Paper} from "@mui/material";
import ReactMarkdown from "react-markdown";
import MDPath from "../Data/HomeIndex.md";
import {faQq} from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
    const [markDown, setMarkDown] = useState("");
    useEffect(() => {
        fetch(MDPath)
            .then((response) => response.text())
            .then((text) => setMarkDown(text));
    }, []);
    return (
        <div style={{width: '70%'}}>
            <h1 style={{textAlign: 'center'}}>欢迎来到OpenSIST</h1>
            <ReactMarkdown>
                [![License: GPL
                v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
                [![GitHub
                watchers](https://img.shields.io/github/watchers/opensist/opensist.github.io?style=social)](https://github.com/opensist/opensist.github.io/subscription)
                [![GitHub Repo
                stars](https://img.shields.io/github/stars/opensist/opensist.github.io?style=social)](https://github.com/opensist/opensist.github.io)
            </ReactMarkdown>
            <ReactMarkdown>
                各位申请海外留学的SISTor们，欢迎来到OpenSIST，我们旨在为大家提供一个更加开放的留学申请信息分享平台，希望大家在这里能够打破信息壁垒，让自己的申请规划有更多有价值的信息参考。
                {/*如果你喜欢这个网站，希望能前往[GitHub](https://github.com/opensist/opensist.github.io)为我们点亮Star！*/}
            </ReactMarkdown>
            <h3><b>新用户请先移步至<a href='/how-to-use'>使用指南</a>！</b></h3>
            <h5><b>如果你喜欢这个网站，希望能前往<a href='https://github.com/opensist/opensist.github.io'>GitHub</a>为我们点亮Star！</b></h5>
            <Button component={Link} to='https://qm.qq.com/q/2n4Qkv4mHG' variant='contained' size='large'
                    startIcon={<FontAwesomeIcon icon={faQq} fontSize='medium'/>}>
                加入用户QQ群：132055126
            </Button>
            <Divider variant='large' sx={{mt: '1rem'}}/>
            <ReactMarkdown>
                {markDown}
            </ReactMarkdown>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <a href='https://clustrmaps.com/site/1byzl' title='Visit tracker'><img
                    src='//clustrmaps.com/map_v2.png?cl=ffffff&w=300&t=n&d=nL8sqkScWCg2KiW9yxACDHTsb1IQmrffhV3KaXc9ARo' alt='1'/></a>
            </div>
        </div>
    );
}

export default Home;
export {HomeIndex};