import {useNavigate, useRouteError} from "react-router-dom";
import {Box, Button, Paper, Typography, useTheme} from "@mui/material";
import {CloudOffOutlined, HomeOutlined, RefreshOutlined, SentimentDissatisfiedOutlined} from "@mui/icons-material";

const NetworkBrokeMessage = "网络异常，请检查网络连接或采取以下措施：\n" +
    "1. 如果您连接的是上科大校园网，可以不用开启VPN\n" +
    "2. 如果您在国内且未连接上科大校园网，请尝试开启VPN并保证网络稳定\n" +
    "3. 如果您在海外（包含港澳台地区），则无需使用代理服务";

function brandGradient(dark) {
    return dark ? 'linear-gradient(140deg, #93C0F2, #6BA6E8)' : 'linear-gradient(140deg, #1C5BAA, #4F86CE)';
}

export default function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    const dark = useTheme().palette.mode === 'dark';

    const isNetwork = error?.message === 'Failed to fetch';
    const status = typeof error?.status === 'number' ? error.status : null;
    const message = isNetwork
        ? NetworkBrokeMessage
        : (error?.statusText || error?.message || "发生了未知错误，请稍后再试。");
    const title = isNetwork ? '网络连接异常' : status === 404 ? '页面走丢了' : '出错了';
    const Icon = isNetwork ? CloudOffOutlined : SentimentDissatisfiedOutlined;

    return (
        <Box sx={{
            width: '100%',
            minHeight: '70vh',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 6,
        }}>
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 480,
                    bgcolor: (theme) => theme.palette.surface,
                    borderRadius: 3,
                    p: {xs: 3, sm: 4.5},
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                {status && status !== 404 ? (
                    <Typography sx={{
                        fontWeight: 800,
                        fontSize: {xs: '3.5rem', sm: '4.5rem'},
                        lineHeight: 1,
                        display: 'inline-block',
                        background: brandGradient(dark),
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {status}
                    </Typography>
                ) : (
                    <Box sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: brandGradient(dark),
                        color: '#fff',
                        boxShadow: dark ? '0 8px 22px rgba(107,166,232,0.35)' : '0 8px 22px rgba(28,91,170,0.28)',
                    }}>
                        <Icon sx={{fontSize: 38}}/>
                    </Box>
                )}

                <Typography variant='h5' sx={{fontWeight: 700}}>{title}</Typography>

                <Box sx={{color: 'text.secondary'}}>
                    {message.split("\n").map((line, index) => (
                        <Typography key={index} variant='body2' sx={{lineHeight: 1.8, textAlign: isNetwork ? 'left' : 'center'}}>
                            {line}
                        </Typography>
                    ))}
                </Box>

                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1}}>
                    <Button variant='contained' startIcon={<HomeOutlined/>} onClick={() => navigate('/')}>
                        返回首页
                    </Button>
                    <Button variant='outlined' startIcon={<RefreshOutlined/>} onClick={() => navigate(0)}>
                        刷新页面
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
