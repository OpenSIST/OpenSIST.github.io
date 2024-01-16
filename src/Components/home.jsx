import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React from "react";
import {usePending} from "./common";

function Home() {

    return (
        <div className={usePending()}>
            <TopBar/>
            <Outlet/>
        </div>
    );
}

export default Home;