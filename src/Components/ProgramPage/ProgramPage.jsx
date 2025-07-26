import SideBar from "./SideBar/SideBar";
import {Outlet, redirect, useLoaderData} from "react-router-dom";
import {getPrograms} from "../../Data/ProgramData";
import './ProgramPage.css';
import {Paper, useTheme} from "@mui/material";
import {grey} from "@mui/material/colors";
import ReactMarkdown from "react-markdown";
import MDPath from "../../Data/MarkDown/ProgramIndex.md";
import {useEffect, useState} from "react";
import "./ProgramPage.css";
import {loadMarkDown} from "../../Data/Common";
import {collectProgram, getMetaData, uncollectProgram} from "../../Data/UserData";

export async function loader({request}) {
    const url = new URL(request.url);
    const u = url.searchParams.get('u');
    const d = url.searchParams.get('d');
    const m = url.searchParams.get('m');
    const r = url.searchParams.get('r');
    const programs = await getPrograms(false, {u: u, d: d, m: m, r: r});
    const metaData = await getMetaData()
    return {programs, u, d, m, r, metaData};
}

export async function action({request}) {
    const formData = await request.formData();
    const ActionType = formData.get("ActionType");
    const ProgramId = formData.get("ProgramID");
    if (ActionType === "Star") {
        await collectProgram(ProgramId);
        return redirect(window.location.href);
    }
    if (ActionType === "UnStar") {
        await uncollectProgram(ProgramId);
        return redirect(window.location.href);
    }
    return await getPrograms(true);
}

export default function ProgramPage() {
    const loaderData = useLoaderData();
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <>
            <SideBar loaderData={loaderData}/>
            <Paper
                className="ProgramContent"
                sx={{
                    bgcolor: darkMode ? grey[900] : grey[50],
                }}>
                <Outlet/>
            </Paper>
        </>
    )
}

export async function ProgramIndexLoader() {
    const content = await loadMarkDown(MDPath);
    return {content};
}

export function ProgramIndex() {
    const [content, setContent] = useState("");
    useEffect(() => {
        fetch(MDPath)
            .then((response) => response.text())
            .then((text) => setContent(text));
    }, []);
    return (
        <ReactMarkdown className="ProgramIndex">
            {content}
        </ReactMarkdown>
    )
}