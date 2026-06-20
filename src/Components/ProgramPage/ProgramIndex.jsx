import React from "react";
import {Box, Chip, Link as MuiLink, Paper, Typography} from "@mui/material";
import {AccountTreeOutlined, AddCircleOutline, TuneOutlined} from "@mui/icons-material";

const tips = [
    {
        icon: <AccountTreeOutlined/>,
        title: "浏览项目",
        desc: "点开左侧任意高校查看其硕博项目，点击项目即可查看详情。",
    },
    {
        icon: <TuneOutlined/>,
        title: "搜索与筛选",
        desc: "左侧提供搜索框与学历 / 专业 / 地区筛选，快速定位目标。",
    },
    {
        icon: <AddCircleOutline/>,
        title: "贡献与收藏",
        desc: "在项目页可编辑、收藏，或用「学校列表」右上角的「+」添加新项目。",
    },
];

const majors = [
    {tag: "CS", zh: "计算机科学"},
    {tag: "EE", zh: "电子工程"},
    {tag: "IE", zh: "信息工程（信院）"},
    {tag: "BME", zh: "生物医学工程"},
    {tag: "SCA", zh: "创意与艺术学院"},
    {tag: "BioSci", zh: "生命科学"},
    {tag: "BioTech", zh: "生物技术"},
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
                汇集学长学姐整理的海外硕博项目信息，从左侧选择学校开始浏览。
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
                       sx={{bgcolor: (theme) => theme.palette.surfaceVariant, borderRadius: 3, p: 2.5, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 1.25}}>
                    {majors.map((m) => (
                        <Box key={m.tag} sx={{display: "flex", alignItems: "center", gap: 1.25}}>
                            <Chip label={m.tag} size="small"
                                  sx={{fontWeight: 700, bgcolor: (theme) => theme.palette.surface, color: "primary.main", minWidth: 60}}/>
                            <Typography variant="body2" sx={{color: "text.secondary"}}>{m.zh}</Typography>
                        </Box>
                    ))}
                </Paper>
            </Box>

            <Typography variant="body2" sx={{color: "text.secondary", mt: 3, lineHeight: 1.8}}>
                高校顺序参考 USNews / CSRankings，与质量、难度无直接关系；数据源于学长学姐经验，仅供参考。
                没有找到你的学校？请到 GitHub{" "}
                <MuiLink href="https://github.com/orgs/OpenSIST/discussions/23" target="_blank" rel="noopener">Discussion</MuiLink>
                {" "}提出。
            </Typography>
        </Box>
    );
}
