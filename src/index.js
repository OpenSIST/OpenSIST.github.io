import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TopBar from './TopBar';
import SideBar from "./SideBar";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TopBar/>
      {<SideBar url={"https://opensist-data.s3.amazonaws.com/univ_list.json"}/>}

  </React.StrictMode>
);
