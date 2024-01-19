import {useLocation, useNavigation} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {Backdrop, CircularProgress} from "@mui/material";
import {blueGrey, grey} from "@mui/material/colors";

export function isEmptyObject(value) {
    return value === '' || value.length === 0;
}

export function LoadingBackdrop() {
    const navigation = useNavigation()
    const loading = navigation.state !== 'idle'
    return (
        <Backdrop open={loading} sx={{zIndex: 99999}}>
            <CircularProgress color="inherit"/>
        </Backdrop>
    )
}

export function useSmallPage() {
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

export function getPalette(mode) {
    return {
        mode,
        background: {
            paper: mode === 'dark' ? grey[900] : grey[100],
        },
    }
}
