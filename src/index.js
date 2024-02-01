    import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from "./Components/home";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import ProgramPage, {
    loader as programPageLoader
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
import Profile from "./Components/Profile/Profile";
import {createTheme, ThemeProvider, useMediaQuery} from "@mui/material";
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

function OpenSIST() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <Home/>,
            errorElement: <ErrorPage/>,
            children: [
                {
                    errorElement: <ErrorPage/>,
                    children: [
                        {
                            path: '/programs',
                            element: <ProgramPage/>,
                            loader: programPageLoader,
                            action: (
                                () => getPrograms(true)
                            ),
                            children: [
                                {
                                    errorElement: <ErrorPage/>,
                                    children: [
                                        {
                                            path: '/programs/:programId',
                                            element: <ProgramContent/>,
                                            loader: programContentLoader,
                                            action: programContentAction
                                        }, {
                                            path: '/programs/:programId/edit',
                                            element: <AddModifyProgram key='edit'/>,
                                            loader: programContentLoader,
                                            action: addModifyProgramAction
                                        }, {
                                            path: '/programs/new',
                                            element: <AddModifyProgram key='new'/>,
                                            action: addModifyProgramAction
                                        }, {
                                            index: true,
                                            element: <ProgramIndex/>,
                                        }
                                    ]
                                }
                            ]
                        }, {
                            path: '/applicants',
                            element: <h1>开发组正在加班加点赶工...</h1>,
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
                                            path: '/admin/applicants',
                                        }, {
                                            path: '/admin/records',
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
                            path: '/profile',
                            element: <Profile/>,
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
                            element: <h1>开发组正在加班加点赶工...</h1>,
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

    const theme = createTheme({
        palette: {
            mode: prefersDarkMode ? 'dark' : 'light',
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
            <ThemeProvider theme={theme}><RouterProvider router={router}/></ThemeProvider>
        </React.StrictMode>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<OpenSIST/>);
