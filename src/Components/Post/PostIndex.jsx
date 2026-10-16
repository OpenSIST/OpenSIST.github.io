import React from "react";
import {Box, Paper, Typography} from "@mui/material";
import {BlockOutlined} from "@mui/icons-material";

const notes = [
    "评论用于交流讨论；如有通用问题也可前往 GitHub 或 QQ 群提问。",
    "请不要发布广告、推广等与申请无关的内容，或任何虚假信息。",
];

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
                从左侧选择文章阅读，或撰写自己的申请与就读经验；文章下方可评论、回复和点赞。
            </Typography>

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
