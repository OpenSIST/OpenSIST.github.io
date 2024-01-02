import {useNavigate} from "react-router-dom";
import "./StatusBlock.css"
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useEffect, useRef, useState} from "react";
import localforage from "localforage";
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
            <UserMenu isShow={isMenuVisible} ref={menuRef}/>
        </div>
    );
}

const UserMenu = React.forwardRef((props, ref) => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            const session = await localforage.getItem('session');
            const response = await fetch('https://opensist-auth.caoster.workers.dev/api/my/logout', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session}`
                }
            })
            if (response.status !== 200) {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            } else {
                alert('Logout Successfully!');
            }
        } catch (e) {
            alert(e);
        }
        await localforage.removeItem('user')
        await localforage.removeItem('session')
        navigate('/login');
    }

    if (!props.isShow) {
        return null;
    }
    return (
        <div className="UserMenu" ref={ref}>
            <ul>
                <button name='Profile' id='Profile' title='Profile' className='Button' onClick={() => navigate('/profile')}>
                    <FontAwesomeIcon icon={solid("home")}/>
                </button>
                <button name='Reset' id='Reset' title='Reset Password' className='Button' onClick={() => navigate('/reset')}>
                    <FontAwesomeIcon icon={solid("undo")}/>
                </button>
                <button name='Logout' id='Logout' title='Logout' className='Button' onClick={handleLogout}>
                    <FontAwesomeIcon icon={solid("sign-out-alt")}/>
                </button>
            </ul>
        </div>
    )
});