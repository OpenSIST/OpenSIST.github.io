import SideBar from "../SideBar/SideBar";
import {Outlet, useLoaderData} from "react-router-dom";
import {getPrograms} from "../../Data/ProgramData";
import './ProgramPage.css';
import {Grid, Icon, Paper, Stack, Typography, useTheme} from "@mui/material";
import {grey} from "@mui/material/colors";
import {Add, Edit, Refresh} from "@mui/icons-material";

export async function loader({request}) {
    const url = new URL(request.url);
    const u = url.searchParams.get('u');
    const d = url.searchParams.get('d');
    const m = url.searchParams.get('m');
    const r = url.searchParams.get('r');
    const programs = await getPrograms(false, {u: u, d: d, m: m, r: r});
    return {programs, u, d, m, r};
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
    return (
        <>
            <h1>项目信息表使用指南</h1>
            <ul>
                <li>左方侧边栏中提供搜索框和筛选栏，可快速筛选目标学校或项目。</li>
                <li>点击侧边栏中<Add/>按钮可添加新项目。</li>
                <li>
                    由于网站前后端数据同步的时间差，项目列表可能不是最新，可以点击
                    <Refresh/>
                    按钮可从服务器内拉取最新项目列表。
                </li>
                <li>每个项目卡片中CS/EE等专业名的含义是“哪些专业的学生可申请该项目”。</li>
                <li>
                    点开每个项目后，点击右上角处的<Edit/>按钮可修改该项目的信息；点击<Refresh/>按钮可刷新该页面。
                </li>
                <li>若对项目列表有任何问题，可以点击侧边栏底部的链接前往GitHub提issue。</li>
            </ul>
        </>
    )
}