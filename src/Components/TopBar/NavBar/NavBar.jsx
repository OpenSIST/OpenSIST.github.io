import React from "react";
import "./NavBar.css";
import {useNavigate, NavLink, Form} from "react-router-dom";

export default function NavBar() {
    const navigate = useNavigate();
    return (
        <nav className='NavBar'>
            <ul className='NavBarList'>
                <li>
                    <NavLink
                        to="/programs"
                        className={"NavBarItem " + (({isActive}) =>
                            isActive ? "active" : "")
                        }
                    >
                        <b>项目信息表</b>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/applicants"
                        className={"NavBarItem " + (({isActive}) =>
                            isActive ? "active" : "")
                        }
                    >
                        <b>申请人信息表</b>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}