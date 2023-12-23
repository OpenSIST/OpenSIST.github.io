import TopBar from "./TopBar";
import SideBar from "./SideBar";
import {useNavigate} from "react-router-dom";
function Home() {
    const navigate = useNavigate();
    if (localStorage.getItem("token") === null) {
        navigate("/login");
    } else {
        return (
            <>
                <TopBar/>
                <SideBar/>
            </>
        );
    }
}

export default Home;