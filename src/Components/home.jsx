import TopBar from "./TopBar/TopBar";
import {useLoaderData, useNavigate} from "react-router-dom";
import {useEffect, useRef} from "react";
import {Outlet} from "react-router-dom";
import {checkLogin} from "../Data/UserData";
import React from "react";

// export async function loader() {
//     return {isLoggedIn: await checkLogin()};
// }

function Home() {
    // const navigate = useNavigate();
    // const isLoggedIn = useRef(false)
    // checkLogin().then((res) => isLoggedIn.current = res);
    // console.log(isLoggedIn.current)
    // if (!isLoggedIn) {
    //     navigate("/login");
    // }
    // const {isLoggedIn} = useLoaderData();
    // useEffect(() => {
    //     if (!isLoggedIn) {
    //         navigate("/login");
    //     }
    // }, [navigate, isLoggedIn]);

    return (
        <>
            <TopBar/>
            <Outlet/>
        </>
    );
}

export default Home;