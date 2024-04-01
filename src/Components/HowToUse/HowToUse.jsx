import {
    Box, Card, CardActionArea, CardContent, Divider, Paper, Typography, useTheme
} from "@mui/material";
import React from "react";
import {Link} from "react-router-dom";
import {BoldTypography, OpenSIST} from "../common";
import DatapointsDark from "../../Assets/images/HowToUse/dark/datapoints.webp";
import DatapointsLight from "../../Assets/images/HowToUse/light/datapoints.webp";
import PostsDark from "../../Assets/images/HowToUse/dark/posts.webp";
import PostsLight from "../../Assets/images/HowToUse/light/posts.webp";
import ProfileDark from "../../Assets/images/HowToUse/dark/profile.webp";
import ProfileLight from "../../Assets/images/HowToUse/light/profile.webp";
import ProgramsDark from "../../Assets/images/HowToUse/dark/programs.webp";
import ProgramsLight from "../../Assets/images/HowToUse/light/programs.webp";
import LightPointer from "../../Assets/images/light-pointer-56px.png";
import DarkPointer from "../../Assets/images/dark-pointer-56px.png";
import "./HowToUse.css"

const imageDir = {
    light: {
        profile: ProfileLight,
        programs: ProgramsLight,
        datapoints: DatapointsLight,
        posts: PostsLight
    },
    dark: {
        profile: ProfileDark,
        programs: ProgramsDark,
        datapoints: DatapointsDark,
        posts: PostsDark
    }
}

export function HowToUse() {
    return (
        <Box sx={{p: '1rem', bgcolor: (theme) => theme.palette.mode === "dark" ? "#1A1E24" : "#FAFAFA"}}>
            <Typography variant="h4" sx={{textAlign: 'center'}}><OpenSIST props={{variant: 'h4'}}/>使用指南</Typography>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: "2rem", m: '2rem'}}>
                <Typography variant="h5">非毕业年级的在读生请阅读：</Typography>
                <Typography component="blockquote" variant="h6">请自由探索顶部导航栏的三个主要板块（申请季数据汇总、项目信息表、申请分享帖），每个版块内部请配合使用指南食用。</Typography>
            </Box>
            <Graduated/>
        </Box>
    )
}

export function GuidanceGrid({Index, TitlePrime, TitleSecond, Content, ButtonLink}) {
    const nameList = ['profile', 'datapoints', 'programs', 'posts'];
    const theme = useTheme();
    const inverse = Index % 2;
    return (
        <Card
            className='GuidanceCard'
            sx={{
                width: {
                    lg: "80%",
                    sm: "90%",
                    xs: "100%"
                },
                alignSelf: (inverse ? "start" : "end"),
                "& *": {
                    cursor: `url(${theme.palette.mode === 'light' ? LightPointer : DarkPointer}), pointer`
                }
            }}
        >
            <CardActionArea component={Link} to={ButtonLink}>
                <Paper
                    className="img-mask"
                    sx={{
                        minWidth: '100%',
                        display: 'flex',
                        flexDirection: (inverse ? 'row' : 'row-reverse'),
                        textAlign: 'start',
                        "&:before": {
                            backgroundImage: `url(${imageDir[theme.palette.mode][nameList[Index - 1]]})`,
                        }
                    }}
                >
                    <CardContent
                        sx={{
                            width: {
                                xs: '80%',
                                sm: '70%',
                                md: '60%',
                                lg: '50%',
                                xl: '40%'
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '1rem',
                            p: '12rem 4rem',
                            "&:last-child": {
                                pb: '4rem'
                            }
                        }}
                    >
                        <Box
                            // component="blockquote"
                            sx={{
                                m: 0,
                                // borderLeft: (inverse ? "4px solid #909090" : 'none'),
                                // borderRight: (inverse ? 'none' : "4px solid #909090"),
                                display: 'flex',
                                flexDirection: "column",
                                gap: "inherit"
                            }}
                        >
                            <BoldTypography variant='h3'>{Index}.</BoldTypography>
                            <Divider sx={{bgcolor: (theme) => theme.palette.mode === 'dark' ? "#fff" : "#000", height: 'auto'}}/>
                            <Box sx={{mr: '1rem'}}>
                                <BoldTypography variant='h6'
                                                sx={{color: (theme) => theme.palette.mode === 'dark' ? "#fff" : "#000"}}>
                                    {TitlePrime}
                                </BoldTypography>
                                <BoldTypography variant='h6'
                                                sx={{color: (theme) => theme.palette.mode === 'dark' ? "#fff" : "#000"}}>
                                    {TitleSecond}
                                </BoldTypography>
                            </Box>
                            <Typography sx={{mr: '1rem'}}>{Content}</Typography>
                        </Box>
                    </CardContent>
                </Paper>
            </CardActionArea>
        </Card>

    )
}

function Graduated() {
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: "2rem", m: '2rem'}}>
            <Typography variant='h5'>毕业生、大四、研三请阅读：</Typography>
            <Typography component="blockquote" variant="h6">我可以为这个网站做些什么？</Typography>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: '1rem', p: "1rem"}}>
                <GuidanceGrid
                    Index={1}
                    TitlePrime='填写申请时的'
                    TitleSecond='个人背景（可匿名）'
                    Content='考虑到有的人也许会有多于一年的申请经历，因此每个用户可添加多个申请人，以申请年份作区分'
                    ButtonLink='/profile/new-applicant'
                />
                <GuidanceGrid
                    Index={2}
                    TitlePrime='填写申请项目'
                    TitleSecond='admit/reject的情况'
                    Content='尽可能多地填写自己的申请记录，也就是你申请的各个项目的admit/reject的结果'
                    ButtonLink='/profile/new-record'
                />
                <GuidanceGrid
                    Index={3}
                    TitlePrime='分享你所了解的'
                    TitleSecond='海外硕博项目细节'
                    Content='如果你对某些项目有着很深入的了解，我们希望你能够把你所了解的内容进行分享，为学弟学妹们提供更多insight'
                    ButtonLink='/programs/new'
                />
                <GuidanceGrid
                    Index={4}
                    TitlePrime='在本站'
                    TitleSecond='分享你的申请经验'
                    Content='在本站发布申请分享帖，分享你申请过程中的心得体会，包括但不限于选校、套磁、申请总结等方面'
                    ButtonLink='/posts/new'
                />
            </Box>
        </Box>
    )
}
