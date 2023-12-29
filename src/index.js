import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from "./Components/Auth/Login/Login";
import Register from "./Components/Auth/Register/Register";
import Verify from "./Components/Auth/Verify/Verify";
import Home from "./Components/home";
import {
    createBrowserRouter,
    RouterProvider, useNavigate,
} from "react-router-dom";
import Agreement from "./Components/Agreement/Agreement";
import AddModifyProgram from "./Components/Modify/Program/AddModifyProgram";
import Reset from "./Components/Auth/Reset/Reset";

const router = createBrowserRouter([{
    path: "/",
    element: <Home/>
}, {
    path: "/login",
    element: <Login/>
}, {
    path: "/register",
    element: <Register/>
}, {
    path: "/verify",
    element: <Verify/>
}, {
    path: "/agreement",
    element: <Agreement/>
}, {
    path: "/reset",
    element: <Reset/>
},
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
