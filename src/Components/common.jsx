import {useLocation, useNavigation} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {useEffect, useRef, useState} from "react";

export function ResponsiveButton({
                                     content = (<FontAwesomeIcon icon={solid("arrows-rotate")}/>),
                                     title = 'Refresh'
                                 }) {
    const navigation = useNavigation()
    const loading =
        navigation.state !== 'idle'
        && navigation.formData != null
        && navigation.formAction === navigation.location?.pathname;

    return (
        <button
            type='submit'
            title={title}
        >
            {loading ? <FontAwesomeIcon icon={solid("arrows-rotate")} spin={loading}/> : content}
        </button>
    )
}

export function useHidden() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowWidth / windowHeight < 0.75 || windowWidth < 768;
    // return windowWidth < 768;
}

export function usePending() {
    const navigation = useNavigation();
    return navigation.state === 'loading' ? 'loading' : '';
}

export function useClickOutSideRef() {
    const [isMenuVisible, setIsMenuVisible] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuVisible(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return [isMenuVisible, setIsMenuVisible, menuRef];
}

export function useUnAuthorized() {
    const location = useLocation();
    return ['/login', '/register', '/reset', '/agreement'].includes(location.pathname);
}