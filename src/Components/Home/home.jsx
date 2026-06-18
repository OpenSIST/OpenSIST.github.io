import TopBar from "../TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {BoldTypography, LoadingBackdrop, OpenSIST, useSmallPage} from "../common";
import {Box, Button, Chip, Divider, IconButton, Paper, Stack, SvgIcon, Typography, useTheme} from "@mui/material";
import {GitHub, StarRounded} from "@mui/icons-material";
import {clickHandler, initMap} from "../WorldMap/display";
import Grid2 from "@mui/material/Grid";
import './home.css';
import VectorArrowDark from "../icons/VectorArrowDark.svg?react";
import VectorArrowLight from "../icons/VectorArrowLight.svg?react";
import {isSafari} from 'react-device-detect';

function Home() {
    return (
        <Paper elevation={0} sx={{bgcolor: (theme) => theme.palette.background.default}}>
            <TopBar/>
            <Paper
                className="ContentBlock"
                elevation={0}
                sx={{bgcolor: (theme) => theme.palette.background.default}}
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
    const nodeRef = useRef(null);
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        const node = nodeRef.current;
        node.addEventListener("click", clickHandler);
        window.addEventListener("resize", handleResize);
        return () => {
            node.removeEventListener("click", clickHandler);
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return (
        <Box
            ref={nodeRef}
            sx={{
                bgcolor: (theme) => theme.palette.background.default,
                height: "100%",
                width: "100%",
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <WorldMap width={width} height={height}/>
            <HomeIndexContent/>
        </Box>
    )
}

function HomeIndexContent() {
    const smallPage = useSmallPage();
    const [pageIndex, setPageIndex] = useState(0);
    const darkMode = useTheme().palette.mode === 'dark';
    const contentRef = useRef(null);

    useEffect(() => {
        const node = contentRef.current;
        let lock = false;
        // One gesture = one page change. The lock absorbs trackpad inertia
        // (which fires a burst of +/- deltas) so the page can't flip-flop.
        const go = (dir) => {
            if (lock) return;
            const next = dir > 0 ? 1 : 0;
            setPageIndex((cur) => {
                if (cur === next) return cur;
                lock = true;
                setTimeout(() => {
                    lock = false;
                }, 1000);
                return next;
            });
        };
        const onWheel = (e) => {
            // the landing is a fixed two-screen snap — never let the browser scroll
            // (kills the rubber-band that drags the sticky top bar)
            e.preventDefault();
            if (Math.abs(e.deltaY) < 8) return;
            go(e.deltaY);
        };
        let touchStartY = null;
        const onTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };
        const onTouchMove = (e) => {
            e.preventDefault();
            if (touchStartY === null) return;
            const dy = touchStartY - e.touches[0].clientY;
            if (Math.abs(dy) > 40) {
                go(dy);
                touchStartY = null;
            }
        };
        node.addEventListener("wheel", onWheel, {passive: false});
        node.addEventListener("touchstart", onTouchStart, {passive: true});
        node.addEventListener("touchmove", onTouchMove, {passive: false});
        return () => {
            node.removeEventListener("wheel", onWheel);
            node.removeEventListener("touchstart", onTouchStart);
            node.removeEventListener("touchmove", onTouchMove);
        };
    }, []);

    return (
        <Box
            ref={contentRef}
            sx={{
                position: 'absolute',
                width: '80%',
                height: 'calc(100vh - 60px)',
                overflow: 'hidden'
            }}
        >
            <Box sx={{height: 'calc(200vh - 120px)'}}
                 className={pageIndex === 0 ? 'HomeIndexContent-0' : 'HomeIndexContent-1'}>
                <Box
                    sx={{
                        height: 'calc(100vh - 60px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        ml: smallPage ? 0 : '2rem',
                        overflow: 'auto',
                    }}>
                    <WelcomeBlock/>
                    <IconButton
                        sx={{
                            mx: 'auto',
                            position: 'absolute',
                            left: 'calc(50% - 1.5rem - 8px)',
                            bottom: 'calc(100vh - 50px)',
                            "&:hover": {
                                bgcolor: 'transparent',
                            }
                        }}
                        onClick={() => {
                            setPageIndex(1);
                        }}
                        className='slide-out-blurred-top'
                    >
                        <SvgIcon
                            className='ScrollHint'
                            component={darkMode ? VectorArrowDark : VectorArrowLight}
                            inheritViewBox
                            sx={{
                                height: '3rem',
                                width: '3rem',
                                filter: 'drop-shadow(0px 0px 15px rgba(128, 128, 128, 0.4))',
                                "&:hover": isSafari ? {} : {
                                    filter: 'drop-shadow(0px 0px 15px rgb(128, 128, 128))'
                                }
                            }}
                        />
                    </IconButton>
                </Box>
                <Box sx={{
                    height: 'calc(100vh - 60px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'start',
                    ml: smallPage ? 0 : '2rem',
                    overflow: 'auto',
                }}>
                    <IconButton
                        sx={{
                            mx: 'auto',
                            position: 'absolute',
                            left: 'calc(50% - 1.5rem - 8px)',
                            top: 'calc(100vh - 50px)',
                            "&:hover": {
                                bgcolor: 'transparent',
                            }
                        }}
                        onClick={() => {
                            setPageIndex(0);
                        }}
                        className='slide-out-blurred-bottom'
                    >
                        <SvgIcon
                            component={darkMode ? VectorArrowDark : VectorArrowLight}
                            inheritViewBox
                            sx={{
                                fontSize: '3rem',
                                transform: 'rotate(180deg)',
                                filter: 'drop-shadow(0px 0px 15px rgba(128, 128, 128, 0.4))',
                                "&:hover": isSafari ? {} : {
                                    filter: 'drop-shadow(0px 0px 15px rgb(128, 128, 128))'
                                }
                            }}
                        />
                    </IconButton>
                    <Grid2 container rowSpacing={smallPage ? 5 : 10} sx={{mt: '3rem'}}>
                        <Grid2
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <HomeIndexContentBlock title="友情链接"/>
                        </Grid2>
                        {!smallPage ? <Grid2 size={6}/> : null}
                        {!smallPage ? <Grid2 size={6}/> : null}
                        <Grid2
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <HomeIndexContentBlock title="特别鸣谢"/>
                        </Grid2>
                    </Grid2>
                </Box>
            </Box>
        </Box>
    );
}

function WelcomeBlock() {
    const dark = useTheme().palette.mode === 'dark';
    const [stars, setStars] = useState(null);

    useEffect(() => {
        let alive = true;
        fetch('https://api.github.com/repos/opensist/opensist.github.io')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (alive && d && typeof d.stargazers_count === 'number') setStars(d.stargazers_count);
            })
            .catch(() => {
            });
        return () => {
            alive = false;
        };
    }, []);

    return (
        <Box className="GlassCard" sx={{
            width: {xs: '100%', sm: '80%', md: '62%', lg: '52%'},
            p: {xs: '1.5rem', md: '2rem 2.25rem'},
            bgcolor: dark ? 'rgba(21,25,32,0.55)' : 'rgba(246,249,253,0.66)',
            boxShadow: dark ? '0 10px 40px rgba(0,0,0,0.45)' : '0 10px 40px rgba(16,24,40,0.12)',
        }}>
            <Typography variant='h5' sx={{fontFamily: 'Merriweather', color: 'text.secondary', mb: '0.25rem'}}>
                Welcome to
            </Typography>
            <OpenSIST props={{variant: 'h2'}} sx={{
                display: 'inline-block',
                background: dark ? 'linear-gradient(120deg, #93C0F2, #6BA6E8)' : 'linear-gradient(120deg, #1C5BAA, #4F86CE)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
            }}/>
            <Typography sx={{mt: '0.5rem', color: 'text.secondary', letterSpacing: '0.02em'}}>
                上海科技大学留学申请信息分享平台
            </Typography>
            <Divider sx={{my: '1.25rem', borderColor: 'divider'}}/>
            <Typography sx={{mb: '1.25rem', lineHeight: 1.8}}>
                OpenSIST由上海科技大学2020级信息学院同学自发创建，旨在为上科大学子提供一个更加开放的留学申请信息分享平台，帮助大家更好地规划自己的留学申请。如果喜欢，欢迎给我们一个 Star ⭐
            </Typography>
            <Stack direction='row' sx={{mb: '1.5rem', flexWrap: 'wrap', gap: 1}}>
                <Chip
                    icon={<StarRounded/>}
                    label={stars !== null ? `${stars} Stars` : 'Star on GitHub'}
                    variant='outlined'
                    clickable
                    component='a'
                    href='https://github.com/opensist/opensist.github.io'
                    target='_blank'
                    rel='noopener'
                />
                <Chip label='GPL-3.0' variant='outlined'/>
            </Stack>
            <Stack direction='row' sx={{flexWrap: 'wrap', gap: 1.5}}>
                <Button variant='contained' component='a' href='https://qm.qq.com/q/U1QvSyE6u6'
                        target='_blank' rel='noopener'>
                    加入 QQ 群
                </Button>
                <Button variant='outlined' startIcon={<GitHub/>} component='a'
                        href='https://github.com/opensist/opensist.github.io' target='_blank' rel='noopener'>
                    GitHub
                </Button>
            </Stack>
        </Box>
    )
}

function HomeIndexContentBlock({title}) {
    const theme = useTheme();
    const linkColor = theme.palette.primary.main;
    const blockItems = (title) => {
        if (title === "友情链接") {
            return (
                <div>
                    <Typography variant='h5'>申请网站</Typography>
                    <ul style={{marginRight: '4rem'}}>
                        <li>陆本申请北美选校定位平台：<a href="https://opencs.app" style={{color: linkColor}}><b>Open CS
                            Application</b></a></li>
                        <li>陆本申请欧洲/港新地区信息共享平台：<a href="https://global-cs-application.github.io"
                                                                 style={{color: linkColor}}><b>Global CS</b></a></li>
                        <li>CS PhD文书参考：<a
                            href="https://cs-sop.notion.site/CS-PhD-Statements-of-Purpose-df39955313834889b7ac5411c37b958d"
                            style={{color: linkColor}}><b>CS PhD Statements of Purpose</b></a></li>
                        <li>海外硕博申请信息共享平台（类似一亩三分地）：<a href="https://www.thegradcafe.com/"
                                                                        style={{color: linkColor}}><b>GradCafe</b></a></li>
                    </ul>
                    <Typography variant='h5'>校内链接</Typography>
                    <ul>
                        <li>学校ACM社团：<a href='https://acm.shanghaitech.edu.cn/'
                                           style={{color: linkColor}}><b>ACM@SIST</b></a></li>
                    </ul>
                </div>
            )
        } else if (title === '特别鸣谢') {
            return (
                <ul style={{marginRight: '4rem'}}>
                    <li>
                        本项目受到<a href='https://github.com/xichenpan'
                                     style={{color: linkColor}}><b>flash老师</b></a>的<a
                        href='https://opencs.app' style={{color: linkColor}}><b>OpenCS</b></a>项目的启发
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
    const dark = theme.palette.mode === 'dark';
    return (
        <Box className="GlassCard" sx={{
            p: {xs: '1.25rem 1.5rem', md: '1.5rem 1.75rem'},
            bgcolor: dark ? 'rgba(21,25,32,0.55)' : 'rgba(246,249,253,0.66)',
            boxShadow: dark ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(16,24,40,0.1)',
        }}>
            <BoldTypography variant='h5'>
                {title}
            </BoldTypography>
            <Divider sx={{my: '1rem', borderColor: 'divider'}}/>
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
        const desired_scale = 1.9;
        if (map_width > map_height * desired_scale) {
            map_width = map_height * desired_scale;
        } else {
            map_height = map_width / desired_scale;
        }
        return initMap(staticCanvasRef.current, dynamicCanvasRef.current, map_width, map_height, mode);
    }, [width, height, mode]);
    return (
        <>
            <canvas ref={staticCanvasRef} width={width} height={height}
                    style={{overflow: "auto", position: "relative"}}/>
            <canvas ref={dynamicCanvasRef} width={width} height={height} onClick={clickHandler}
                    style={{overflow: "auto", position: "absolute"}}/>
        </>
    )
}

export default Home;
