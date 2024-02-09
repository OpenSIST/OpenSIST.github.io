import {Paper, useTheme} from "@mui/material";
import React from "react";
import {getApplicantIDByUser, getApplicants} from "../../Data/ApplicantData";
import {Outlet, useLoaderData} from "react-router-dom";
import {ProfileHeader} from "./UserInfo/ProfileHeader";
import {grey} from "@mui/material/colors";
import {useUser} from "../../Data/UserData";
import localforage from "localforage";

export async function loader({params}) {
    const user = await localforage.getItem('user');
    const applicants = await getApplicantIDByUser(user);
    return {applicants};
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
            <ProfileHeader loaderData={loaderData} />
            <Paper className='ProfileContent' sx={{
                bgcolor: darkMode ? grey[900] : grey[50],
            }}>
                <Outlet/>
            </Paper>
        </>
    )
}

export function ProfileIndex() {
    return (
        <div>
            Profile Index
        </div>
    )
}