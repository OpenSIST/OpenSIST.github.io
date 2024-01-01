import {useNavigate} from "react-router-dom";
import {useState} from "react";
import './Reset.css'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {SEND_RESET_VERIFY_TOKEN, RESET_PASSWORD} from "../../../APIs/APIs";
import {isValidPassword} from "../Register/Register";

const checkMark = <FontAwesomeIcon icon={solid("check")} style={{color: "#439d2a",}} />
const crossMark = <FontAwesomeIcon icon={solid("xmark")} style={{color: "#c24b24",}} />

export default function Reset() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [token, setToken] = useState("");
    const [tokenSent, setTokenSent] = useState(false);
    const [valid, setValid] = useState(true);

    // check the state for password requirements
    const [isLengthValid, setIsLengthValid] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);

    const navigate = useNavigate();

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
        try {
            const response = await fetch(SEND_RESET_VERIFY_TOKEN, {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });

            if (response.status === 200) {
                setTokenSent(true);
                alert("Verification code sent to your email!")
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (token.length < 6) {
            setValid(false);
            return;
        }
        if (!isValidPassword(password) || password !== passwordConfirm) {
            setValid(false);
            return;
        }

        try {
            const response = await fetch(RESET_PASSWORD, {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, token, password}),
            });

            if (response.status === 200) {
                navigate("/");
                alert("Password Reset successful!");
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    }

    return (
        <div className="reset">
            <h1>Reset Password</h1>
            <form onSubmit={handleReset} style={{display: 'flex', flexDirection: 'column'}}>
                <input
                    type="Username"
                    placeholder="Your ShanghaiTech Email"
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
                <input
                    type="token"
                    placeholder="Verification Code"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                />
                {tokenSent ? <p>如果您的邮箱收不到验证码，请查看postmaster</p> : <button className='Button' type="button" onClick={handleVerify}>Send Verification Code</button>}
                <div>
                <span>{isLengthValid ? checkMark : crossMark} 密码长度为8-24个字符</span><br/>
                    <span>{hasNumber ? checkMark : crossMark} 密码至少包含一个数字</span><br/>
                    <span>{hasLowercase ? checkMark : crossMark} 密码至少包含一个小写字母</span><br/>
                    <span>{hasUppercase ? checkMark : crossMark} 密码至少包含一个大写字母</span>
                </div>
                {valid ? null : <p style={{color: 'red'}}>请按照规范重新设置密码。</p>}
                <button className='Button' title='Reset password' type="submit">
                    Reset Password
                </button>
            </form>
        </div>
    );
}