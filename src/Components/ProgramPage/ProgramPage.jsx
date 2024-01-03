import SideBar from "../SideBar/SideBar";
import {Outlet, useLoaderData, useNavigation} from "react-router-dom";
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
    const navigation = useNavigation();
    return (
        <div className={'ContentBlock ' + (navigation.state === 'loading' ? 'loading' : '')}>
            <SideBar twoLevelList={programs}/>
            <Outlet/>
        </div>
    )
}