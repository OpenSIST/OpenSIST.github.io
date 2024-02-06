import {Paper, useTheme} from "@mui/material";
import React from "react";
import {getApplicants} from "../../Data/ApplicantData";
import {Outlet, useLoaderData} from "react-router-dom";
import {ProfileHeader} from "./UserInfo/ProfileHeader";
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
            <ProfileHeader loaderData={loaderData} />
            <Paper sx={{
                bgcolor: darkMode ? grey[900] : grey[50],
                width: '100%'
            }}>
                <Outlet/>
            </Paper>
        </>
    )
}

export function ProfileIndex() {
    // const loaderData = useLoaderData();
    // console.log(loaderData);
    // const applicants = loaderData.applicants;
    // return (
    //     <>
    //         {
    //             applicants.map(applicant => {
    //                 <div>
    //                     {applicant.name}
    //                 </div>
    //             })
    //         }
    //     </>
    // )
    return (
        <div>
            Profile Index
        </div>
    )
}