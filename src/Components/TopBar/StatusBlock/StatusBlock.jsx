import {Form, useNavigate, useNavigation} from "react-router-dom";
import "./StatusBlock.css"
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useEffect, useRef, useState} from "react";
import localforage from "localforage";
import {logout} from "../../../Data/UserData";
import {ResponsiveButton, useClickOutSideRef, useUnAuthorized} from "../../common";

export async function action() {
    return await logout();
}

export function StatusBlock() {
    const [isMenuVisible, setIsMenuVisible, MenuRef] = useClickOutSideRef();
    const [user, setUser] = useState('')
    useEffect(() => {
        const fetchData = async () => {
            setUser(await localforage.getItem('user'));
        };
        fetchData().then();
    }, []);
    if (useUnAuthorized()) {
        return null;
    }

    return (
        <div className='StatusBlock' ref={MenuRef}>
            <div className='UserBlock' onMouseDown={() => setIsMenuVisible(!isMenuVisible)}>
                <FontAwesomeIcon icon={solid("circle-user")} size="2xl"/>
                <p>{user}</p>
                <FontAwesomeIcon icon={solid("caret-down")}/>
            </div>
            {isMenuVisible ? <UserMenu/> : null}
        </div>
    );
}

function UserMenu() {
    return (
        <div className="UserMenu">
            <ul>
                <Form action='/profile'>
                    <button
                        title='Profile'
                    >
                        <FontAwesomeIcon icon={solid("home")}/>
                    </button>
                </Form>
                <Form action='/reset'>
                    <button
                        title='Reset Password'
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
}