import React, {useState} from "react";
import {Link} from 'react-router-dom';
import {login} from "../../../Data/UserData";
import {Box, Button, Link as MuiLink, Typography} from "@mui/material";
import {AuthCard, AuthHeader, EmailSuffixField, PasswordField} from "../AuthShared";

export async function action({request}) {
    const formData = await request.formData();
    const username = formData.get('username');
    const suffix = formData.get('suffix');
    const email = username + suffix;
    const password = formData.get('password');
    return login(email, password);
}

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [suffix, setSuffix] = useState("@shanghaitech.edu.cn");

    return (
        <AuthCard method='post'>
            <AuthHeader subtitle='上海科技大学留学申请信息分享平台'/>
            <Typography variant='h6' sx={{fontWeight: 700, textAlign: 'center'}}>用户登录</Typography>

            <EmailSuffixField
                value={username}
                onChange={(e) => setUsername(e.target.value.split('@')[0])}
                suffix={suffix}
                onSuffixChange={(e) => setSuffix(e.target.value)}
            />
            <PasswordField
                label='密码'
                id='password'
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <MuiLink component={Link} to="/register" variant='body2'>注册账号</MuiLink>
                <MuiLink component={Link} to="/reset" variant='body2'>忘记密码？</MuiLink>
            </Box>

            <Button fullWidth size='large' variant='contained' type='submit'>登录</Button>

            <Typography variant='caption' sx={{color: 'text.secondary', textAlign: 'center'}}>
                首次访问请先用上科大邮箱注册账号
            </Typography>
        </AuthCard>
    );
}

export default Login;
