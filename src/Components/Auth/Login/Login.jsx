import {useState} from "react";
import {Form, useNavigate} from 'react-router-dom';
import "./Login.css"
import {login} from "../../../Data/UserData";
import {Link, Button, TextField, Typography, Box} from "@mui/material";

export async function action({request}) {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    return await login(username, password);
}

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    return (
        <Form method='post' className="login">
            <Typography variant='h4' sx={{mb: "1rem"}}>用户登录</Typography>
            <TextField
                fullWidth
                variant='standard'
                label='用户名'
                placeholder="请输入上科大注册邮箱的前缀"
                type="username"
                id='username'
                name='username'
                value={username}
                onChange={(e) => setUsername(e.target.value.split('@')[0])}
                required
            />
            <TextField
                fullWidth
                variant='standard'
                label='密码'
                type="password"
                id='password'
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <Box sx={{display: 'flex', justifyContent: "space-between", width: "100%"}}>
                <Link href="/register" underline='hover'>注册账号</Link>
                <Link href="/reset" underline='hover'>忘记密码?</Link>
            </Box>
            <Button fullWidth variant='contained' type='submit'>Login</Button>
        </Form>
    );
}

export default Login;