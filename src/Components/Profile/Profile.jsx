import {Paper, useTheme} from "@mui/material";
import React from "react";
import {getApplicants} from "../../Data/ApplicantData";
import {Outlet, redirect, useLoaderData} from "react-router-dom";
import {ProfileHeader} from "./UserInfo/ProfileHeader";
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
import {InlineTypography} from "../common";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import {Add, ConnectWithoutContact, Delete, Edit, Refresh} from "@mui/icons-material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

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
    // await updateContact(contact);
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
            <h1>User Profile使用指南</h1>
            本页面供OpenSIST用户创建/编辑/查看自己的申请人信息。
            <ul>
                <li>
                    侧边栏使用说明
                    <ul>
                        <li>
                            <InlineTypography>
                                点击侧边栏<PersonAddAltIcon/>按钮可添加申请人。填写信息时，表单当中所有带*的字段为必填项。
                            </InlineTypography>
                        </li>
                        <li>
                            <InlineTypography>
                                添加申请人后，侧边栏内会出现<PersonOutlineIcon/>按钮与"username@年份"的字样，点击此按钮可查看该申请人信息。
                            </InlineTypography>
                        </li>
                        <li>
                            <b>
                                一个用户可以拥有多个申请人（例如一个用户有连续两年的申请经历），不同申请人之间以@后面的年份作为区分。
                            </b>
                        </li>
                        <li>
                            <InlineTypography>
                                可点击侧边栏的<Edit/>上传头像，图片大小不得超过4MB，支持的图片格式有：jpg、jpeg、png、gif、svg、webp。
                            </InlineTypography>
                        </li>
                        <li>
                            <InlineTypography>
                                OpenSIST为用户提供匿名选项，用户可点击侧边栏的匿名开关来开启/关闭匿名。开启匿名后，用户的username将从上科大邮箱前缀变为随机的英文名。
                            </InlineTypography>
                        </li>
                        <li>
                            <InlineTypography>
                                可点击侧边栏的<ConnectWithoutContact/>填写个人联系方式（包括但不限于个人主页、LinkedIn、QQ、微信等），用户可按照自己意愿选择性填写此项。
                            </InlineTypography>
                        </li>
                        <li>
                            <InlineTypography>
                                如遇任何信息更改后不同步的情况，可点击侧边栏右上角<Refresh/>按钮刷新侧边栏。
                            </InlineTypography>
                        </li>
                    </ul>
                </li>
                <li>
                    申请人页面使用说明
                    <ul>
                        <li>
                            <InlineTypography>
                                申请人页面包括申请人的专业、申请年份、三维、软背景等信息，用户可点击页面上部基本信息栏的<Edit/>编辑申请人信息，点击<Delete/>删除该申请人。
                            </InlineTypography>
                        </li>
                        <li>
                            <InlineTypography>
                                在该页面底部，可编辑该申请人所申请的项目以及申请结果。点击<Add/>按钮可添加一条记录，添加后的记录会以卡片形式显示在底部，每个卡片都有<Edit/>和<Delete/>按钮来编辑/删除该条记录。
                            </InlineTypography>
                        </li>
                        <li>
                            可点击每个卡片的项目名跳转到项目信息表当中查看该项目的详细信息。
                        </li>
                        <li>
                            <InlineTypography>
                                OpenSIST本着信息共享的原则，将申请人页面设为对OpenSIST所有用户可见，但非用户本人无法编辑或删除申请人信息。
                            </InlineTypography>
                        </li>
                        <li>
                            <InlineTypography>
                                如遇任何信息更改后不同步的情况，可在申请人信息表的上部基本信息栏当中点击<Refresh/>按钮刷新申请人信息页面。
                            </InlineTypography>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}