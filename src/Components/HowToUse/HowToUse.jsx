import {
    Box, Button, Divider, Typography
} from "@mui/material";
import React from "react";
import {Link} from "react-router-dom";
import Grid2 from "@mui/material/Unstable_Grid2";
import {BoldTypography} from "../common";


export function HowToUse() {
    return (
        <Box sx={{p: '1rem'}}>
            <BoldTypography variant="h4" sx={{textAlign: 'center'}}>OpenSIST使用指南</BoldTypography>
            <Graduated/>
            <Divider variant='large'/>
            <Current/>
        </Box>
    )
}

export function GuidanceGrid({Index, TitlePrime, TitleSecond, Content, ButtonLink, ButtonContent}) {
    return (
        <Grid2 xs={12} sm={6} md={6} xl={3}
               sx={{
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '3rem',
                   justifyContent: 'space-between'
               }}
        >
            <Box sx={{display: 'flex', flexDirection: "column", gap: "1.5rem"}}>
                <BoldTypography variant="h5">{Index}.</BoldTypography>
                <Box>
                    <BoldTypography variant='h6'
                                    sx={{color: (theme) => theme.palette.mode === 'dark' ? "#fff" : "#000"}}>
                        {TitlePrime}
                    </BoldTypography>
                    <BoldTypography variant='h6'
                                    sx={{color: (theme) => theme.palette.mode === 'dark' ? "#fff" : "#000"}}>
                        {TitleSecond}
                    </BoldTypography>
                </Box>
                <Typography>{Content}</Typography>
            </Box>
            <Button component={Link} to={ButtonLink} variant='contained'>
                {`${ButtonContent}`}
            </Button>
        </Grid2>

    )

}

function Graduated() {
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: "2rem", m: '2rem'}}>
            <BoldTypography variant='h4'>毕业生、大四、研三请阅读：</BoldTypography>
            <BoldTypography variant="h5">我来这个网站应该干什么？</BoldTypography>
            <BoldTypography variant="subtitl1">
                为了给SIST学弟学妹们提供更多海外申请的信息，我们希望你能抽出一点宝贵的时间，按个人意愿来做至多四件事情：
            </BoldTypography>
            <Divider variant='middle'/>
            <Grid2 container columnSpacing={7} rowSpacing={3}>
                <GuidanceGrid
                    Index={1}
                    TitlePrime='填写申请时的'
                    TitleSecond='个人背景（可匿名）'
                    Content='考虑到有的人也许会有多于一年的申请经历，因此每个用户可添加多个申请人，以申请年份作区分'
                    ButtonLink='/profile/new-applicant'
                    ButtonContent='添加申请人'
                />
                <GuidanceGrid
                    Index={2}
                    TitlePrime='填写申请项目'
                    TitleSecond='admit/reject的情况'
                    Content='尽可能多地填写自己的申请记录，也就是你申请的各个项目的admit/reject的结果'
                    ButtonLink='/profile/new-record'
                    ButtonContent='添加申请记录'
                />
                <GuidanceGrid
                    Index={3}
                    TitlePrime='分享你所了解的'
                    TitleSecond='海外硕博项目细节'
                    Content='如果你对某些项目有着很深入的了解，我们希望你能够把你所了解的内容进行分享，为学弟学妹们提供更多insight'
                    ButtonLink='/programs/new'
                    ButtonContent='添加项目信息'
                />
                <GuidanceGrid
                    Index={4}
                    TitlePrime='在本站'
                    TitleSecond='分享你的申请经验'
                    Content='在本站发布申请分享帖，分享你申请过程中的心得体会，包括但不限于选校、套磁、申请总结等方面'
                    ButtonLink='/posts/new'
                    ButtonContent='添加申请分享帖'
                />
            </Grid2>
        </Box>
    )
}

function Current() {
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: "2rem", m: '2rem'}}>
            <BoldTypography variant='h4'>非毕业年级本硕同学请阅读：</BoldTypography>
            <BoldTypography variant="h5">这个网站能怎么帮助我申请？</BoldTypography>
            <BoldTypography variant="subtitl1">
                OpenSIST是一个面向信息学院的出国申请信息共享平台，收集了往届海外硕博项目的申请案例、各个项目的介绍、学长学姐的申请经验帖等等。希望这些信息能为你的申请规划起到参考作用。
            </BoldTypography>
            <Divider variant='middle'/>
            <Grid2 container columnSpacing={7} rowSpacing={3}>
                <GuidanceGrid
                    Index={1}
                    TitlePrime='申请季的'
                    TitleSecond='申请记录一览表'
                    Content='该表记录了信息学院往届本科生、硕士生申请各个海外项目被admit/reject的情况'
                    ButtonLink='/datapoints'
                    ButtonContent='前往数据汇总表'
                />
                <GuidanceGrid
                    Index={2}
                    TitlePrime='申请人的'
                    TitleSecond='个人背景信息'
                    Content='在数据汇总表里可点击查看每位申请人在申请时的背景，包括但不限于三维、科研实习、推荐信等等'
                    ButtonLink='/datapoints'
                    ButtonContent='前往数据汇总表'
                />
                <GuidanceGrid
                    Index={3}
                    TitlePrime='海外硕博'
                    TitleSecond='项目信息表'
                    Content='该页面包含了许多海外硕博项目的项目信息，包括但不限于项目介绍、录取偏好、其他注意事项等'
                    ButtonLink='/programs'
                    ButtonContent='前往项目信息表'
                />
                <GuidanceGrid
                    Index={4}
                    TitlePrime='学长学姐的'
                    TitleSecond='申请经验心得'
                    Content='该页面包含了许多学长学姐们在申请季的心得帖子，能以大段的文字为你提供丰富的insight'
                    ButtonLink='/posts'
                    ButtonContent='前往申请分享帖'
                />
            </Grid2>
        </Box>
    )
}