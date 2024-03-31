import TopBar from "../TopBar/TopBar";
import {Outlet, Link} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {BoldTypography, LoadingBackdrop, OpenSIST, useSmallPage} from "../common";
import {Box, Button, Divider, IconButton, Paper, Typography, useTheme} from "@mui/material";
import {init_map} from "../WorldMap/display";
import Grid2 from "@mui/material/Unstable_Grid2";
import './home.css';
import ReactMarkdown from "react-markdown";
import {ArrowDownward, ArrowUpward} from "@mui/icons-material";
import {grey} from "@mui/material/colors";

function Home() {
    return (
        <Paper elevation={0} sx={{bgcolor: (theme) => theme.palette.mode === "dark" ? "#1A1E24" : "#fff"}}>
            <TopBar/>
            <Paper
                className="ContentBlock"
                elevation={0}
                sx={{bgcolor: (theme) => theme.palette.mode === "dark" ? "#1A1E24" : "#fff"}}
            >
                <Outlet/>
            </Paper>
            <LoadingBackdrop/>
        </Paper>
    );
}

export function HomeIndex() {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return (
        <Box
            sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? "#1A1E24" : "#FFFFFF",
                height: "100%",
                width: "100%",
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <WorldMap width={width} height={height}/>
            <HomeIndexContent/>
            {/*<MarkDownPage sx={{position: 'absolute', bgcolor: 'transparent', backgroundImage: 'none', boxShadow: 'none'}}/>*/}
        </Box>
    )
}

function HomeIndexContent() {
    const smallPage = useSmallPage();
    const [pageIndex, setPageIndex] = useState(0);
    const darkMode = useTheme().palette.mode === 'dark';
    return (
        <Box
            sx={{
                position: 'absolute',
                width: '80%',
                height: 'calc(100vh - 60px)',
                overflow: 'hidden'
            }}
        >
            <Box sx={{height: 'calc(200vh - 120px)'}} className={pageIndex === 0 ? 'HomeIndexContent-0' : 'HomeIndexContent-1'}>
                <Box sx={{height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', ml: smallPage ? 0 : '2rem'}}>
                    <WelcomeBlock/>
                    <IconButton
                        sx={{mx: 'auto', mt: '3rem', bgcolor: darkMode ? grey[800] : grey[200]}}
                        onClick={() => {
                            setPageIndex(1);
                        }}
                        size='large'
                        className='slide-out-elliptic-top-bck'
                    >
                        <ArrowUpward sx={{fontSize: '2rem'}} color='primary'/>
                    </IconButton>
                </Box>
                <Box sx={{height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', justifyContent: 'start', ml: smallPage ? 0 : '2rem'}}>
                    <IconButton
                        sx={{mx: 'auto', mt: '2rem', mb: '2rem', bgcolor: darkMode ? grey[800] : grey[200]}}
                        onClick={() => {
                            setPageIndex(0);
                        }}
                        size='large'
                        className='slide-out-elliptic-bottom-bck'
                    >
                        <ArrowDownward sx={{fontSize: '2rem'}} color='primary'/>
                    </IconButton>
                    <Grid2 container rowSpacing={smallPage ? 5 : 10}>
                        <Grid2 xs={12} lg={6}>
                            <HomeIndexContentBlock title="友情链接"/>
                        </Grid2>
                        {!smallPage ? <Grid2 xs={6}/> : null}
                        {!smallPage ? <Grid2 xs={6}/> : null}
                        <Grid2 xs={12} lg={6}>
                            <HomeIndexContentBlock title="特别鸣谢"/>
                        </Grid2>
                    </Grid2>
                </Box>
            </Box>
        </Box>
    )
}

function WelcomeBlock() {
    const linkColor = useTheme().palette.mode === "dark" ? "#fff" : "#4183C4";

    return (
        <Box sx={{width: {xs: '100%', sm: '70%', md: '60%', lg: '50%'}}}>
            <Typography variant='h4' sx={{fontFamily: 'Merriweather', mb: '1rem'}}>
                Welcome to
            </Typography>
            <OpenSIST props={{variant: 'h3'}}/>
            <Divider sx={{mt: '1rem', mb: '1rem'}}/>
            <Typography sx={{mb: '1rem'}}>
                OpenSIST是一个由上海科技大学2020级信息学院同学自发创建的留学申请信息共享平台，旨在为上科大学子提供一个更加开放的留学申请信息分享平台，帮助大家更好地规划自己的留学申请。<br/>
                如果你喜欢这个网站，请前往<a href='https://github.com/opensist/opensist.github.io'
                                            style={{color: linkColor}}>GitHub</a>给我们一个star!
            </Typography>
            <ReactMarkdown>
                [![License: GPL
                v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
                [![GitHub Repo
                stars](https://img.shields.io/github/stars/opensist/opensist.github.io?style=social)](https://github.com/opensist/opensist.github.io)
            </ReactMarkdown>
            <Button variant='contained' component={Link} to='/how-to-use'>
                Start
            </Button>
            <Button variant='outlined' component={Link} to='https://qm.qq.com/q/U1QvSyE6u6' sx={{ml: '1rem'}}>
                加入QQ群
            </Button>
        </Box>
    )
}

function HomeIndexContentBlock({title}) {
    const linkColor = useTheme().palette.mode === "dark" ? "#fff" : "#4183C4";
    const blockItems = (title) => {
        if (title === "友情链接") {
            return (
                <div>
                    <Typography variant='h5'>申请网站</Typography>
                    <ul>
                        <li>陆本申请北美选校定位平台：<a href="https://opencs.app" style={{color: linkColor}}>Open CS
                            Application</a></li>
                        <li>陆本申请欧洲/港新地区信息共享平台：<a href="https://global-cs-application.github.io"
                                                                 style={{color: linkColor}}>Global CS</a></li>
                        <li>CS PhD文书参考：<a
                            href="https://cs-sop.notion.site/CS-PhD-Statements-of-Purpose-df39955313834889b7ac5411c37b958d"
                            style={{color: linkColor}}>CS PhD Statements of Purpose</a></li>
                        <li>海外硕博申请信息共享平台（类似一亩三分地）：<a href="https://www.thegradcafe.com/"
                                                                        style={{color: linkColor}}>GradCafe</a></li>
                    </ul>
                    <Typography variant='h5'>校内链接</Typography>
                    <ul>
                        <li>学校ACM社团：<a href='https://acm.shanghaitech.edu.cn/'
                                           style={{color: linkColor}}>ACM@SIST</a></li>
                    </ul>
                </div>
            )
        } else if (title === '特别鸣谢') {
            return (
                <ul>
                    <li>
                        本项目受到<a href='https://github.com/xichenpan' style={{color: linkColor}}>flash老师</a>的<a
                        href='https://opencs.app' style={{color: linkColor}}>OpenCS</a>项目的启发
                    </li>
                    <li>
                        本项目在内测阶段得到了信息学院和生医工学院毕业生们的大力支持，他们的宝贵建议对OpenSIST的进一步完善至关重要
                    </li>
                    <li>
                        信息学院的倪鹤南老师为本项目提供了很多行政上的支持
                    </li>
                </ul>
            )
        }
    }
    return (
        <Box>
            <BoldTypography variant='h4'>
                {title}
            </BoldTypography>
            <Divider sx={{mt: '1rem', mb: '1rem'}}/>
            {blockItems(title)}
        </Box>
    )
}

function WorldMap({width, height}) {
    const theme = useTheme();
    const mode = theme.palette.mode;
    const dynamicCanvasRef = useRef(null);
    const staticCanvasRef = useRef(null);
    useEffect(() => {
        let map_width = Math.min(width, 1700);
        let map_height = height - 60;
        if (map_width > map_height * 1.75) {
            map_width = map_height * 1.75;
        } else {
            map_height = map_width / 1.75;
        }
        init_map(staticCanvasRef.current, dynamicCanvasRef.current, map_width, map_height, mode);
    }, [width, height, mode]);
    return (
        <>
            <canvas ref={staticCanvasRef} width={width} height={height}
                    style={{overflow: "auto", position: "relative"}}/>
            <canvas ref={dynamicCanvasRef} width={width} height={height}
                    style={{overflow: "auto", position: "absolute"}}/>
        </>
    )
}

export default Home;
