import React, {useCallback, useEffect, useRef, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {z} from 'zod';
import {CheckCircleRounded, RadioButtonUncheckedRounded} from "@mui/icons-material";
import {SEND_RESET_VERIFY_TOKEN, SEND_VERIFY_TOKEN} from "../../../APIs/APIs";
import {apiRequest} from "../../../Data/Common";
import {Box, Button, Checkbox, FormControlLabel, Link as MuiLink, TextField, Typography} from "@mui/material";
import {registerReset} from "../../../Data/UserData";
import {AuthCard, AuthHeader, EmailSuffixField, PasswordField} from "../AuthShared";

export async function action({request}) {
    const formData = await request.formData();
    const username = formData.get('username');
    const suffix = formData.get('suffix');
    const email = username + suffix;
    const password = formData.get('password');
    const token = formData.get('token');
    const status = formData.get('status');
    return registerReset(email, password, token, status);
}

const passwordSchema = z.string().min(8).max(24).refine(password => (
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)
    ),
);

const VERIFY_COOLDOWN_SECONDS = 60;

function readVerifyCooldown() {
    const savedStartTime = Number.parseInt(localStorage.getItem('timerStart') || '0', 10);
    const timePassed = Math.floor((Date.now() - savedStartTime) / 1000);
    const timeLeft = VERIFY_COOLDOWN_SECONDS - timePassed;
    if (!savedStartTime || timeLeft <= 0) {
        localStorage.removeItem('timerStart');
        return {timeLeft: VERIFY_COOLDOWN_SECONDS, sendButtonDisabled: false};
    }
    return {timeLeft, sendButtonDisabled: true};
}

export function isValidPassword(password) {
    const result = passwordSchema.safeParse(password);
    return result.success;
}

function PasswordRule({ok, children}) {
    return (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
            {ok
                ? <CheckCircleRounded sx={{fontSize: 16, color: 'success.main'}}/>
                : <RadioButtonUncheckedRounded sx={{fontSize: 16, color: 'text.disabled'}}/>}
            <Typography variant='caption' sx={{color: ok ? 'text.secondary' : 'text.disabled'}}>{children}</Typography>
        </Box>
    );
}

export default function RegisterAndReset() {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [token, setToken] = useState("");
    const [tokenSent, setTokenSent] = useState(false);
    const [suffix, setSuffix] = useState("@shanghaitech.edu.cn");

    const isLengthValid = password.length >= 8 && password.length <= 24;
    const hasNumber = /[0-9]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const [boxChecked, setChecked] = useState(false);

    const location = useLocation();
    const status = location.pathname.split('/')[1];

    const [{timeLeft, sendButtonDisabled}, setCooldown] = useState(readVerifyCooldown);
    const intervalRef = useRef(null);
    const updateCooldown = useCallback(() => {
        const cooldown = readVerifyCooldown();
        setCooldown(cooldown);
        if (!cooldown.sendButtonDisabled) {
            clearInterval(intervalRef.current);
        }
    }, []);
    const sendAndStartTimer = useCallback((startTime = Date.now()) => {
        localStorage.setItem('timerStart', startTime.toString());
        setCooldown({timeLeft: VERIFY_COOLDOWN_SECONDS, sendButtonDisabled: true});
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(updateCooldown, 1000);
    }, [updateCooldown]);

    useEffect(() => {
        if (readVerifyCooldown().sendButtonDisabled) {
            intervalRef.current = setInterval(updateCooldown, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [updateCooldown]);

    const handleVerify = async (e) => {
        e.preventDefault();
        const api = status === 'reset' ? SEND_RESET_VERIFY_TOKEN : SEND_VERIFY_TOKEN;
        try {
            await apiRequest(api, {body: {email: user + suffix}});
            sendAndStartTimer();
            setTokenSent(true);
            alert("验证码已发送到您的上科大邮箱。若未收到，请查看postmaster垃圾邮件系统。");
        } catch (e) {
            alert(e.statusText ? `${e.statusText}, Error code: ${e.status}` : e);
        }
    };

    const isReset = status === 'reset';
    const chineseTitle = isReset ? '重置密码' : '用户注册';
    const passwordsMismatch = passwordConfirm !== "" && password !== passwordConfirm;
    const canSubmit = tokenSent && isValidPassword(password) && password === passwordConfirm
        && (isReset || boxChecked);
    const submitText = !tokenSent ? '请先发送验证码'
        : !isValidPassword(password) ? '密码不符合要求'
            : passwordsMismatch ? '两次密码不一致'
                : (isReset ? '重置密码' : '注册');

    return (
        <AuthCard method='post'>
            <AuthHeader subtitle='上海科技大学留学申请信息分享平台'/>
            <Typography variant='h6' sx={{fontWeight: 700, textAlign: 'center'}}>{chineseTitle}</Typography>

            <EmailSuffixField
                value={user}
                onChange={(e) => setUser(e.target.value.split('@')[0])}
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
            <PasswordField
                label='确认密码'
                id='confirmPassword'
                name='confirmPassword'
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                error={passwordsMismatch}
                helperText={passwordsMismatch ? '两次输入的密码不一致' : undefined}
                required
            />

            <Box sx={{display: 'flex', gap: 1, alignItems: 'flex-start'}}>
                <TextField
                    fullWidth
                    size='small'
                    variant='outlined'
                    label='验证码'
                    id='token'
                    name='token'
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                />
                <Button
                    type='button'
                    variant='outlined'
                    onClick={handleVerify}
                    disabled={sendButtonDisabled || user === ""}
                    sx={{flexShrink: 0, height: 40, whiteSpace: 'nowrap', px: 1.5}}
                >
                    {sendButtonDisabled ? `重发 ${timeLeft}s` : '发送验证码'}
                </Button>
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0.5,
                p: 1.25,
                borderRadius: 2,
                bgcolor: (theme) => theme.palette.surfaceVariant,
            }}>
                <PasswordRule ok={isLengthValid}>8–24 个字符</PasswordRule>
                <PasswordRule ok={hasNumber}>至少一个数字</PasswordRule>
                <PasswordRule ok={hasLowercase}>至少一个小写字母</PasswordRule>
                <PasswordRule ok={hasUppercase}>至少一个大写字母</PasswordRule>
            </Box>

            {!isReset &&
                <FormControlLabel
                    sx={{m: 0, alignItems: 'flex-start'}}
                    control={
                        <Checkbox
                            id="privacyPolicy"
                            name="privacyPolicy"
                            size='small'
                            checked={boxChecked}
                            onChange={(e) => setChecked(e.target.checked)}
                            sx={{pt: 0, mr: 0.5}}
                        />
                    }
                    label={
                        <Typography variant='body2' sx={{color: 'text.secondary'}}>
                            我已阅读并同意 <MuiLink component={Link} to='/agreement'>OpenSIST 隐私条款和用户守则</MuiLink>。
                        </Typography>
                    }
                />
            }

            <Button
                fullWidth
                size='large'
                variant='contained'
                type='submit'
                name='status'
                value={status}
                disabled={!canSubmit}
            >
                {submitText}
            </Button>

            {!isReset &&
                <Typography variant='body2' sx={{textAlign: 'center', color: 'text.secondary'}}>
                    已有账号？<MuiLink component={Link} to="/login">点此登录</MuiLink>
                </Typography>}
        </AuthCard>
    );
}
