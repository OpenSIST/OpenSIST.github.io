import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TopBar from './TopBar';
import SideBar from "./SideBar";
import Login from "./login";
import Register from "./register";
import Verify from "./verify";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";


const router = createBrowserRouter([{
    path: "/",
    element: <><TopBar/><SideBar url={"https://opensist-data.s3.amazonaws.com/univ_list.json"}/></>
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
