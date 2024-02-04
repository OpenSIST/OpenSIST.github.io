import {useLocation, useNavigation} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {Backdrop, CircularProgress, Typography} from "@mui/material";
import {grey} from "@mui/material/colors";

export function isEmptyObject(value) {
    return value === '' || value.length === 0;
}

export function LoadingBackdrop() {
    const navigation = useNavigation()
    const loading = navigation.state !== 'idle'
    // console.log(loading)
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

export const InlineTypography = (props) => <Typography variant="body1" {...props}
                                                sx={{display: 'flex', alignItems: 'center', flexWrap: "wrap"}}/>;
