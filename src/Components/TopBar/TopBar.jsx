import React from 'react';
import {useNavigate} from "react-router-dom";
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";


function TopBar() {
    const user = localStorage.getItem('user');
    return (
        <div className="TopBar">
            <div className="TopBarHeader">
                <h1> Welcome to OpenSIST </h1>
            </div>
            <StatusBlock user={user}/>
        </div>
    );
}

export default TopBar;