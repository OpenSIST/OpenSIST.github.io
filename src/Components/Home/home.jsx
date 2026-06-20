import TopBar from "../TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {LoadingBackdrop, OpenSIST} from "../common";
import {Box, Button, Chip, Divider, Link as MuiLink, Paper, Stack, Typography, useTheme} from "@mui/material";
import {
    AutoGraphOutlined,
    EditNoteOutlined,
    GitHub,
    KeyboardArrowDown,
    MenuBookOutlined,
    NorthEastRounded,
    PersonOutlineOutlined,
    SchoolOutlined,
    StarRounded,
    TableChartOutlined,
    TravelExploreOutlined,
} from "@mui/icons-material";
import {clickHandler, initMap} from "../WorldMap/display";
import './home.css';
import {getPrograms} from "../../Data/ProgramData";
import {getRecords} from "../../Data/RecordData";
import {getPosts} from "../../Data/PostData";

const PAGE_COUNT = 5;

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
            {/* full-viewport soft wash — gives the frosted cards smooth tonal
                variation to refract. It's fixed so it spans edge to edge instead
                of being clipped by the 1700px content cap. */}
            <Box aria-hidden sx={{
                position: 'fixed',
                top: 60,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                pointerEvents: 'none',
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(155deg, #141B26 0%, #0F1318 52%, #12171F 100%)'
                    : 'linear-gradient(155deg, #EEF4FD 0%, #D8E4F6 48%, #E7ECF6 100%)',
            }}/>
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
        height: 'calc(100vh - 60px)',
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
                height: 'calc(100vh - 60px)',
                overflow: 'hidden'
            }}
        >
            <Box sx={{
                height: `calc(${PAGE_COUNT} * (100vh - 60px))`,
                transform: `translateY(calc(-${pageIndex} * (100vh - 60px)))`,
                transition: 'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)',
            }}>
                <Box sx={{...screenSx, justifyContent: 'safe center', px: {xs: 2, md: 0}, ml: {xs: 0, md: '2rem'}}}>
                    <WelcomeBlock/>
                </Box>
                <Box sx={centeredScreenSx}>
                    <FeaturesBlock/>
                </Box>
                <Box sx={centeredScreenSx}>
                    <StepsBlock/>
                </Box>
                <Box sx={centeredScreenSx}>
                    <StatsBlock/>
                </Box>
                <Box sx={centeredScreenSx}>
                    <LinksBlock/>
                </Box>
            </Box>

            <PageDots pageIndex={pageIndex} setPageIndex={setPageIndex}/>
            <ScrollHint show={pageIndex < PAGE_COUNT - 1} onClick={() => setPageIndex(pageIndex + 1)}/>
        </Box>
    );
}

function PageDots({pageIndex, setPageIndex}) {
    const dark = useTheme().palette.mode === 'dark';
    const gradient = dark
        ? 'linear-gradient(140deg, #93C0F2, #6BA6E8)'
        : 'linear-gradient(140deg, #1C5BAA, #4F86CE)';
    const ring = dark ? 'rgba(107,166,232,0.20)' : 'rgba(28,91,170,0.16)';
    const glow = dark ? 'rgba(107,166,232,0.55)' : 'rgba(28,91,170,0.45)';
    const railGradient = dark
        ? 'linear-gradient(180deg, transparent, rgba(147,192,242,0.28), transparent)'
        : 'linear-gradient(180deg, transparent, rgba(28,91,170,0.20), transparent)';
    const idle = dark ? 'rgba(231,235,241,0.35)' : 'rgba(16,24,40,0.22)';
    const idleHover = dark ? 'rgba(231,235,241,0.6)' : 'rgba(16,24,40,0.4)';

    return (
        <Box sx={{
            position: 'fixed',
            right: {xs: 14, md: 26},
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.75,
            zIndex: 10,
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 2,
                bottom: 2,
                left: '50%',
                width: 2,
                transform: 'translateX(-50%)',
                borderRadius: 2,
                background: railGradient,
                zIndex: -1,
            },
        }}>
            {Array.from({length: PAGE_COUNT}).map((_, p) => {
                const active = pageIndex === p;
                return (
                    <Box
                        key={p}
                        role="button"
                        aria-label={`第 ${p + 1} 屏`}
                        onClick={() => setPageIndex(p)}
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            background: active ? gradient : idle,
                            transform: active ? 'scale(1.6)' : 'scale(1)',
                            boxShadow: active ? `0 0 0 4px ${ring}, 0 3px 12px ${glow}` : 'none',
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': active ? {} : {transform: 'scale(1.3)', background: idleHover},
                        }}
                    />
                );
            })}
        </Box>
    );
}

function ScrollHint({show, onClick}) {
    return (
        <Box
            onClick={onClick}
            sx={{
                position: 'fixed',
                left: '50%',
                bottom: 24,
                transform: 'translateX(-50%)',
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
            }}
        >
            <Typography variant='caption' sx={{letterSpacing: '0.12em'}}>向下滑动</Typography>
            <KeyboardArrowDown className='ScrollHint'/>
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
            maxWidth: '100%',
            minWidth: 0,
            p: {xs: '1.25rem', md: '1.25rem 2.25rem'},
            bgcolor: dark ? 'rgba(21,25,32,0.55)' : 'rgba(255,255,255,0.42)',
            border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.5)',
            boxShadow: dark ? '0 10px 40px rgba(0,0,0,0.45)' : '0 10px 40px rgba(16,24,40,0.12)',
        }}>
            <Typography variant='h6' sx={{fontFamily: 'Merriweather', color: 'text.secondary', mb: '0.15rem'}}>
                Welcome to
            </Typography>
            <OpenSIST props={{variant: 'h2'}} sx={{
                display: 'inline-block',
                fontSize: {xs: '2.4rem', sm: '2.8rem', md: '3rem'},
                background: dark ? 'linear-gradient(120deg, #93C0F2, #6BA6E8)' : 'linear-gradient(120deg, #1C5BAA, #4F86CE)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
            }}/>
            <Typography sx={{mt: '0.4rem', color: 'text.secondary', letterSpacing: '0.02em'}}>
                上海科技大学留学申请信息分享平台
            </Typography>
            <Divider sx={{my: '0.85rem', borderColor: 'divider'}}/>
            <Typography sx={{mb: '1rem', lineHeight: 1.7}}>
                OpenSIST由上海科技大学2020级信息学院同学自发创建，旨在为上科大学子提供一个更加开放的留学申请信息分享平台，帮助大家更好地规划自己的留学申请。如果喜欢，欢迎给我们一个 Star ⭐
            </Typography>
            <Stack direction='row' sx={{mb: '0.85rem', flexWrap: 'wrap', gap: 1}}>
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

const FRIEND_LINKS = [
    {
        group: '申请网站',
        items: [
            {name: 'Open CS Application', label: '陆本申请北美选校定位平台', href: 'https://opencs.app'},
            {name: 'Global CS', label: '陆本申请欧洲 / 港新地区信息共享', href: 'https://global-cs-application.github.io'},
            {
                name: 'CS PhD Statements of Purpose',
                label: 'CS PhD 文书参考',
                href: 'https://cs-sop.notion.site/CS-PhD-Statements-of-Purpose-df39955313834889b7ac5411c37b958d',
            },
            {name: 'GradCafe', label: '海外硕博申请信息共享平台', href: 'https://www.thegradcafe.com/'},
        ],
    },
    {
        group: '校内链接',
        items: [
            {name: 'ACM@SIST', label: '学校 ACM 社团', href: 'https://acm.shanghaitech.edu.cn/'},
        ],
    },
];

function LinkRow({item, dark}) {
    return (
        <Box
            component='a'
            href={item.href}
            target='_blank'
            rel='noopener'
            sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 1,
                py: 0.5,
                px: 1,
                borderRadius: 2,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 0.15s ease, transform 0.15s ease',
                '&:hover': {
                    bgcolor: dark ? 'rgba(147,192,242,0.10)' : 'rgba(28,91,170,0.07)',
                    transform: 'translateX(3px)',
                },
                '&:hover .linkArrow': {opacity: 1},
            }}
        >
            <Typography variant='body2' sx={{fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap', flexShrink: 0}}>
                {item.name}
            </Typography>
            <Typography variant='caption' sx={{color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0}}>
                {item.label}
            </Typography>
            <NorthEastRounded className='linkArrow' sx={{fontSize: 16, color: 'primary.main', opacity: 0.45, transition: 'opacity 0.15s ease', flexShrink: 0, alignSelf: 'center'}}/>
        </Box>
    );
}

function LinksBlock() {
    const dark = useTheme().palette.mode === 'dark';
    const cardTitleSx = {fontWeight: 800, display: 'inline-block', ...gradientTextSx(dark)};
    const thanks = [
        <>本项目受到 <MuiLink href='https://github.com/xichenpan' target='_blank' rel='noopener'>flash 老师</MuiLink> 的{' '}
            <MuiLink href='https://opencs.app' target='_blank' rel='noopener'>OpenCS</MuiLink> 项目的启发。</>,
        <>内测阶段得到了信息学院与生医工学院毕业生们的大力支持，他们的宝贵建议对 OpenSIST 的完善至关重要。</>,
        <>信息学院的倪鹤南老师为本项目提供了诸多行政上的支持。</>,
    ];
    return (
        <Box sx={{width: '100%', maxWidth: 980}}>
            <SectionHeading title='友情链接 & 致谢' subtitle='站在前人的肩膀上，也感谢一路同行的人'/>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: {xs: 2, md: 2.5}, alignItems: 'start'}}>
                <Box className='GlassCard' sx={glassSx(dark, {p: {xs: '1.25rem', md: '1.5rem'}})}>
                    <Typography variant='h6' sx={cardTitleSx}>友情链接</Typography>
                    <Divider sx={{my: 1.25, borderColor: 'divider'}}/>
                    {FRIEND_LINKS.map((sec) => (
                        <Box key={sec.group} sx={{mb: 1}}>
                            <Typography variant='overline' sx={{color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em'}}>
                                {sec.group}
                            </Typography>
                            <Box sx={{mt: 0.25}}>
                                {sec.items.map((item) => <LinkRow key={item.name} item={item} dark={dark}/>)}
                            </Box>
                        </Box>
                    ))}
                </Box>
                <Box className='GlassCard' sx={glassSx(dark, {p: {xs: '1.25rem', md: '1.5rem'}})}>
                    <Typography variant='h6' sx={cardTitleSx}>特别鸣谢</Typography>
                    <Divider sx={{my: 1.25, borderColor: 'divider'}}/>
                    <Stack spacing={1.25}>
                        {thanks.map((t, i) => (
                            <Box key={i} sx={{display: 'flex', gap: 1.25, alignItems: 'flex-start'}}>
                                <Box sx={{mt: '0.5em', width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: brandGradient(dark)}}/>
                                <Typography variant='body2' sx={{color: 'text.secondary', lineHeight: 1.7}}>{t}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}

function brandGradient(dark) {
    return dark ? 'linear-gradient(140deg, #93C0F2, #6BA6E8)' : 'linear-gradient(140deg, #1C5BAA, #4F86CE)';
}

function gradientTextSx(dark) {
    return {
        background: brandGradient(dark),
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
    };
}

function glassSx(dark, extra = {}) {
    return {
        bgcolor: dark ? 'rgba(21,25,32,0.55)' : 'rgba(255,255,255,0.42)',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.5)',
        boxShadow: dark ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(16,24,40,0.1)',
        ...extra,
    };
}

function IconBadge({children}) {
    const dark = useTheme().palette.mode === 'dark';
    return (
        <Box sx={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: brandGradient(dark),
            color: '#fff',
            boxShadow: dark ? '0 6px 16px rgba(107,166,232,0.32)' : '0 6px 16px rgba(28,91,170,0.26)',
        }}>
            {children}
        </Box>
    );
}

function SectionHeading({title, subtitle}) {
    const dark = useTheme().palette.mode === 'dark';
    return (
        <Box sx={{textAlign: 'center', mb: {xs: 2, md: 3}}}>
            <Typography variant='h4' sx={{fontWeight: 800, display: 'inline-block', ...gradientTextSx(dark)}}>
                {title}
            </Typography>
            {subtitle ? <Typography sx={{color: 'text.secondary', mt: 0.75}}>{subtitle}</Typography> : null}
        </Box>
    );
}

function FeaturesBlock() {
    const dark = useTheme().palette.mode === 'dark';
    const features = [
        {icon: <SchoolOutlined/>, title: '项目信息表', desc: '汇总海外高校硕博项目的方向、目标专业与申请要点，边浏览边筛选。'},
        {icon: <TableChartOutlined/>, title: '申请季数据汇总', desc: '上千条学长学姐的真实申请记录，可按背景、项目、结果自由检索。'},
        {icon: <MenuBookOutlined/>, title: '经验分享帖', desc: '选校、套磁、文书、面试、就业，过来人的第一手长文经验。'},
        {icon: <PersonOutlineOutlined/>, title: '个人申请档案', desc: '记录你的申请人信息与时间线，匿名或实名地回馈社区。'},
    ];
    return (
        <Box sx={{width: '100%', maxWidth: 920}}>
            <SectionHeading title='OpenSIST 能帮你做什么' subtitle='一个开放、共享的上科大留学申请信息平台'/>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: {xs: 2, md: 2.5}}}>
                {features.map((f) => (
                    <Box key={f.title} className='GlassCard'
                         sx={glassSx(dark, {p: {xs: '1.25rem 1.5rem', md: '1.5rem 1.75rem'}, display: 'flex', gap: 2, alignItems: 'flex-start'})}>
                        <IconBadge>{f.icon}</IconBadge>
                        <Box>
                            <Typography sx={{fontWeight: 700, mb: 0.5}}>{f.title}</Typography>
                            <Typography variant='body2' sx={{color: 'text.secondary', lineHeight: 1.7}}>{f.desc}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

function StepsBlock() {
    const dark = useTheme().palette.mode === 'dark';
    const steps = [
        {n: 1, icon: <TravelExploreOutlined/>, title: '浏览与检索', desc: '在项目信息表和数据汇总里查看项目与历年真实案例，用筛选快速锁定目标。'},
        {n: 2, icon: <EditNoteOutlined/>, title: '建立你的档案', desc: '注册后在个人主页添加申请人与申请记录，数据会自动汇入数据汇总。'},
        {n: 3, icon: <AutoGraphOutlined/>, title: '分享与互助', desc: '撰写经验帖、补充项目信息，把经验传递给学弟学妹，让社区一起成长。'},
    ];
    return (
        <Box sx={{width: '100%', maxWidth: 980}}>
            <SectionHeading title='三步开始使用' subtitle='从浏览到贡献，几分钟就能上手'/>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'}, gap: {xs: 2, md: 2.5}}}>
                {steps.map((s) => (
                    <Box key={s.n} className='GlassCard'
                         sx={glassSx(dark, {p: {xs: '1.5rem', md: '1.75rem'}, display: 'flex', flexDirection: 'column', gap: 1})}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5}}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: brandGradient(dark), color: '#fff', fontWeight: 700,
                                boxShadow: dark ? '0 6px 16px rgba(107,166,232,0.32)' : '0 6px 16px rgba(28,91,170,0.26)',
                            }}>{s.n}</Box>
                            <Box sx={{color: 'primary.main', display: 'flex'}}>{s.icon}</Box>
                        </Box>
                        <Typography sx={{fontWeight: 700}}>{s.title}</Typography>
                        <Typography variant='body2' sx={{color: 'text.secondary', lineHeight: 1.8}}>{s.desc}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

function StatNumber({value}) {
    const [n, setN] = useState(0);
    useEffect(() => {
        if (value === null) return;
        let raf;
        const start = performance.now();
        const dur = 1200;
        const tick = (t) => {
            const p = Math.min((t - start) / dur, 1);
            setN(Math.floor(p * value));
            if (p < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                setN(value);
            }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value]);
    return value === null ? '—' : n.toLocaleString();
}

function StatsBlock() {
    const dark = useTheme().palette.mode === 'dark';
    const [stats, setStats] = useState({programs: null, univs: null, records: null, posts: null});
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const p = await getPrograms();
                if (alive) setStats((s) => ({...s, programs: Object.values(p).flat().length, univs: Object.keys(p).length}));
            } catch { /* not signed in / offline — leave as null */ }
            try {
                const r = await getRecords();
                if (alive) setStats((s) => ({...s, records: Object.keys(r ?? {}).length}));
            } catch { /* ignore */ }
            try {
                const posts = await getPosts();
                if (alive) setStats((s) => ({...s, posts: posts.length}));
            } catch { /* ignore */ }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const tiles = [
        {icon: <TravelExploreOutlined/>, value: stats.programs, label: '收录项目'},
        {icon: <SchoolOutlined/>, value: stats.univs, label: '覆盖高校'},
        {icon: <TableChartOutlined/>, value: stats.records, label: '申请记录'},
        {icon: <MenuBookOutlined/>, value: stats.posts, label: '经验分享'},
    ];
    return (
        <Box sx={{width: '100%', maxWidth: 920}}>
            <SectionHeading title='社区数据' subtitle='由上科大学子共同积累与维护'/>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr 1fr', md: 'repeat(4, 1fr)'}, gap: {xs: 2, md: 2.5}}}>
                {tiles.map((t) => (
                    <Box key={t.label} className='GlassCard'
                         sx={glassSx(dark, {p: {xs: '1.25rem', md: '1.75rem 1rem'}, textAlign: 'center'})}>
                        <Box sx={{color: 'primary.main', display: 'flex', justifyContent: 'center', mb: 1}}>{t.icon}</Box>
                        <Typography sx={{fontWeight: 800, lineHeight: 1.1, fontSize: {xs: '2rem', md: '2.6rem'}, display: 'inline-block', ...gradientTextSx(dark)}}>
                            <StatNumber value={t.value}/>
                        </Typography>
                        <Typography variant='body2' sx={{color: 'text.secondary', mt: 0.5}}>{t.label}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
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
