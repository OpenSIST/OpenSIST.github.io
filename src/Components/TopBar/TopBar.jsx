import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import localforage from "localforage";


function TopBar() {
    return (
        <>
            <div className="TopBar">
                <div className='WelcomeBar'>
                    <div className="TopBarHeader">
                        <h1> Welcome to OpenSIST </h1>
                    </div>
                    <StatusBlock/>
                </div>
                <NavBar/>
            </div>
        </>
    );
}

export default TopBar;