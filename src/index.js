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
    loader as programContentLoader
} from "./Components/ProgramPage/ProgramContent/ProgramContent";
import Login from "./Components/Auth/Login/Login";
import RegisterAndReset from "./Components/Auth/RegisterAndReset/RegisterAndReset";
import AddModifyProgram, {
    action as addModifyProgramAction
} from "./Components/Modify/Program/AddModifyProgram";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>,
        children: [
            {
                path: '/programs',
                element: <ProgramPage/>,
                loader: programPageLoader,
                children: [
                    {
                        path: '/programs/:programId',
                        element: <ProgramContent/>,
                        loader: programContentLoader
                    }, {
                        path: '/programs/:programId/edit',
                        element: <AddModifyProgram/>,
                        loader: programContentLoader,
                        action: addModifyProgramAction
                    }
                ]
            }, {
                path: '/applicants'
            }
        ]
    }, {
        path: '/login',
        element: <Login/>
    }, {
        path: '/register',
        element: <RegisterAndReset/>
    }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
