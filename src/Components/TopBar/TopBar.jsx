import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";


function TopBar() {
    const user = localStorage.getItem('user');
    return (
        <>
            <div className="TopBar">
                <div className='WelcomeBar'>
                    <div className="TopBarHeader">
                        <p> Welcome to OpenSIST </p>
                    </div>
                    <StatusBlock user={user}/>
                </div>
                <NavBar/>
            </div>
        </>
    );
}

export default TopBar;