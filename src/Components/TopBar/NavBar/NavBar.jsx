import React, {useState} from "react";
import "./NavBar.css";
import {useNavigate} from "react-router-dom";

export default function NavBar() {
    const navigate = useNavigate();
    const [selection, setSelection] = useState('Programs');
    return (
        <nav className='NavBar'>
            <ul className='NavBarList'>
                <li className={'NavBarItem' + (selection === 'Programs' ? 'Selected' : '')}>
                    <b onClick={() => {
                        setSelection('Programs')
                        navigate('/')
                    }}>
                        项目信息表
                    </b>
                </li>
                <li className={'NavBarItem' + (selection === 'Applicants' ? 'Selected' : '')}>
                    <b onClick={() => {
                        setSelection('Applicants')
                        navigate('/applicants')
                    }}>
                        申请人信息表
                    </b>
                </li>
            </ul>
        </nav>
    );
}