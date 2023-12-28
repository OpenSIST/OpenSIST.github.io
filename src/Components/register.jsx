import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {z} from 'zod';

const passwordSchema = z.string().min(8).max(24).refine(password => (
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)
),
    // message: "Password must contain at least one number, one lowercase and one uppercase letter",
);

function isValidPassword(password) {
    const result = passwordSchema.safeParse(password);
    return result.success;
}
function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    // const [match, setMatch] = useState(true);
    const [valid, setValid] = useState(true);

    // check if the agreements are already checked
    const [boxChecked, setChecked] = useState(false);

    const navigate = useNavigate();

    const handleAgreementCheck = async (e) => {
        setChecked(e.target.checked);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!boxChecked) {
            alert("Please check the agreements!");
            return;
        }
        if (!isValidPassword(password) || password !== passwordConfirm) {
            setValid(false)
            // alert("Password must contain at least one number, one lowercase and one uppercase letter");
            return;
        }

        try {
            const response = await fetch("https://opensist-auth.caoster.workers.dev/api/auth/register", {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password, passwordConfirm}),
            });

            if (response.status === 200) {
                navigate("/verify", {state: {email: email}});
                alert("Verification code sent to your email!")
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    };

    return (
        <div className="register">
            <h1>Register</h1>
            <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column'}}>
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
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordConfirm}
                    onChange={(e) => {
                        setPasswordConfirm((P) => e.target.value);
                        // setMatch(e.target.value === password && e.target.value !== "");
                    }
                    }
                    required
                />
                <br/>

                <div>
                    <input
                        type="checkbox"
                        id="privacyPolicy"
                        name="privacyPolicy"
                        checked={boxChecked}
                        onChange={handleAgreementCheck}
                        required
                    />
                    <label>我已阅读并同意OpenSIST
                        <a onClick={() => {
                            navigate('/agreement')
                        }}
                           style={{textDecoration: "underline", cursor: "pointer"}}>隐私条款</a>
                        ，且愿意遵守OpenSIST
                        <a onClick={() => {
                            navigate('/agreement')
                        }}
                           style={{textDecoration: "underline", cursor: "pointer"}}>用户守则</a>。
                    </label>
                </div>
                <br/>

                {valid ? null : <p style={{color: 'red'}}> "Password must contain at least one number, one lowercase and one uppercase letter" </p>}
                <button type="submit">Register</button>
                <a onClick={() => {
                    navigate('/login')
                }}
                   style={{textDecoration: "underline", cursor: "pointer"}}>
                    Already have an account? Login now!</a>
            </form>
        </div>
    );
}

export default Register;