import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import {useNavigate} from "react-router-dom";
import {usePending} from "../common";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


function TopBar() {
    const navigate = useNavigate();
    return (
        <>
            <div className={"TopBarBlock " + usePending()}>
                <div className="TopBar">
                    <div className="IconBlock" onClick={()=>navigate("/")}>
                        <FontAwesomeIcon icon={solid("bars")} size="2x"/>
                        <h2>OpenSIST</h2>
                    </div>
                    <NavBar/>
                    <StatusBlock/>
                </div>
            </div>
        </>
    );
}

export default TopBar;