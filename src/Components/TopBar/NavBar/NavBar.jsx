import React, {createContext, useState} from "react";
import "./NavBar.css";
import { NavLink } from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {useHidden, useUnAuthorized} from "../../common";

export default function NavBar() {
    return (
        <nav className='NavBar' hidden={useUnAuthorized()}>
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