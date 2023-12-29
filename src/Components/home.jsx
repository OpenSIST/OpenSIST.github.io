import TopBar from "./TopBar/TopBar";
import SideBar from "./SideBar/SideBar";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

const checkLogin = async () => {
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
        if (response.status === 200) {
            console.log("Login success!")
            return true;
        } else if (response.status === 401) {
            console.log("Token expired!")
            return false;
        } else {
            console.log("Unknown error!")
            const content = await response.json();
            alert(`${content.error}, Error code: ${response.status}`);
            return false;
        }
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
            <SideBar/>
        </>
    );
}

export default Home;