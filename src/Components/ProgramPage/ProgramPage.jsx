import SideBar from "./SideBar/SideBar";
import {Outlet, useLoaderData} from "react-router-dom";
import {getPrograms} from "../../Data/ProgramData";
import './ProgramPage.css';
import {Paper, useTheme} from "@mui/material";
import {grey} from "@mui/material/colors";
import ReactMarkdown from "react-markdown";
import MDPath from "../../Data/ProgramIndex.md";
import {useEffect, useState} from "react";
import "./ProgramPage.css";

export async function loader({request}) {
    const url = new URL(request.url);
    const u = url.searchParams.get('u');
    const d = url.searchParams.get('d');
    const m = url.searchParams.get('m');
    const r = url.searchParams.get('r');
    const programs = await getPrograms(false, {u: u, d: d, m: m, r: r});
    return {programs, u, d, m, r};
}

export async function action() {
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

export function ProgramIndex() {
    const [markDown, setMarkDown] = useState("");
    useEffect(() => {
        fetch(MDPath)
            .then((response) => response.text())
            .then((text) => setMarkDown(text));
    }, []);
    return (
        <ReactMarkdown className="ProgramIndex">
            {markDown}
        </ReactMarkdown>
    )
}