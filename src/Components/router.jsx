import {createBrowserRouter} from "react-router-dom";
import Home, {HomeIndex} from "./Home/home";
import {action as HomeAction, loader as HomeLoader} from "./TopBar/StatusBlock/StatusBlock";
import ErrorPage from "./Errors/ErrorPage";
import ProgramPage, {
    action as ProgramPageAction,
    loader as ProgramPageLoader,
} from "./ProgramPage/ProgramPage";
import ProgramContent, {
    action as programContentAction,
    loader as programContentLoader
} from "./ProgramPage/ProgramContent/ProgramContent";
import AddModifyProgram, {action as addModifyProgramAction} from "./Modify/Program/AddModifyProgram";
import DataPoints, {
    action as DataPointsAction,
    ApplicantProfileInDataPoints,
    loader as DataPointsLoader, ProgramContentInDataPoints
} from "./DataPoints/DataPoints";
import {
    action as ProfileApplicantAction,
    DataPointsAction as ProfileDataPointsAction,
    DataPointsLoader as ProfileDataPointsLoader, loader as ProfileApplicantLoader, ProfileApplicantPage
} from "./Profile/ProfileApplicant/ProfileApplicantPage";
import Profile, {action as profileAction, loader as profileLoader} from "./Profile/Profile";
import AddModifyApplicant, {
    action as addModifyApplicantAction,
    loader as addModifyApplicantLoader
} from "./Modify/Applicant/AddModifyApplicant";
import AddModifyRecord, {
    action as addModifyRecordAction,
    loader as addModifyRecordLoader
} from "./Modify/Record/AddModifyRecord";
import PostPage, {action as PostPageAction, loader as PostPageLoader} from "./Post/PostPage";
import PostContent, {action as PostContentAction, loader as PostContentLoader} from "./Post/PostContent/PostContent";
import AddModifyPost, {action as AddModifyPostAction, loader as AddModifyPostLoader} from "./Modify/Post/AddModifyPost";
import MarkDownPage from "./MarkDownPage/MarkDownPage";
import Login, {action as loginAction} from "./Auth/Login/Login";
import RegisterAndReset, {action as registerAndResetAction} from "./Auth/RegisterAndReset/RegisterAndReset";
import Agreement from "./Agreement/Agreement";
import {AboutUs} from "./AboutUs/AboutUs";
import {HowToUse} from "./HowToUse/HowToUse";
import React from "react";
import FAQMDPath from "../Data/MarkDown/FAQ.md";
import ProgramIndexMDPath from "../Data/MarkDown/ProgramIndex.md"
import {loadMarkDown} from "../Data/Common";
import ProfileIndexMDPath from "../Data/MarkDown/ProfileIndex.md"
import PostIndexMDPath from "../Data/MarkDown/PostIndex.md"
import Favorites, {loader as FavoritesLoader} from "./Favorites/Favorites";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>,
        loader: HomeLoader,
        action: HomeAction,
        errorElement: <ErrorPage/>,
        children: [
            {
                index: true,
                element: <HomeIndex/>
            }, {
                errorElement: <ErrorPage/>,
                children: [
                    {
                        path: '/programs',
                        element: <ProgramPage/>,
                        loader: ProgramPageLoader,
                        action: ProgramPageAction,
                        children: [
                            {
                                errorElement: <ErrorPage/>,
                                children: [
                                    {
                                        index: true,
                                        element: <MarkDownPage key="ProgramIndex"/>,
                                        loader: async () => {
                                            return {content: await loadMarkDown(ProgramIndexMDPath)}
                                        }
                                    }, {
                                        path: '/programs/:programId',
                                        element: <ProgramContent/>,
                                        loader: programContentLoader,
                                        action: programContentAction
                                    }, {
                                        path: '/programs/:programId/edit',
                                        element: <AddModifyProgram key='edit' type='edit'/>,
                                        loader: programContentLoader,
                                        action: addModifyProgramAction
                                    }, {
                                        path: '/programs/new',
                                        element: <AddModifyProgram key='new' type='new'/>,
                                        action: addModifyProgramAction
                                    },
                                ]
                            }
                        ]
                    }, {
                        path: '/datapoints',
                        element: <DataPoints/>,
                        loader: DataPointsLoader,
                        action: DataPointsAction,
                        children: [
                            {
                                errorElement: <ErrorPage/>,
                                children: [
                                    {
                                        path: '/datapoints/applicant/:applicantId',
                                        element: <ApplicantProfileInDataPoints/>,
                                        loader: ProfileDataPointsLoader,
                                        action: ProfileDataPointsAction,
                                    }, {
                                        path: '/datapoints/program/:programId',
                                        element: <ProgramContentInDataPoints/>,
                                        loader: programContentLoader,
                                        action: programContentAction
                                    }
                                ]
                            }
                        ]
                    }, {
                        path: '/profile',
                        element: <Profile/>,
                        loader: profileLoader,
                        action: profileAction,
                        children: [
                            {
                                errorElement: <ErrorPage/>,
                                children: [
                                    {
                                        index: true,
                                        element: <MarkDownPage key="ProfileIndex"/>,
                                        loader: async () => {
                                            return {content: await loadMarkDown(ProfileIndexMDPath)}
                                        }
                                    }, {
                                        path: '/profile/:applicantId',
                                        element: <ProfileApplicantPage editable={true}/>,
                                        loader: ProfileApplicantLoader,
                                        action: ProfileApplicantAction,
                                    }, {
                                        path: '/profile/new-applicant',
                                        element: <AddModifyApplicant key='new' type='new'/>,
                                        loader: addModifyApplicantLoader,
                                        action: addModifyApplicantAction
                                    }, {
                                        path: '/profile/new-record',
                                        element: <AddModifyRecord key='new' type='new'/>,
                                        loader: addModifyRecordLoader,
                                        action: addModifyRecordAction
                                    }, {
                                        path: '/profile/:applicantId/edit',
                                        element: <AddModifyApplicant key='edit' type='edit'/>,
                                        loader: addModifyApplicantLoader,
                                        action: addModifyApplicantAction
                                    }, {
                                        path: '/profile/:applicantId/:programId/edit',
                                        element: <AddModifyRecord key='edit' type='edit'/>,
                                        loader: addModifyRecordLoader,
                                        action: addModifyRecordAction
                                    }
                                ]
                            }
                        ]
                    }, {
                        path: '/favorites',
                        element: <Favorites/>,
                        loader: FavoritesLoader,
                        children: [
                            {
                                errorElement: <ErrorPage/>,
                                children: [
                                    {
                                        path: '/favorites/:programId',
                                        element: <ProgramContentInDataPoints/>,
                                        loader: programContentLoader,
                                        action: programContentAction
                                    }
                                ]
                            }
                        ]
                    }, {
                        path: '/posts',
                        element: <PostPage/>,
                        loader: PostPageLoader,
                        action: PostPageAction,
                        children: [
                            {
                                errorElement: <ErrorPage/>,
                                children: [
                                    {
                                        index: true,
                                        element: <MarkDownPage key={"PostIndex"}/>,
                                        loader: async () => {
                                            return {content: await loadMarkDown(PostIndexMDPath)}
                                        }
                                    }, {
                                        path: '/posts/:postId',
                                        element: <PostContent/>,
                                        loader: PostContentLoader,
                                        action: PostContentAction
                                    }, {
                                        path: '/posts/:postId/edit',
                                        element: <AddModifyPost key="edit" type="edit"/>,
                                        loader: AddModifyPostLoader,
                                        action: AddModifyPostAction
                                    }, {
                                        path: '/posts/new',
                                        element: <AddModifyPost key="new" type="new"/>,
                                        loader: AddModifyPostLoader,
                                        action: AddModifyPostAction
                                    }
                                ]
                            }
                        ]
                    }, {
                        path: '/FAQ',
                        element: <MarkDownPage key="FAQ" sx={{width: "80%", bgcolor: (theme) => theme.palette.mode === "dark" ? "#1A1E24" : "#FAFAFA"}}/>,
                        loader: async () => {
                            return {content: await loadMarkDown(FAQMDPath)}
                        },
                    }, {
                        path: '/login',
                        element: <Login/>,
                        action: loginAction
                    }, {
                        path: '/register',
                        element: <RegisterAndReset/>,
                        action: registerAndResetAction
                    }, {
                        path: '/reset',
                        element: <RegisterAndReset/>,
                        action: registerAndResetAction
                    }, {
                        path: '/agreement',
                        element: <Agreement/>,
                    }, {
                        path: '/about-us',
                        element: <AboutUs/>,
                    },
                    // {
                    //     path: '/how-to-use',
                    //     element: <HowToUse/>,
                    // }
                ]
            }
        ]
    },
]);

export default router;