import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from "./login";
import Register from "./register";
import Verify from "./verify";
import Home from "./home";
import {
    createBrowserRouter,
    RouterProvider, useNavigate,
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
    path: "/verify",
    element: <Verify/>
}
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
