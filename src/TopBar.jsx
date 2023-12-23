import './App.css';
import {useLocation, useNavigate} from "react-router-dom";

function TopBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user;
    console.log(localStorage.getItem("user"))
    const handleLogin = () => {
        navigate('/login');
    };
    return (
        <div className="TopBar">
            <h1> Welcome to OpenSIST </h1>
            {user ?
                <>
                    <h2>Hi {user}</h2>
                    <button onClick={() => {
                        navigate('/');
                    }}>Logout</button>
                </> :
                <>
                    <button onClick={handleLogin}>Login</button>
                    <button onClick={() => navigate("/register")}>Register</button>
                </>}
        </div>
    );
}

export default TopBar

