import {Paper, useTheme} from "@mui/material";
import React from "react";
import {getApplicants} from "../../Data/ApplicantData";
import {Outlet, redirect, useLoaderData} from "react-router-dom";
import {ProfileHeader} from "./UserInfo/ProfileHeader";
import {grey} from "@mui/material/colors";
import {getAvatar, getDisplayName, getMetaData, toggleAnonymous, uploadAvatar} from "../../Data/UserData";
import localforage from "localforage";

export async function loader() {
    const displayName = await getDisplayName();
    const metaData = await getMetaData();
    const avatarUrl = await getAvatar(metaData?.Avatar)
    const user = await localforage.getItem('user');
    return {displayName, metaData, avatarUrl, user};
}

export async function action({request}) {
    const formData = await request.formData();
    const actionType = formData.get('button');
    if (actionType === 'EditAvatar') {
        const avatar = formData.get('avatar');
        await uploadAvatar(avatar);
        return redirect(window.location.href);
    } else if (actionType === 'ToggleAnonymous') {
        await toggleAnonymous()
            // .then((r => setTimeout(r, 1000)));
        return redirect('/profile');
    }
    // return getApplicants(true);
}

export default function Profile() {
    const loaderData = useLoaderData();
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <>
            <ProfileHeader loaderData={loaderData}/>
            <Paper
                className='ProfileContent'
                sx={{
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