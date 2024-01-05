import SideBar from "../SideBar/SideBar";
import {Outlet, useLoaderData, useNavigation} from "react-router-dom";
import {getPrograms} from "../../Data/ProgramData";
import './ProgramPage.css';
import {usePending} from "../common";

export async function loader({ request }) {
    const url = new URL(request.url);
    const u = url.searchParams.get('u');
    const d = url.searchParams.get('d');
    const m = url.searchParams.get('m');
    const r = url.searchParams.get('r');
    const programs = await getPrograms(false, {u: u, d: d, m: m, r: r});
    return { programs, u, d, m, r };
}

export default function ProgramPage() {
    const programs = useLoaderData().programs;
    return (
        <div className={'ContentBlock ' + usePending()}>
            <SideBar twoLevelList={programs}/>
            <Outlet/>
        </div>
    )
}