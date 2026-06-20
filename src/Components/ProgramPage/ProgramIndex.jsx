import React from "react";
import {Box, Chip, Link as MuiLink, Paper, Typography} from "@mui/material";
import {
    AccountTreeOutlined,
    AddCircleOutline,
    BookmarkBorderOutlined,
    TableChartOutlined,
    TuneOutlined,
} from "@mui/icons-material";

const tips = [
    {
        icon: <AccountTreeOutlined/>,
        title: "浏览项目",
        desc: "点开左侧列表中的任意高校查看其下属的硕博项目，点击任意项目即可查看具体信息。",
    },
    {
        icon: <TuneOutlined/>,
        title: "搜索与筛选",
        desc: "左侧侧边栏提供搜索框与学历 / 专业 / 地区筛选，可快速定位目标学校或项目。",
    },
    {
        icon: <BookmarkBorderOutlined/>,
        title: "编辑与收藏",
        desc: "在项目页右上角可编辑信息或收藏该项目，收藏的项目会出现在头像菜单的 Favorite 中。",
    },
    {
        icon: <AddCircleOutline/>,
        title: "贡献项目",
        desc: "点击「学校列表」右上角的「+」添加新项目，与大家共同维护数据。",
    },
    {
        icon: <TableChartOutlined/>,
        title: "结合数据汇总",
        desc: "在「申请季数据汇总」中可查看各项目历年的录取案例与申请人背景，帮助你判断申请难度。",
    },
];

const majors = [
    {tag: "CS", full: "Computer Science", zh: "计算机科学"},
    {tag: "EE", full: "Electrical Engineering", zh: "电子工程"},
    {tag: "IE", full: "Information Engineering", zh: "信息工程（信院）"},
    {tag: "BME", full: "Biomedical Engineering", zh: "生物医学工程"},
    {tag: "SCA", full: "School of Creativity & Art", zh: "创意与艺术学院"},
    {tag: "BioSci", full: "Biological Science", zh: "生命科学"},
    {tag: "BioTech", full: "Biotechnology", zh: "生物技术"},
];

const notes = [
    "高校顺序主要参考 USNews 与 CSRankings，校内项目按字典序排列，顺序与项目质量、申请难度并不直接挂钩。",
    "数据来源于学长学姐的经验，带有一定主观因素，且可能存在滞后，仅供参考，请以官方网站为准并自主决策。",
];

function IconTile({children}) {
    return (
        <Box sx={{
            flexShrink: 0, width: 40, height: 40, borderRadius: 2,
            display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: (theme) => theme.palette.surface, color: "primary.main",
        }}>
            {children}
        </Box>
    );
}

function SectionLabel({children}) {
    return (
        <Typography variant="overline"
                    sx={{color: "text.secondary", fontWeight: 700, letterSpacing: "0.08em", display: "block", mb: 1.5}}>
            {children}
        </Typography>
    );
}

export default function ProgramIndex() {
    return (
        <Box sx={{flex: 1, minHeight: 0, overflowY: "auto", width: "100%", py: {xs: 1, sm: 2}}}>
            <Typography variant="h5" sx={{fontWeight: 700}}>项目信息表</Typography>
            <Typography sx={{color: "text.secondary", mt: 1, mb: 4, maxWidth: 720}}>
                汇集 ShanghaiTech 学长学姐整理的海外硕博项目信息，从左侧选择学校开始浏览，或借助筛选快速定位目标项目。
            </Typography>

            <SectionLabel>快速上手</SectionLabel>
            <Box sx={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2}}>
                {tips.map((tip) => (
                    <Paper key={tip.title} elevation={0}
                           sx={{bgcolor: (theme) => theme.palette.surfaceVariant, borderRadius: 3, p: 2.5, display: "flex", gap: 2, alignItems: "flex-start"}}>
                        <IconTile>{tip.icon}</IconTile>
                        <Box>
                            <Typography sx={{fontWeight: 600, mb: 0.5}}>{tip.title}</Typography>
                            <Typography variant="body2" sx={{color: "text.secondary", lineHeight: 1.7}}>{tip.desc}</Typography>
                        </Box>
                    </Paper>
                ))}
            </Box>

            <Box sx={{mt: 4}}>
                <SectionLabel>专业标签速查</SectionLabel>
                <Paper elevation={0}
                       sx={{bgcolor: (theme) => theme.palette.surfaceVariant, borderRadius: 3, p: 2.5, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 1.5}}>
                    {majors.map((m) => (
                        <Box key={m.tag} sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                            <Chip label={m.tag} size="small"
                                  sx={{fontWeight: 700, bgcolor: (theme) => theme.palette.surface, color: "primary.main", minWidth: 60}}/>
                            <Box sx={{minWidth: 0}}>
                                <Typography variant="body2" sx={{fontWeight: 600, lineHeight: 1.3}}>{m.zh}</Typography>
                                <Typography variant="caption" sx={{color: "text.secondary"}}>{m.full}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Paper>
            </Box>

            <Box sx={{mt: 4}}>
                <SectionLabel>使用须知</SectionLabel>
                <Paper elevation={0} sx={{bgcolor: (theme) => theme.palette.surfaceVariant, borderRadius: 3, p: 2.5}}>
                    <Box component="ul" sx={{m: 0, pl: 2.5, color: "text.secondary"}}>
                        {notes.map((note) => (
                            <Typography component="li" variant="body2" key={note} sx={{lineHeight: 1.9}}>{note}</Typography>
                        ))}
                    </Box>
                    <Typography variant="body2" sx={{color: "text.secondary", mt: 1.5, lineHeight: 1.8}}>
                        没有找到你的学校？请到 GitHub{" "}
                        <MuiLink href="https://github.com/orgs/OpenSIST/discussions/23" target="_blank" rel="noopener">Discussion</MuiLink>
                        {" "}中提出需要添加的学校名称，开发者会尽快处理。
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
}
