import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from "./Components/login";
import Register from "./Components/register";
import Verify from "./Components/verify";
import Home from "./Components/home";
import {
    createBrowserRouter,
    RouterProvider, useNavigate,
} from "react-router-dom";
import Agreement from "./Components/agreement";

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
}
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
