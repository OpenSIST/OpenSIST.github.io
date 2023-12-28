import {useState} from "react";
import {useNavigate} from 'react-router-dom';
import "./Login.css"

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [valid, setValid] = useState(true);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (password.length < 8 || password.length > 24) {
            setValid(false);
            return;
        }

        try {
            const response = await fetch("https://opensist-auth.caoster.workers.dev/api/auth/login", {
                method: "POST",
                // mode: "cors",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            const content = await response.json();
            if (response.status === 200) {
                const token = content.token;
                const user_info = {
                    user: email.split("@")[0],
                    token: token
                }
                Object.entries(user_info).map(([key, value]) => {
                    localStorage.setItem(key, value);
                })
                navigate("/");
                alert("Login successful!")
            } else {
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column'}}>
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
                {!valid && <p style={{color: 'red'}}>Password should be within 8~24 characters</p>}
                <button type="submit">Login</button>
                <a onClick={() => {
                    navigate('/register')
                }}
                   style={{textDecoration: "underline", cursor: "pointer"}}>
                    Don't have an account? Register now!</a>
            </form>
        </div>
    );
}

export default Login;