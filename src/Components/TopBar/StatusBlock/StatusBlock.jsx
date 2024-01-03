import {Form, useNavigate, useNavigation} from "react-router-dom";
import "./StatusBlock.css"
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useEffect, useRef, useState} from "react";
import localforage from "localforage";
import {logout} from "../../../Data/UserData";
import {ResponsiveButton} from "../../common";

export async function action() {
    return await logout();
}

export function StatusBlock() {
    const [isMenuVisible, setIsMenuVisible] = useState(false)
    const menuRef = useRef(null)
    const [user, setUser] = useState('')
    useEffect(() => {
        const fetchData = async () => {
            setUser(await localforage.getItem('user'));
        };
        fetchData().then();
    }, []);


    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuVisible(false)
        }
    }

    const handleUserBlockClick = (event) => {
        event.stopPropagation()
        setIsMenuVisible(!isMenuVisible)
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className='StatusBlock'>
            <div className='UserBlock' onMouseDown={handleUserBlockClick}>
                <FontAwesomeIcon icon={solid("circle-user")} size="2xl"/>
                <p>{user}</p>
                <FontAwesomeIcon icon={solid("caret-down")}/>
            </div>
            {isMenuVisible ? <UserMenu ref={menuRef}/> : null}
        </div>
    );
}

const UserMenu = React.forwardRef((props, ref) => {
    return (
        <div className="UserMenu" ref={ref}>
            <ul>
                <Form action='/profile'>
                    <button
                        title='Profile'
                        className='Button'
                    >
                        <FontAwesomeIcon icon={solid("home")}/>
                    </button>
                </Form>
                <Form action='/reset'>
                    <button
                        title='Reset Password'
                        className='Button'
                    >
                        <FontAwesomeIcon icon={solid("undo")}/>
                    </button>
                </Form>
                <Form method='post'>
                    <ResponsiveButton
                        content={(<FontAwesomeIcon icon={solid("sign-out-alt")}/>)}
                        title='Logout'
                    />
                </Form>
            </ul>
        </div>
    )
});