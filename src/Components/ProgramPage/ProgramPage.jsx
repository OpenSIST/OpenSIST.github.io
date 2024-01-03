import SideBar from "../SideBar/SideBar";
import {Outlet, useLoaderData} from "react-router-dom";
import {getPrograms} from "../../Data/ProgramData";
import './ProgramPage.css';

export async function loader({ request }) {
    const url = new URL(request.url);
    const u = url.searchParams.get('u');
    const programs = await getPrograms(false, {u: u});
    return { programs, u };
}

export default function ProgramPage() {
    const programs = useLoaderData().programs;
    return (
        <div className='ContentBlock'>
            <SideBar twoLevelList={programs}/>
            <Outlet/>
        </div>
    )
}