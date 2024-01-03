import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import localforage from "localforage";
import {useNavigation} from "react-router-dom";


function TopBar() {
    const navigation= useNavigation();
    return (
        <>
            <div className={"TopBar " + (navigation.state === 'loading' ? 'loading' : '')}>
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