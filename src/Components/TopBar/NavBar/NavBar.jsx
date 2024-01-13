import React, {createContext, useState} from "react";
import "./NavBar.css";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {useClickOutSideRef, useSmallPage, useUnAuthorized} from "../../common";

export default function NavBar() {
    const [isMenuVisible, setIsMenuVisible, menuRef] = useClickOutSideRef();
    const navItems = [
        {
            name: "项目信息表",
            path: "/programs",
        },
        {
            name: "申请人信息表",
            path: "/applicants",
        },
        {
            name: "关于我们",
            path: "/",
        },
    ]
    const isSmallPage = useSmallPage();
    if (useUnAuthorized()) {
        return null;
    }
    return (
        <div className='NavBar' ref={isSmallPage ? menuRef : null}>
            {isSmallPage && <button onMouseDown={() => setIsMenuVisible(!isMenuVisible)}>
                <FontAwesomeIcon
                    icon={solid('ellipsis')}
                />
                </button>}
            {!isSmallPage || isMenuVisible ?
                <ul className={'NavBarList ' + (isSmallPage ? 'Shrink' : '')}>
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <NavLink
                                to={item.path}
                                className={"NavBarItem " + (({isActive}) =>
                                    isActive ? "active" : "")
                                }
                            >
                                <b>{item.name}</b>
                            </NavLink>
                        </li>
                    ))}
                </ul> : null}
        </div>
    );
}
// <FontAwesomeIcon icon={solid('ellipsis')} />
