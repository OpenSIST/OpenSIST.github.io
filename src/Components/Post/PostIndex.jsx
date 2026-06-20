import React from "react";
import {Box, Chip, Paper, Typography} from "@mui/material";
import {HistoryEduOutlined, SchoolOutlined} from "@mui/icons-material";

const tips = [
    {
        icon: <SchoolOutlined/>,
        title: "如果你是在读生",
        desc: "看学长学姐分享的申请策略、选校梯度、套磁流程，以及就业、转博等个人见解。",
    },
    {
        icon: <HistoryEduOutlined/>,
        title: "如果你是毕业生",
        desc: "欢迎用左上角的「撰写新文章」分享你自己的经验与心得。",
    },
];

const topics = [
    "申请策略", "选校梯度", "套磁与联系导师", "文书准备",
    "面试经验", "海外就业", "转博 / 直博", "项目就读体验", "中长期发展",
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

export default function PostIndex() {
    return (
        <Box sx={{flex: 1, minHeight: 0, overflowY: "auto", width: "100%", py: {xs: 1, sm: 2}}}>
            <Typography variant="h5" sx={{fontWeight: 700}}>经验分享帖</Typography>
            <Typography sx={{color: "text.secondary", mt: 1, mb: 4, maxWidth: 720}}>
                学长学姐的申请与发展经验长文，从左侧列表选择一篇开始阅读。
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
                <SectionLabel>常见主题</SectionLabel>
                <Paper elevation={0}
                       sx={{bgcolor: (theme) => theme.palette.surfaceVariant, borderRadius: 3, p: 2.5, display: "flex", flexWrap: "wrap", gap: 1}}>
                    {topics.map((topic) => (
                        <Chip key={topic} label={topic}
                              sx={{bgcolor: (theme) => theme.palette.surface, color: "text.primary", fontWeight: 500}}/>
                    ))}
                </Paper>
            </Box>

            <Typography variant="body2" sx={{color: "text.secondary", mt: 3, lineHeight: 1.8}}>
                发帖请勿提问、发布广告或虚假信息；有问题请前往 GitHub 或 QQ 群。
            </Typography>
        </Box>
    );
}
