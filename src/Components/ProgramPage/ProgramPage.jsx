import SideBar from "./SideBar/SideBar";
import {Outlet, redirect, useLoaderData} from "react-router-dom";
import {getPrograms} from "../../Data/ProgramData";
import './ProgramPage.css';
import {Paper} from "@mui/material";
import {collectProgram, getMetadata, uncollectProgram} from "../../Data/UserData";

export async function loader({request}) {
    const url = new URL(request.url);
    const u = url.searchParams.get('u');
    const d = url.searchParams.get('d');
    const m = url.searchParams.get('m');
    const r = url.searchParams.get('r');
    const programs = await getPrograms(false, {u, d, m, r});
    const metadata = await getMetadata()
    return {programs, u, d, m, r, metadata};
}

export async function action({request}) {
    const formData = await request.formData();
    const actionType = formData.get("ActionType");
    const programId = formData.get("ProgramID");
    if (actionType === "Star") {
        await collectProgram(programId);
        return redirect(request.url);
    }
    if (actionType === "UnStar") {
        await uncollectProgram(programId);
        return redirect(request.url);
    }
    return getPrograms(true);
}

export default function ProgramPage() {
    const loaderData = useLoaderData();
    return (
        <>
            <SideBar loaderData={loaderData}/>
            <Paper
                className="ProgramContent"
                elevation={0}
                sx={{
                    bgcolor: (theme) => theme.palette.surface,
                }}>
                <Outlet/>
            </Paper>
        </>
    )
}
