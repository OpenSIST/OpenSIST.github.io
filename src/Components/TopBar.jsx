// import './App.css';
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
            <div className="TopBarHeader">
                <h1> Welcome to OpenSIST </h1>
            </div>
            {user ?
                <div className='StatusBlock'>
                    <h2>Hi {user}</h2>
                    <button onClick={() => {
                        navigate('/');
                    }}>Logout</button>
                </div> :
                <div className='StatusBlock'>
                    <button name="Login" onClick={handleLogin}>Login</button>
                    <button name="Register" onClick={() => navigate("/register")}>Register</button>
                </div>}
        </div>
    );
}

export default TopBar

