import React, {useState} from "react";
import {Form, Link} from 'react-router-dom';
import "./Login.css"
import {login} from "../../../Data/UserData";
import {
    Button,
    TextField,
    Typography,
    Box,
    Input,
    MenuItem
} from "@mui/material";
import Select from "@mui/material/Select";


export async function action({request}) {
    const formData = await request.formData();
    const username = formData.get('username');
    const suffix = formData.get('suffix');
    const email = username + suffix;
    const password = formData.get('password');
    return await login(email, password);
}

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [suffix, setSuffix] = useState("@shanghaitech.edu.cn");

    return (
        <Form method='post' className="login">
            <Typography variant='h4' sx={{mb: "1rem"}}>用户登录</Typography>
            <Box sx={{
                display: 'flex'
            }}>
                <TextField
                    fullWidth
                    variant='standard'
                    label='邮箱'
                    id='username'
                    name='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value.split('@')[0])}
                    required
                />
                <Select
                    id='suffix'
                    name='suffix'
                    value={suffix}
                    input={<Input/>}
                    onChange={(e) => setSuffix(e.target.value)}
                >
                    <MenuItem value="@shanghaitech.edu.cn">@shanghaitech.edu.cn</MenuItem>
                    <MenuItem value="@alumni.shanghaitech.edu.cn">@alumni.shanghaitech.edu.cn</MenuItem>
                </Select>
            </Box>
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
                <Link to="/register">注册账号</Link>
                <Link to="/reset">忘记密码?</Link>
            </Box>
            <Button fullWidth variant='contained' type='submit'>Login</Button>
        </Form>
    );
}

export default Login;