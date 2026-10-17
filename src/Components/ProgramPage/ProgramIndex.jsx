import React from "react";
import {Box, Chip, Link as MuiLink, Paper, Typography} from "@mui/material";
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
                从左侧搜索、筛选学校和项目，查看介绍与历年申请记录；可在项目页编辑或收藏，也可点击「+」添加项目。
            </Typography>

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
