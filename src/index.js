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
import RegisterAndReset from "./Components/Auth/RegisterAndReset/RegisterAndReset";
import AddModifyProgram, {
    action as addModifyProgramAction
} from "./Components/Modify/Program/AddModifyProgram";
// import {action as SideBarAction} from "./Components/SideBar/SideBar";
import {getPrograms} from "./Data/ProgramData";

import {loader as homeLoader} from "./Components/home";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>,
        loader: homeLoader,
        children: [
            {
                path: '/programs',
                element: <ProgramPage/>,
                loader: programPageLoader,
                action: (() => getPrograms(true)),
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
                    }
                ]
            }, {
                path: '/applicants'
            }
        ]
    }, {
        path: '/login',
        element: <Login/>,
        action: loginAction
    }, {
        path: '/register',
        element: <RegisterAndReset/>
    }, {
        path: '/reset',
        element: <RegisterAndReset/>
    }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
