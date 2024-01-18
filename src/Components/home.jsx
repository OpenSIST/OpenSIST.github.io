import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";
import {LoadingBackdrop} from "./common";

function Home() {

    return (
        <div>
            <TopBar/>
            <Outlet/>
            <LoadingBackdrop/>
        </div>
    );
}

export default Home;