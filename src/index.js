import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from "./Components/Auth/Login/Login";
import RegisterAndReset from "./Components/Auth/RegisterAndReset/RegisterAndReset";
import Home from "./Components/home";
import Agreement from "./Components/Agreement/Agreement";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([{
    path: "/",
    element: <Home/>
}, {
    path: "/login",
    element: <Login/>
}, {
    path: "/register",
    element: <RegisterAndReset/>
}, {
    path: "/agreement",
    element: <Agreement/>
}, {
    path: "/reset",
    element: <RegisterAndReset/>
}, {
    path: "/applicants",
    element: <h1>Applicants</h1>
}, {
    path: '/profile',
    element: <h1>Profile</h1>
}
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
