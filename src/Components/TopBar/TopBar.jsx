import React, {useEffect} from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import localforage from "localforage";
import {useNavigation} from "react-router-dom";
import {usePending} from "../common";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


function TopBar() {
    // const [darkMode, setDarkMode] = React.useState(false);
    //
    // useEffect(() => {
    //     const fetchDarkModeFromStorage = async () => {
    //         const storedDarkMode = await localforage.getItem('darkMode');
    //         setDarkMode(storedDarkMode || false);
    //     }
    //     fetchDarkModeFromStorage().then();
    // }, []);
    //
    // useEffect(() => {
    //     if (darkMode !== null) {
    //         const root = document.documentElement;
    //         if (darkMode) {
    //             root.classList.add('dark');
    //         } else {
    //             root.classList.remove('dark');
    //         }
    //         const setDarkModeInStorage = async () => {
    //             await localforage.setItem('darkMode', darkMode);
    //         }
    //         setDarkModeInStorage().then();
    //     }
    // }, [darkMode]);

    return (
        <>
            <div className={"TopBarBlock " + usePending()}>
                <div className={"TopBar"}>
                    <div className='WelcomeBar'>
                        <h1 className="TopBarHeader"> OpenSIST </h1>
                        <StatusBlock/>
                        {/*<div style={{display: 'flex'}}>*/}
                        {/*    <button id="ThemeButton" onClick={() => setDarkMode(!darkMode)}>*/}
                        {/*        {darkMode ? <FontAwesomeIcon icon={solid("moon")}/> :*/}
                        {/*            <FontAwesomeIcon icon={solid("sun")}/>}*/}
                        {/*    </button>*/}
                        {/*</div>*/}
                    </div>
                    <NavBar/>
                </div>
            </div>
        </>
    );
}

export default TopBar;