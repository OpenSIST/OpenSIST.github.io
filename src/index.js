import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from "./Components/Auth/Login/Login";
import Register from "./Components/Auth/Register/Register";
import Home from "./Components/home";
import Agreement from "./Components/Agreement/Agreement";
import Reset from "./Components/Auth/Reset/Reset";
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
    element: <Register/>
}, {
    path: "/agreement",
    element: <Agreement/>
}, {
    path: "/reset",
    element: <Reset/>
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
