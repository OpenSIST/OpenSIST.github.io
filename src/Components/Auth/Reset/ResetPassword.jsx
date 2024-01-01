import {useNavigate, useLocation} from "react-router-dom";
import {useState} from "react";
import {isValidPassword} from "../Register/Register";
import './Reset.css'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";

const checkMark = <FontAwesomeIcon icon={solid("check")} style={{color: "#439d2a",}} />
const crossMark = <FontAwesomeIcon icon={solid("xmark")} style={{color: "#c24b24",}} />

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    // const [match, setMatch] = useState(true);
    const [valid, setValid] = useState(true);

    // check the state for password requirements
    const [isLengthValid, setIsLengthValid] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

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

    const handleResetPassword = async (e) => {
        const email = location.state.email;
        const token = location.state.token;

        e.preventDefault();
        if (!isValidPassword(password) || password !== passwordConfirm) {
            setValid(false)
            // alert("Password must contain at least one number, one lowercase and one uppercase letter");
            return;
        }

        try {
            const response = await fetch("https://opensist-auth.caoster.workers.dev/api/auth/forget_verify_reset", {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, token, password}),
            });

            if (response.status === 200) {
                navigate("/");
                alert("Password Reset Successfully!")
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    };

    return (
        <div className="reset">
            <h1>Reset Password</h1>
            <form onSubmit={handleResetPassword} style={{display: 'flex', flexDirection: 'column'}}>
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
                <div>
                    <span>{isLengthValid ? checkMark : crossMark} 密码长度为8-24个字符</span><br/>
                    <span>{hasNumber ? checkMark : crossMark} 密码至少包含一个数字</span><br/>
                    <span>{hasLowercase ? checkMark : crossMark} 密码至少包含一个小写字母</span><br/>
                    <span>{hasUppercase ? checkMark : crossMark} 密码至少包含一个大写字母</span>
                </div>
                    {valid ? null : <p style={{color: 'red'}}>请按照规范重新设置密码。</p>}
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
}