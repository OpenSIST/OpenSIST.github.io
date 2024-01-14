import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";

function Home() {

    return (
        <>
            <TopBar/>
            <Outlet/>
        </>
    );
}

export default Home;