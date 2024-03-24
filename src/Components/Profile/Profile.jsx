import {Paper, useTheme} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Outlet, redirect, useLoaderData} from "react-router-dom";
import {ProfileSideBar} from "./ProfileSideBar/ProfileSideBar";
import {grey} from "@mui/material/colors";
import {
    getAvatar,
    getDisplayName,
    getMetaData,
    toggleAnonymous,
    updateContact,
    uploadAvatar
} from "../../Data/UserData";
import localforage from "localforage";
import MDPath from "../../Data/ProfileIndex.md";
import ReactMarkdown from "react-markdown";
import "./Profile.css"

export async function loader() {
    const displayName = await getDisplayName();
    const metaData = await getMetaData();
    const avatarUrl = await getAvatar(metaData?.Avatar);
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
        return redirect('/profile');
    } else if (actionType === 'EditContact') {
        const contact = formData.get('contact');
        await updateContact(contact);
        return redirect(window.location.href);
    } else if (actionType === 'Refresh') {
        const displayName = await getDisplayName(true);
        const metaData = await getMetaData(displayName, true);
        await getAvatar(metaData?.Avatar, displayName, true);
        return redirect(window.location.href);
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

export function ProfileIndex() {
    const [markDown, setMarkDown] = useState("");
    useEffect(() => {
        fetch(MDPath)
            .then((response) => response.text())
            .then((text) => setMarkDown(text));
    }, []);
    return (
        <ReactMarkdown className="ProfileIndex">
            {markDown}
        </ReactMarkdown>
    )
}