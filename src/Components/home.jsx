import TopBar from "./TopBar/TopBar";
import {useLoaderData, useNavigate, useNavigation} from "react-router-dom";
import {useEffect} from "react";
import {Outlet} from "react-router-dom";
import {checkLogin} from "../Data/UserData";
import React from "react";

export async function loader() {
    return {isLoggedIn: await checkLogin()};
}

function Home() {
    const navigate = useNavigate();
    const navigation= useNavigation();
    const {isLoggedIn} = useLoaderData();
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, );

    return (
        <React.Fragment className={navigation.state === "loading" ? "loading" : ""}>
            <TopBar/>
            <Outlet/>
        </React.Fragment>
    );
}

export default Home;