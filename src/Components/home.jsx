import TopBar from "./TopBar/TopBar";
import SideBar from "./SideBar/SideBar";
import NavBar from "./TopBar/NavBar/NavBar";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export const checkLogin = async () => {
    try {
        if (!localStorage.getItem("token")) {
            return false;
        }
        const response = await fetch("https://opensist-auth.caoster.workers.dev/api/my/is_login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
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
            {/*<NavBar/>*/}
            <SideBar/>
        </>
    );
}

export default Home;