import React from 'react';
import {useNavigate} from "react-router-dom";
import './TopBar.css';


function TopBar() {
    const navigate = useNavigate();
    const user = localStorage.getItem('user');
    const handleLogout = async () => {
        try {
            const response = await fetch('https://opensist-auth.caoster.workers.dev/api/my/logout', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            })
            if (response.status !== 200) {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            } else {
                alert('Logout Successfully!');
            }
        } catch (e) {
            alert(e);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }
    return (
        <div className="TopBar">
            <div className="TopBarHeader">
                <h1> Welcome to OpenSIST </h1>
            </div>
            {user ?
                <div className='StatusBlock'>
                    <h2>Hi {user}</h2>
                    <button onClick={handleLogout}>Logout</button>
                </div> :
                <div className='StatusBlock'>
                    <button name="Login" onClick={() => navigate('/login')}>Login</button>
                    <button name="Register" onClick={() => navigate("/register")}>Register</button>
                </div>}
        </div>
    );
}

export default TopBar;