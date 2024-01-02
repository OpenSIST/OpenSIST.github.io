import TopBar from "./TopBar/TopBar";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {Outlet} from "react-router-dom";
import localforage from "localforage";

export const checkLogin = async () => {
    try {
        const session = await localforage.getItem('session');
        if (!session) {
            return false;
        }
        const response = await fetch("https://opensist-auth.caoster.workers.dev/api/my/is_login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session}`
            }
        });
        return response.status === 200;
    } catch (e) {
        alert(e);
        return false;
    }
}

function Home() {
    const navigate = useNavigate();
    useEffect(() => {
        const verifyLogin = async () => {
            const isLoggedIn = await checkLogin();
            if (!isLoggedIn) {
                navigate("/login");
            }
        };
        verifyLogin().then();
    }, [navigate]);

    return (
        <>
            <TopBar/>
            <Outlet/>
        </>
    );
}

export default Home;