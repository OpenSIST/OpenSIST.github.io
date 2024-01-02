import SideBar from "../SideBar/SideBar";
import {Outlet, useLoaderData} from "react-router-dom";
import {getPrograms} from "../../Data/ProgramData";
import './ProgramPage.css';

export async function loader() {
    const programs = await getPrograms();
    return { programs };
}

export default function ProgramPage() {
    const {programs} = useLoaderData()
    return (
        <div className='ContentBlock'>
            <SideBar twoLevelList={programs}/>
            <Outlet/>
        </div>
    )
}