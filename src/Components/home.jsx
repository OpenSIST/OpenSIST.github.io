import TopBar from "./TopBar/TopBar";
import {redirect, useLoaderData, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {Outlet} from "react-router-dom";
import localforage from "localforage";
import {checkLogin} from "../Data/UserData";

export async function loader() {
    return {isLoggedIn: await checkLogin()};
}

function Home() {
    const navigate = useNavigate();
    const {isLoggedIn} = useLoaderData();
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login");
        }
    }, []);

    return (
        <>
            <TopBar/>
            <Outlet/>
        </>
    );
}

export default Home;