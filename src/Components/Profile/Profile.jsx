import {Paper, useTheme} from "@mui/material";
import React from "react";
import {getApplicantIDByDisplayName, getApplicants} from "../../Data/ApplicantData";
import {Outlet, useLoaderData} from "react-router-dom";
import {ProfileHeader} from "./UserInfo/ProfileHeader";
import {grey} from "@mui/material/colors";
import {uploadAvatar} from "../../Data/UserData";

export async function loader() {
    const applicants = await getApplicantIDByDisplayName();
    return {applicants};
}

export async function action({request}) {
    const formData = await request.formData();
    const actionType = formData.get('button');
    if (actionType === 'EditAvatar') {
        const avatar = formData.get('avatar');
        await uploadAvatar(avatar);
    }
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