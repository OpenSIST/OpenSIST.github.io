import React from "react";
import {Box, Paper, Typography} from "@mui/material";
import {PersonAddAlt, VisibilityOffOutlined, ContactPageOutlined, PublicOutlined} from "@mui/icons-material";

const tips = [
    {
        icon: <PersonAddAlt/>,
        title: "添加申请人",
        desc: "用上方的「添加申请人」记录每一季的申请信息；同一用户可有多个申请人，用 @年份 区分。",
    },
    {
        icon: <VisibilityOffOutlined/>,
        title: "实名 / 匿名",
        desc: "用头部的开关一键切换。匿名后，其他用户只能看到系统生成的伪名。",
    },
    {
        icon: <ContactPageOutlined/>,
        title: "头像与联系方式",
        desc: "可上传头像（≤ 4MB），并填写主页 / 邮箱 / QQ / 微信等，方便学弟学妹联系你。",
    },
    {
        icon: <PublicOutlined/>,
        title: "数据共享",
        desc: "你的申请人页会出现在「申请季数据汇总」中，对所有用户可见，但仅你本人可编辑。",
    },
];

export default function ProfileIndex() {
    return (
        <Box sx={{py: {xs: 2, sm: 4}}}>
            <Typography variant="h6" sx={{fontWeight: 600}}>管理你的申请档案</Typography>
            <Typography sx={{color: "text.secondary", mt: 0.5, mb: 3}}>
                选择上方的申请人查看 / 编辑其申请信息，或添加一位新的申请人。
            </Typography>
            <Box sx={{display: "grid", gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"}, gap: 2}}>
                {tips.map((tip) => (
                    <Paper
                        key={tip.title}
                        elevation={0}
                        sx={{
                            bgcolor: (theme) => theme.palette.surface,
                            borderRadius: 3,
                            p: 2.5,
                            display: "flex",
                            gap: 2,
                            alignItems: "flex-start",
                        }}
                    >
                        <Box
                            sx={{
                                flexShrink: 0,
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: (theme) => theme.palette.surfaceVariant,
                                color: "primary.main",
                            }}
                        >
                            {tip.icon}
                        </Box>
                        <Box>
                            <Typography sx={{fontWeight: 600, mb: 0.5}}>{tip.title}</Typography>
                            <Typography variant="body2" sx={{color: "text.secondary", lineHeight: 1.7}}>
                                {tip.desc}
                            </Typography>
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
}
