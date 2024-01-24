import React, {useEffect, useState} from "react";
import {useLocation, Form, Link} from "react-router-dom";
import {z} from 'zod';
import "./RegisterAndReset.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {SEND_RESET_VERIFY_TOKEN, SEND_VERIFY_TOKEN} from "../../../APIs/APIs";
import {headerGenerator} from "../../../Data/Common";
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Input,
    InputAdornment,
    InputLabel,
    TextField,
    Typography
} from "@mui/material";
import {registerReset} from "../../../Data/UserData";

export async function action({request}) {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const token = formData.get('token');
    const status = formData.get('status');
    return await registerReset(username, password, token, status);
}

const passwordSchema = z.string().min(8).max(24).refine(password => (
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)
    ),
);

const checkMark = <FontAwesomeIcon icon={solid("check")} style={{color: "#439d2a",}}/>
const crossMark = <FontAwesomeIcon icon={solid("xmark")} style={{color: "#c24b24",}}/>

export function isValidPassword(password) {
    const result = passwordSchema.safeParse(password);
    return result.success;
}

export default function RegisterAndReset() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [token, setToken] = useState("");

    // check the state for password requirements
    const [isLengthValid, setIsLengthValid] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);

    // check if the agreements are already checked
    const [boxChecked, setChecked] = useState(false);

    const location = useLocation();

    const status = location.pathname.split('/')[1];

    const updatePasswordRequirements = (password) => {
        setIsLengthValid(password.length >= 8 && password.length <= 24);
        setHasNumber(/[0-9]/.test(password));
        setHasLowercase(/[a-z]/.test(password));
        setHasUppercase(/[A-Z]/.test(password));
    };

    const [timeLeft, setTimeLeft] = useState(60);
    const [sendButtonDisabled, setSendButtonDisabled] = useState(false);
    const sendAndStartTimer = (startTime = Date.now()) => {
        localStorage.setItem('timerStart', startTime.toString());
        setSendButtonDisabled(true);

        const intervalId = setInterval(() => {
            const startTime = parseInt(localStorage.getItem('timerStart') || '0');
            const timePassed = Math.floor((Date.now() - startTime) / 1000);
            const timeLeft = 60 - timePassed;

            if (timeLeft <= 0) {
                clearInterval(intervalId);
                setTimeLeft(60);
                setSendButtonDisabled(false);
                localStorage.removeItem('timerStart');
            } else {
                setTimeLeft(timeLeft);
            }
        }, 1000);
    };

    useEffect(() => {
        const savedStartTime = localStorage.getItem('timerStart');
        if (savedStartTime) {
            const timePassed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
            const remainingTime = 60 - timePassed;
            if (remainingTime > 0) {
                setTimeLeft(remainingTime);
                setSendButtonDisabled(true);
                sendAndStartTimer(parseInt(savedStartTime));
            } else {
                localStorage.removeItem('timerStart');
            }
        }
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        sendAndStartTimer();
        const api = status === 'reset' ? SEND_RESET_VERIFY_TOKEN : SEND_VERIFY_TOKEN;
        try {
            const response = await fetch(api, {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: await headerGenerator(),
                body: JSON.stringify({email}),
            });

            if (response.status === 200) {
                alert("验证码已发送到您的上科大邮箱。若未收到，请查看postmaster垃圾邮件系统。");
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    };

    const title = status === 'reset' ? 'Reset Password' : 'Register';
    const chineseTitle = status === 'reset' ? '重置密码' : '用户注册';

    return (
        <Form method='post' className="RegisterAndReset">
            <Typography variant='h4' sx={{mb: "1rem"}}>{chineseTitle}</Typography>
            <FormControl variant="standard" sx={{width: '100%'}}>
                <InputLabel required>上科大邮箱前缀</InputLabel>
                <Input
                    fullWidth
                    id='username'
                    name='username'
                    value={email.split("@")[0]}
                    endAdornment={<InputAdornment position="end">@shanghaitech.edu.cn</InputAdornment>}
                    onChange={(e) => setEmail(
                        e.target.value.split("@")[0] + "@shanghaitech.edu.cn"
                    )}
                    size='small'
                    required
                />
            </FormControl>
            <TextField
                fullWidth
                variant='standard'
                label='密码'
                type="password"
                id='password'
                name='password'
                value={password}
                onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(newPassword);
                    updatePasswordRequirements(newPassword);
                }}
                size='small'
                required
            />
            <TextField
                fullWidth
                error={password !== passwordConfirm}
                variant='standard'
                label='确认密码'
                type="password"
                id='confirmPassword'
                name='confirmPassword'
                value={passwordConfirm}
                onChange={(e) => {setPasswordConfirm((P) => e.target.value);}}
                size='small'
                required
            />
            <div className='VerificationSendBlock'>
                <TextField
                    fullWidth
                    id='token'
                    name='token'
                    label="验证码"
                    variant='standard'
                    value={token}
                    // helperText="验证邮件可能被postmaster拦截"
                    onChange={(e) => setToken(e.target.value)}
                    size='small'
                    required
                />
                <Button
                    variant='contained'
                    disabled={sendButtonDisabled || email?.split('@')[0] === ""}
                    onClick={handleVerify}
                >
                    { sendButtonDisabled ? `${timeLeft} 秒后重新发送` : '发送验证码' }
                </Button>
            </div>
            <div>
                <span>{isLengthValid ? checkMark : crossMark} 密码长度为8-24个字符</span><br/>
                <span>{hasNumber ? checkMark : crossMark} 密码至少包含一个数字</span><br/>
                <span>{hasLowercase ? checkMark : crossMark} 密码至少包含一个小写字母</span><br/>
                <span>{hasUppercase ? checkMark : crossMark} 密码至少包含一个大写字母</span>
            </div>
            {status === 'register' &&
                <FormControlLabel
                    sx={{width: '100%'}}
                    label={(
                        <label htmlFor='privacyPolicy'>我已阅读并同意且愿意遵守
                            <Link to={'/agreement'}>OpenSIST隐私条款和用户守则</Link>。
                        </label>
                    )}
                    control={
                        <Checkbox
                            id="privacyPolicy"
                            name="privacyPolicy"
                            checked={boxChecked}
                            onChange={(e) => {
                                setChecked(e.target.checked);
                            }}
                        />
                    }
                    required
                />
            }
            <Button
                fullWidth
                variant='contained'
                type='submit'
                name='status'
                value={status}
            >
                {title}
            </Button>
            {status === 'register' && <Link to="/login">已有账号？点此登录</Link>}
        </Form>
    );
}