import React from "react";
import "./NavBar.css";
import {NavLink} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {useClickOutSideRef, useSmallPage, useUnAuthorized} from "../../common";

export default function NavBar() {
    const [isMenuVisible, setIsMenuVisible, menuRef] = useClickOutSideRef();
    // const [current, setCurrent] = useState('Welcome');
    const navItems = [
        {
            name: "关于我们",
            path: "/about-us", // TODO: write ABOUT US page
        },
        {
            name: "项目信息表",
            path: "/programs",
        },
        {
            name: "申请人信息表",
            path: "/applicants",
        },
    ]
    const current = navItems.find((item) => window.location.pathname.startsWith(item.path))?.name ?? 'Welcome';
    const isSmallPage = useSmallPage();
    if (useUnAuthorized()) {
        return null;
    }
    return (
        <div className='NavBar' ref={isSmallPage ? menuRef : null}>
            {isSmallPage &&
                <div className="NavBarItem" onMouseDown={() => setIsMenuVisible(!isMenuVisible)}>
                    <b>{current}    </b>
                    <FontAwesomeIcon
                        icon={solid('caret-down')}
                    />
                </div>
            }
            {!isSmallPage || isMenuVisible ?
                <ul className={'NavBarList ' + (isSmallPage ? 'Shrink' : '')}>
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <NavLink
                                to={item.path}
                                className={"NavBarItem " + (({isActive}) =>
                                    isActive ? "active" : "")
                                }
                                // onClick={() => setCurrent(item.name)}
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
