import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";

function Verify() {
    const location = useLocation();
    const [token, setToken] = useState("");
    const [valid, setValid] = useState(true);
    const navigate = useNavigate();
    async function handleVerify(e) {
        e.preventDefault();
        const email = location.state.email;
        if (token.length < 6) {
            setValid(false);
            return;
        }

        try {
            const response = await fetch("https://opensist-auth.caoster.workers.dev/api/auth/verify", {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, token}),
            });

            if (response.status === 200) {
                navigate("/");
                alert("Verification successful!");
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    }

    return (
        <div className="login">
            <h1>Verify</h1>
            <form onSubmit={handleVerify} style={{display: 'flex', flexDirection: 'column'}}>
                <input
                    type="token"
                    placeholder="verify token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                />
                {!valid && <p style={{color: 'red'}}>Verification code must be at least 6 characters</p>}
                <button type="submit">Verify</button>
            </form>
        </div>
    )
}

export default Verify;