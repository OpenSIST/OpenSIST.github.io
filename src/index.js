import React, {createContext, useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home, {HomeIndex} from "./Components/home";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ProgramPage, {
    loader as ProgramPageLoader
} from "./Components/ProgramPage/ProgramPage";
import ProgramContent, {
    loader as programContentLoader,
    action as programContentAction
} from "./Components/ProgramPage/ProgramContent/ProgramContent";
import Login, {
    action as loginAction
} from "./Components/Auth/Login/Login";
import RegisterAndReset, {
    action as registerAndResetAction
} from "./Components/Auth/RegisterAndReset/RegisterAndReset";
import AddModifyProgram, {
    action as addModifyProgramAction
} from "./Components/Modify/Program/AddModifyProgram";
import {getPrograms} from "./Data/ProgramData";
import Agreement from "./Components/Agreement/Agreement";
import ErrorPage from "./Components/Errors/ErrorPage";
import Profile, {
    action as profileAction,
    loader as profileLoader, ProfileIndex
} from "./Components/Profile/Profile";
import {alpha, createTheme, getContrastRatio, ThemeProvider, useMediaQuery} from "@mui/material";
import AdminPage, {AdminIndex} from "./Components/Admin/AdminPage";
import AdminProgramPage, {
    loader as AdminProgramLoader,
    action as AdminProgramAction
} from "./Components/Admin/AdminProgram/AdminProgramPage";
import Twemoji from "./Assets/fonts/TwemojiMozilla.ttf";
import OpenSansRegular from "./Assets/fonts/open-sans-v17-latin-ext_latin-regular.woff2";
import OpenSansBold from "./Assets/fonts/open-sans-v17-latin-ext_latin-700.woff2";
import OpenSansItalic from "./Assets/fonts/open-sans-v17-latin-ext_latin-italic.woff2";
import OpenSansBoldItalic from "./Assets/fonts/open-sans-v17-latin-ext_latin-700italic.woff2";
import AdminEmailPage, {
    loader as AdminEmailPageLoader,
    action as AdminEmailPageAction
} from "./Components/Admin/AdminEmail/AdminEmailPage";
import {ProgramIndex} from "./Components/ProgramPage/ProgramPage";
import localforage from "localforage";
import {loader as HomeLoader, action as HomeAction} from "./Components/TopBar/StatusBlock/StatusBlock";
import {
    loader as ProfileApplicantLoader,
    DataPointsLoader as ProfileDataPointsLoader,
    action as ProfileApplicantAction, ProfileApplicantPage
} from "./Components/Profile/ProfileApplicant/ProfileApplicantPage";
import AddModifyApplicant, {
    action as addModifyApplicantAction
} from "./Components/Modify/Applicant/AddModifyApplicant";
import AddModifyRecord, {
    loader as addModifyRecordLoader,
    action as addModifyRecordAction
} from "./Components/Modify/Record/AddModifyRecord";
import {AboutUs} from "./Components/AboutUs/AboutUs";
import DataPoints, {
    ApplicantProfileInDataPoints,
    loader as DataPointsLoader, ProgramContentInDataPoints
} from "./Components/DataPoints/DataPoints";

export const ThemeContext = createContext({
    toggleTheme: () => {
    },
});

function OpenSIST() {
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
                    element: <HomeIndex/>,
                }, {
                    errorElement: <ErrorPage/>,
                    children: [
                        {
                            path: '/programs',
                            element: <ProgramPage/>,
                            loader: ProgramPageLoader,
                            action: (
                                () => getPrograms(true)
                            ),
                            children: [
                                {
                                    errorElement: <ErrorPage/>,
                                    children: [
                                        {
                                            index: true,
                                            element: <ProgramIndex/>,
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
                            children: [
                                {
                                    errorElement: <ErrorPage/>,
                                    children: [
                                        {
                                            path: '/datapoints/applicant/:applicantId',
                                            element: <ApplicantProfileInDataPoints/>,
                                            loader: ProfileDataPointsLoader,
                                        }, {
                                            path: '/datapoints/program/:programId',
                                            element: <ProgramContentInDataPoints/>,
                                            loader: programContentLoader,
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
                                            element: <ProfileIndex/>
                                        }, {
                                            path: '/profile/:applicantId',
                                            element: <ProfileApplicantPage editable={true}/>,
                                            loader: ProfileApplicantLoader,
                                            action: ProfileApplicantAction,
                                        }, {
                                            path: '/profile/new-applicant',
                                            element: <AddModifyApplicant key='new' type='new'/>,
                                            action: addModifyApplicantAction
                                        }, {
                                            path: '/profile/:applicantId/new-record',
                                            element: <AddModifyRecord key='new' type='new'/>,
                                            loader: addModifyRecordLoader,
                                            action: addModifyRecordAction
                                        }, {
                                            path: '/profile/:applicantId/edit',
                                            element: <AddModifyApplicant key='edit' type='edit'/>,
                                            loader: ProfileApplicantLoader,
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
                            path: '/admin',
                            element: <AdminPage/>,
                            children: [
                                {
                                    errorElement: <ErrorPage/>,
                                    children: [
                                        {
                                            index: true,
                                            element: <AdminIndex/>,
                                        },
                                        {
                                            path: '/admin/programs',
                                            element: <AdminProgramPage/>,
                                            loader: AdminProgramLoader,
                                            action: AdminProgramAction
                                        }, {
                                            path: '/admin/emails',
                                            element: <AdminEmailPage/>,
                                            loader: AdminEmailPageLoader,
                                            action: AdminEmailPageAction
                                        }
                                    ]
                                }
                            ]
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
                        }, {
                            path: '/how-to-use',
                            element: <h1>开发组正在加班加点赶工...</h1>,
                        }
                    ]
                }
            ]
        },
    ]);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState(null);
    useEffect(() => {
        localforage.getItem('theme').then((theme) => {
            setMode(theme);
        });
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.style.setProperty('--scrollbar-color', 'rgba(155, 155, 155, 0.7)');
            root.style.setProperty('--bg-color', 'rgba(0, 0, 0, 0.9)');
            root.style.setProperty('--datatable-header-bg-color', "#313131");
            root.style.setProperty('--datatable-rowgroup-header-bg-color', "#3b3b3b");
        } else {
            root.style.setProperty('--scrollbar-color', 'rgba(0, 0, 0, 0.5)');
            root.style.setProperty('--bg-color', 'rgba(255, 255, 255, 0.9)');
            root.style.setProperty('--datatable-header-bg-color', "#e5e5e5");
            root.style.setProperty('--datatable-rowgroup-header-bg-color', "#efefef");
        }
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
    };
    const violetBase = '#7F00FF';
    const violetMain = alpha(violetBase, 0.7);
    const theme = createTheme({
        palette: {
            mode: mode ?? (prefersDarkMode ? 'dark' : 'light'),
        },
        // palette: getPalette(prefersDarkMode),
        components: {
            MuiButtonBase: {
                defaultProps: {
                    disableRipple: true,
                }, styleOverrides: {
                    root: {
                        "&:active": {
                            transition: "transform 0.1s ease-in-out",
                            transform: "scale(0.98)",
                        },
                    },
                },
            },
            MuiButtonGroup: {
                defaultProps: {
                    disableRipple: true,
                },
            },
            MuiCssBaseline: {
                styleOverrides: `
            @font-face {
                font-family: 'Twemoji';
                src: url(${Twemoji}) format('truetype');
            },
            @font-face {
                font-family: 'Open Sans';
                font-style: normal;
                font-weight: normal;
                src: local('Open Sans Regular'), local('OpenSans-Regular'), url(${OpenSansRegular}) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            },
            @font-face {
                font-family: 'Open Sans';
                font-style: normal;
                font-weight: bold;
                src: local('Open Sans Bold'), local('OpenSans-Bold'), url(${OpenSansBold}) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            },
            @font-face {
                font-family: 'Open Sans';
                font-style: italic;
                font-weight: normal;
                src: local('Open Sans Italic'), local('OpenSans-Italic'), url(${OpenSansItalic}) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            },
            @font-face {
                font-family: 'Open Sans';
                font-style: italic;
                font-weight: bold;
                src: local('Open Sans Bold Italic'), local('OpenSans-BoldItalic'), url(${OpenSansBoldItalic}) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }
            `,
            },
        },
        typography: {
            fontFamily: [
                "Open Sans",
                "Clear Sans",
                "Helvetica Neue",
                'Helvetica, Arial',
                'Twemoji',
                'sans-serif',
            ].join(','),
        },
    });

    return (
        <React.StrictMode>
            <ThemeProvider theme={theme}>
                <ThemeContext.Provider value={{toggleTheme}}>
                    <RouterProvider router={router}/>
                </ThemeContext.Provider>
            </ThemeProvider>
        </React.StrictMode>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<OpenSIST/>);
