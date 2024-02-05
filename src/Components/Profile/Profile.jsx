import {Paper, useTheme} from "@mui/material";
import React from "react";
import {getApplicants} from "../../Data/ApplicantData";
import {Outlet, useLoaderData} from "react-router-dom";
import {UserInfo} from "./UserInfo/UserInfo";
import {grey} from "@mui/material/colors";

export async function loader({params}) {
    const applicants = await getApplicants(false, {userId: params.userId});
    return {applicants}
}

export async function action() {
    return getApplicants(true);
}

export default function Profile() {
    const loaderData = useLoaderData();
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <>
            <h1>用户信息</h1>
            <UserInfo loaderData={loaderData} />
            <Paper sx={{
                bgcolor: darkMode ? grey[900] : grey[50],
            }}>
                <Outlet/>
            </Paper>
        </>
    )
}