import TopBar from "../TopBar/TopBar";
import {Link, Outlet} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {BoldTypography, LoadingBackdrop, OpenSIST} from "../common";
import {Box, Button, Divider, Paper, Typography, useTheme} from "@mui/material";
import {GitHub, KeyboardArrowDown} from "@mui/icons-material";
import Grid2 from "@mui/material/Grid";
import {clickHandler, initMap} from "../WorldMap/display";
import './home.css';

const PAGE_COUNT = 2;

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
    const [pageIndex, setPageIndex] = useState(0);
    const contentRef = useRef(null);
    const pageIndexRef = useRef(0);

    // the landing is a fixed full-screen snap experience — lock document scroll
    // while it's mounted so the sticky top bar can never be dragged by a gesture
    useEffect(() => {
        const html = document.documentElement;
        const prevHtml = html.style.overflow;
        const prevBody = document.body.style.overflow;
        // reset any scroll carried over from the previous page before locking,
        // otherwise the frozen offset would clip the sticky top bar
        window.scrollTo(0, 0);
        html.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        return () => {
            html.style.overflow = prevHtml;
            document.body.style.overflow = prevBody;
        };
    }, []);

    // keep the ref in sync for the imperative scroll handlers, and start each
    // newly-shown screen at the top
    useEffect(() => {
        pageIndexRef.current = pageIndex;
        const screen = contentRef.current?.firstElementChild?.children[pageIndex];
        if (screen) screen.scrollTop = 0;
    }, [pageIndex]);

    useEffect(() => {
        const node = contentRef.current;
        let lock = false;
        // One gesture = one page change. The lock absorbs trackpad inertia
        // (which fires a burst of +/- deltas) so the page can't flip-flop.
        const go = (dir) => {
            if (lock) return;
            setPageIndex((cur) => {
                const next = Math.min(Math.max(cur + (dir > 0 ? 1 : -1), 0), PAGE_COUNT - 1);
                if (cur === next) return cur;
                lock = true;
                setTimeout(() => {
                    lock = false;
                }, 1000);
                return next;
            });
        };
        // when the active screen's own content overflows, let it scroll natively
        // until it hits the edge — only then do we snap to the next/prev screen
        const canScrollWithin = (dir) => {
            const screen = node.firstElementChild?.children[pageIndexRef.current];
            if (!screen) return false;
            const {scrollTop, scrollHeight, clientHeight} = screen;
            if (scrollHeight - clientHeight <= 2) return false;
            return dir > 0 ? scrollTop + clientHeight < scrollHeight - 2 : scrollTop > 2;
        };
        const onWheel = (e) => {
            if (Math.abs(e.deltaY) < 8) return;
            if (canScrollWithin(e.deltaY)) return;
            // at an edge — own the gesture (also kills the rubber-band that drags
            // the sticky top bar) and snap to the neighbouring screen
            e.preventDefault();
            go(e.deltaY);
        };
        let touchStartY = null;
        const onTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };
        const onTouchMove = (e) => {
            if (touchStartY === null) return;
            const dy = touchStartY - e.touches[0].clientY;
            if (canScrollWithin(dy)) return;
            e.preventDefault();
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

    const screenSx = {
        height: 'calc(100dvh - 60px)',
        boxSizing: 'border-box',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        // content is compacted to fit common viewport heights; on unusually
        // short windows it stays scrollable (wheel/touch) but we hide the
        // scrollbar so the landing never shows an ugly bar
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {display: 'none'},
    };
    const centeredScreenSx = {
        ...screenSx,
        justifyContent: 'safe center',
        alignItems: 'center',
        px: {xs: 2, md: 4},
    };

    return (
        <Box
            ref={contentRef}
            sx={{
                position: 'absolute',
                width: {xs: '100%', md: '80%'},
                left: {xs: 0, md: 'auto'},
                height: 'calc(100dvh - 60px)',
                overflow: 'hidden'
            }}
        >
            <Box sx={{
                height: `calc(${PAGE_COUNT} * (100dvh - 60px))`,
                transform: `translateY(calc(-${pageIndex} * (100dvh - 60px)))`,
                transition: 'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)',
                '@media (prefers-reduced-motion: reduce)': {transition: 'none'},
            }}>
                <Box sx={{...screenSx, justifyContent: 'safe center', pl: {xs: 2, md: 0}, pr: {xs: 4, md: 0}, ml: {xs: 0, md: '2rem'}}}>
                    <WelcomeBlock/>
                </Box>
                <Box sx={centeredScreenSx}>
                    <Grid2 container spacing={{xs: 4, md: 8}} sx={{width: '100%', py: 5}}>
                        <Grid2 size={{xs: 12, md: 6}}>
                            <HomeIndexContentBlock title="友情链接"/>
                        </Grid2>
                        <Grid2 size={{xs: 12, md: 6}} sx={{alignSelf: 'flex-end'}}>
                            <HomeIndexContentBlock title="特别鸣谢"/>
                        </Grid2>
                    </Grid2>
                </Box>
            </Box>

            <PageDots pageIndex={pageIndex} setPageIndex={setPageIndex}/>
            <ScrollHint show={pageIndex < PAGE_COUNT - 1} onClick={() => setPageIndex(pageIndex + 1)}/>
        </Box>
    );
}

function PageDots({pageIndex, setPageIndex}) {
    return (
        <Box component="nav" aria-label="首页翻页" sx={{
            position: 'fixed', right: {xs: 4, md: 20}, top: '50%',
            display: 'flex', flexDirection: 'column', zIndex: 10,
            transform: 'translateY(-50%)',
        }}>
            {['欢迎', '友情链接与致谢'].map((label, p) => (
                <Box component="button" type="button" key={label}
                     aria-label={label} aria-current={pageIndex === p ? 'step' : undefined}
                     onClick={() => setPageIndex(p)}
                     sx={{
                         width: 32, height: 40, p: 0, border: 0, bgcolor: 'transparent',
                         color: pageIndex === p ? 'primary.main' : 'text.secondary', cursor: 'pointer',
                         '&::after': {content: '""', display: 'block', mx: 'auto', width: 4,
                             height: pageIndex === p ? 24 : 10, bgcolor: 'currentColor',
                             opacity: pageIndex === p ? 1 : 0.3, transition: 'height 0.2s'},
                         '&:focus-visible': {outline: '2px solid currentColor'},
                     }}/>
            ))}
        </Box>
    );
}

function ScrollHint({show, onClick}) {
    return (
        <Box
            component="button"
            type="button"
            aria-label="滚动到下一屏"
            aria-hidden={!show}
            tabIndex={show ? 0 : -1}
            onClick={onClick}
            sx={{
                position: 'fixed',
                left: '50%',
                bottom: 24,
                transform: 'translateX(-50%)',
                p: 0,
                border: 'none',
                background: 'none',
                font: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.25,
                color: 'text.secondary',
                cursor: 'pointer',
                zIndex: 10,
                opacity: show ? 0.85 : 0,
                pointerEvents: show ? 'auto' : 'none',
                transition: 'opacity 0.4s ease, color 0.2s ease',
                '&:hover': {color: 'primary.main'},
                '&:focus-visible': {outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 4, borderRadius: 1},
            }}
        >
            <Typography variant='caption' sx={{letterSpacing: '0.12em'}}>向下滑动</Typography>
            <KeyboardArrowDown className='ScrollHint'/>
        </Box>
    );
}

function WelcomeBlock() {
    const theme = useTheme();
    const linkColor = theme.palette.mode === "dark" ? "#fff" : "#4183C4";

    return (
        <Box
            sx={{
                width: {xs: '100%', sm: '70%', md: '60%', lg: '50%'},
                position: 'relative',
                backdropFilter: 'blur(2px)',
            }}>
            <Typography variant='h4' sx={{fontFamily: 'Merriweather', mb: '1rem'}}>
                Welcome to
            </Typography>
            <OpenSIST props={{variant: 'h2'}} sx={{fontSize: {xs: 'clamp(2.5rem, 12vw, 3.75rem)', md: '3.75rem'}, color: theme.palette.mode === 'dark' ? '#80b3fa' : '#004098'}}/>
            <Divider sx={{
                mt: '1rem',
                mb: '1rem',
                bgcolor: theme.palette.mode === 'dark' ? "#fff" : "#000",
                height: '1px'
            }}/>
            <Typography sx={{mb: '1rem', mr: 0}}>
                OpenSIST由上海科技大学2020级信息学院同学自发创建，旨在为上科大学子提供一个更加开放的留学申请信息分享平台，帮助大家更好地规划自己的留学申请。
            </Typography>
            <BoldTypography>
                如果你喜欢这个网站，请前往<a href='https://github.com/opensist/opensist.github.io' style={{color: linkColor}}><b>GitHub</b></a>给我们一个Star!
            </BoldTypography>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, my: 2}}>
                <Button variant="outlined" component="a" href="https://www.gnu.org/licenses/gpl-3.0"
                        size="small" sx={{color: 'text.secondary', borderColor: 'divider'}}>GPL v3</Button>
                <Button variant="outlined" component="a" href="https://github.com/opensist/opensist.github.io"
                        startIcon={<GitHub/>} size="small" sx={{color: 'text.primary', borderColor: 'divider', textTransform: 'none'}}>Star</Button>
            </Box>
            <Button variant='contained' component={Link} to='https://qm.qq.com/q/U1QvSyE6u6'
                    sx={{textTransform: 'none'}}>
                OpenSIST QQ群
            </Button>
        </Box>
    )
}

function HomeIndexContentBlock({title}) {
    const theme = useTheme();
    const linkColor = theme.palette.mode === "dark" ? "#fff" : "#4183C4";
    const blockItems = (title) => {
        if (title === "友情链接") {
            return (
                <div>
                    <Typography variant='h5'>申请网站</Typography>
                    <ul style={{marginRight: 0}}>
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
                <ul style={{marginRight: 0}}>
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
    return (
        <Box sx={{backdropFilter: 'blur(2px)'}}>
            <BoldTypography variant='h4'>
                {title}
            </BoldTypography>
            <Divider sx={{
                mt: '1rem',
                mb: '1rem',
                bgcolor: theme.palette.mode === 'dark' ? "#fff" : "#000",
                height: '1px'
            }}/>
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
