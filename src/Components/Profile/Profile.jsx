import {Paper, useTheme} from "@mui/material";
import React from "react";
import {Outlet, redirect, useLoaderData} from "react-router-dom";
import {ProfileSideBar} from "./ProfileSideBar/ProfileSideBar";
import {grey} from "@mui/material/colors";
import {getAvatar, getDisplayName, getMetadata, toggleAnonymous, updateContact, uploadAvatar} from "../../Data/UserData";
import localforage from "localforage";
import "./Profile.css"

export async function loader() {
    const displayName = await getDisplayName();
    const metadata = await getMetadata();
    const avatarUrl = await getAvatar(metadata?.Avatar);
    const user = await localforage.getItem('user');
    return {displayName, metadata, avatarUrl, user};
}

export async function action({request}) {
    const formData = await request.formData();
    const actionType = formData.get('button');
    if (actionType === 'EditAvatar') {
        const avatar = formData.get('avatar');
        await uploadAvatar(avatar);
        return redirect(request.url);
    } else if (actionType === 'ToggleAnonymous') {
        await toggleAnonymous()
        return redirect('/profile');
    } else if (actionType === 'EditContact') {
        const contact = formData.get('contact');
        await updateContact(contact);
        return redirect(request.url);
    } else if (actionType === 'Refresh') {
        const displayName = await getDisplayName(true);
        const metadata = await getMetadata(displayName, true);
        await getAvatar(metadata?.Avatar, displayName, true);
        return redirect(request.url);
    }
}

export default function Profile() {
    const loaderData = useLoaderData();
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <>
            <ProfileSideBar loaderData={loaderData}/>
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
