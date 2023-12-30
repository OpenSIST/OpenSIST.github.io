import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";


function TopBar() {
    const user = localStorage.getItem('user');
    return (
        <div className="TopBar">
            <div className="TopBarHeader">
                <p> Welcome to OpenSIST </p>
            </div>
            <StatusBlock user={user}/>
        </div>
    );
}

export default TopBar;