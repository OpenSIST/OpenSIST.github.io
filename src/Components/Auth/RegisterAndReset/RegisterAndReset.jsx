import {useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {z} from 'zod';
import "./RegisterAndReset.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {REGISTER, RESET_PASSWORD, SEND_RESET_VERIFY_TOKEN, SEND_VERIFY_TOKEN} from "../../../APIs/APIs";
const passwordSchema = z.string().min(8).max(24).refine(password => (
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)
),
    // message: "Password must contain at least one number, one lowercase and one uppercase letter",
);

const checkMark = <FontAwesomeIcon icon={solid("check")} style={{color: "#439d2a",}} />
const crossMark = <FontAwesomeIcon icon={solid("xmark")} style={{color: "#c24b24",}} />

export function isValidPassword(password) {
    const result = passwordSchema.safeParse(password);
    return result.success;
}
export default function RegisterAndReset() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [valid, setValid] = useState(true);
    const [token, setToken] = useState("");
    const [tokenSent, setTokenSent] = useState(false);

    // check the state for password requirements
    const [isLengthValid, setIsLengthValid] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);

    // check if the agreements are already checked
    const [boxChecked, setChecked] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const status = location.pathname.split('/')[1];

    const handleAgreementCheck = async (e) => {
        setChecked(e.target.checked);
    };

    const updatePasswordRequirements = (password) => {
        setIsLengthValid(password.length >= 8 && password.length <= 24);
        setHasNumber(/[0-9]/.test(password));
        setHasLowercase(/[a-z]/.test(password));
        setHasUppercase(/[A-Z]/.test(password));
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        updatePasswordRequirements(newPassword);
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        const api = status === 'reset' ? SEND_RESET_VERIFY_TOKEN : SEND_VERIFY_TOKEN;
        try {
            const response = await fetch(api, {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            if (response.status === 200) {
                setTokenSent(true);
                alert("Verification code sent to your email.")
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    };

    const handleSubmit= async (e) => {
        e.preventDefault();
        const api = status === 'reset' ? RESET_PASSWORD : REGISTER;
        if (!boxChecked && status === 'register') {
            alert("Please check the agreements.");
            return;
        }
        if (!isValidPassword(password) || password !== passwordConfirm) {
            setValid(false);
            return;
        }

        try {
            const response = await fetch(api, {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password, token}),
            });

            if (response.status === 200) {
                navigate("/");
                if (status === 'reset') {
                    alert("Password reset successful.");
                }
                else if (status === 'register') {
                    alert("Registration successful.");
                }
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    };

    const title = status === 'reset' ? 'Reset Password' : 'Register';

    return (
        <div className="RegisterAndReset">
            <h1>{title}</h1>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column'}}>
                <input
                    type="Username"
                    placeholder="Email"
                    value={email.split("@")[0]}
                    onChange={(e) => setEmail(
                        e.target.value.split("@")[0] + "@shanghaitech.edu.cn"
                    )}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordConfirm}
                    onChange={(e) => {
                        setPasswordConfirm((P) => e.target.value);
                    }
                    }
                    required
                />
                <div className='VerificationSendBlock'>
                    <input
                        type="token"
                        placeholder="Verification Code"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        required
                    />
                    <button className='Button' type="button" onClick={handleVerify}>Send code</button>
                </div>
                <div>
                    <span>{isLengthValid ? checkMark : crossMark} 密码长度为8-24个字符</span><br/>
                    <span>{hasNumber ? checkMark : crossMark} 密码至少包含一个数字</span><br/>
                    <span>{hasLowercase ? checkMark : crossMark} 密码至少包含一个小写字母</span><br/>
                    <span>{hasUppercase ? checkMark : crossMark} 密码至少包含一个大写字母</span>
                </div>
                {status === 'register' && <div>
                    <input
                        type="checkbox"
                        id="privacyPolicy"
                        name="privacyPolicy"
                        checked={boxChecked}
                        onChange={handleAgreementCheck}
                        required
                    />
                    <label>我已阅读并同意OpenSIST
                        <b onClick={() => {
                            navigate('/agreement')
                        }}
                           style={{textDecoration: "underline", cursor: "pointer"}}>隐私条款</b>
                        ，且愿意遵守OpenSIST
                        <b onClick={() => {
                            navigate('/agreement')
                        }}
                           style={{textDecoration: "underline", cursor: "pointer"}}>用户守则</b>。
                    </label>
                </div>}
                {valid ? null : <p style={{color: 'red'}}>请按照规范重新设置密码。</p>}
                <button className='Button' title={title} type="submit">{title}</button>
                {status === 'register' && <div onClick={() => {
                    navigate('/login')
                }}
                    style={{textDecoration: "underline", cursor: "pointer"}}>
                    Already have an account? Login now!</div>}
            </form>
        </div>
    );
}