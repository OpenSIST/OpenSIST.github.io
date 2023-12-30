import React from "react";
import "./NavBar.css";
import {useNavigate} from "react-router-dom";

export default function NavBar() {
    const navigate = useNavigate();

    return (
        <div className='NavBar'>
            <nav>
                <div className='NavBar-item'>
                    <b onClick={() => {
                        navigate('/')
                    }} style={{cursor: 'pointer'}}>
                        项目信息表
                    </b>
                </div>
                <div className='NavBar-item'>
                    <b onClick={() => {
                        navigate('/applicants')
                    }} style={{cursor: 'pointer'}}>
                        申请人信息表
                    </b>
                </div>
            </nav>
        </div>
    );
}