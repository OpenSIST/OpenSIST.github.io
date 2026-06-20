import React from "react";
import {Box, Chip, Paper, Typography} from "@mui/material";
import {
    BlockOutlined,
    ChatBubbleOutlineOutlined,
    EditNoteOutlined,
    HistoryEduOutlined,
    SchoolOutlined,
} from "@mui/icons-material";

const tips = [
    {
        icon: <SchoolOutlined/>,
        title: "如果你是在读生",
        desc: "在这里可以看到学长学姐分享的申请策略、选校梯度、套磁流程，以及关于海外就业、转博、中长期发展的个人见解。",
    },
    {
        icon: <HistoryEduOutlined/>,
        title: "如果你是毕业生",
        desc: "欢迎就上述任意方面分享你自己的经验与心得，用左上角的「撰写新文章」开始记录。",
    },
    {
        icon: <ChatBubbleOutlineOutlined/>,
        title: "评论与互动",
        desc: "在文章下方可以评论、回复他人、点赞，直接和作者或其他同学交流提问。",
    },
    {
        icon: <EditNoteOutlined/>,
        title: "如何撰写",
        desc: "内置 Markdown 编辑器支持标题、列表、表格、链接与图片，可随时编辑你已发布的文章。",
    },
];

const topics = [
    "申请策略", "选校梯度", "套磁与联系导师", "文书准备",
    "面试经验", "海外就业", "转博 / 直博", "项目就读体验", "中长期发展",
];

const notes = [
    "评论用于交流讨论；如有通用问题也可前往 GitHub 或 QQ 群提问。",
    "请不要发布广告、推广等与申请无关的内容，或任何虚假信息。",
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
                学长学姐的申请与发展经验长文，覆盖从选校、套磁、文书到海外就业与长期规划的方方面面。
                从左侧列表选择一篇开始阅读，也欢迎你贡献自己的故事。
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

            <Box sx={{mt: 4}}>
                <SectionLabel>注意事项</SectionLabel>
                <Paper elevation={0} sx={{bgcolor: (theme) => theme.palette.surfaceVariant, borderRadius: 3, p: 2.5}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1, color: "text.primary"}}>
                        <BlockOutlined fontSize="small" sx={{color: "primary.main"}}/>
                        <Typography sx={{fontWeight: 600}}>发帖与评论前请留意</Typography>
                    </Box>
                    <Box component="ul" sx={{m: 0, pl: 2.5, color: "text.secondary"}}>
                        {notes.map((note) => (
                            <Typography component="li" variant="body2" key={note} sx={{lineHeight: 1.9}}>{note}</Typography>
                        ))}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
