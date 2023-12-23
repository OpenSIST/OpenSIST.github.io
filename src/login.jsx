import {useState} from "react";
import {useNavigate} from 'react-router-dom';


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [valid, setValid] = useState(true);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
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

            if (response.status === 200) {
                navigate("/");
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
        // const response = await fetch("https://opensist-auth.caoster.workers.dev/api/auth/login", {
        //     method: "POST",
        //     // mode: "cors",
        //     credentials: "include",
        //     headers: {"Content-Type": "application/json"},
        //     body: JSON.stringify({email, password}),
        // });
        // if (response.status === 200) {
        //     navigate("/");
        // } else {
        //     const content = await response.json();
        //     alert(`${content.error}, Error code: ${response.status}`);
        // }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column'}}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {!valid && <p style={{color: 'red'}}>Password must be at least 8 characters</p>}
                <button type="submit">Login</button>
                <a onClick={() => {
                    navigate('/register')
                }}
                   style={{textDecoration: "underline"}}>
                    Don't have an account? Register now!</a>
            </form>
        </div>
    );
}

export default Login;