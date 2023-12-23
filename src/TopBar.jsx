import './App.css';
import { useNavigate } from 'react-router-dom';

function TopBar() {
    const navigate = useNavigate();
    const handleLogin = () => {
       navigate('/login');
    };
    return (
        <div className="TopBar">
            <h1> Welcome to OpenSIST </h1>
            <button onClick={handleLogin}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
        </div>
    );
}

export default TopBar

