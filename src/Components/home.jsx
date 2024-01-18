import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";
import {LoadingBackdrop} from "./common";

function Home() {

    return (
        <>
            <TopBar/>
            <Outlet/>
            <LoadingBackdrop/>
        </>
    );
}

export default Home;