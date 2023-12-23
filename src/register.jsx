import {useState} from "react";
import {useNavigate} from "react-router-dom";


function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [match, setMatch] = useState(true); // [1
    const navigate = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            setMatch(false);
            return;
        }
        // console.log(email, password, passwordConfirm)

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
                {match ? null : <p style={{color: 'red'}}>Passwords do not match</p>}
                <button type="submit">Register</button>
                <a onClick={() => {
                    navigate('/login')
                }}
                   style={{textDecoration: "underline"}}>
                    Already have an account? Login now!</a>
            </form>
        </div>
    );
}

export default Register;