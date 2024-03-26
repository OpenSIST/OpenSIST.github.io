import React, {createContext, useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {RouterProvider} from "react-router-dom";
import {createTheme, ThemeProvider, useMediaQuery} from "@mui/material";
import Twemoji from "./Assets/fonts/TwemojiMozilla.ttf";
import OpenSansRegular from "./Assets/fonts/open-sans-v17-latin-ext_latin-regular.woff2";
import OpenSansBold from "./Assets/fonts/open-sans-v17-latin-ext_latin-700.woff2";
import OpenSansItalic from "./Assets/fonts/open-sans-v17-latin-ext_latin-italic.woff2";
import OpenSansBoldItalic from "./Assets/fonts/open-sans-v17-latin-ext_latin-700italic.woff2";
import localforage from "localforage";
import router from "./Components/router";

export const ThemeContext = createContext({
    toggleTheme: () => {
    }
});

function OpenSIST() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState(null);
    useEffect(() => {
        localforage.getItem('theme').then((theme) => {
            setMode(theme);
        });
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.style.setProperty('--scrollbar-color', 'rgba(155, 155, 155, 0.7)');
            root.style.setProperty('--bg-color', '#121212');
        } else {
            root.style.setProperty('--scrollbar-color', 'rgba(0, 0, 0, 0.5)');
            root.style.setProperty('--bg-color', '#fff');
        }
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
    };
    const theme = createTheme({
        palette: {
            mode: mode ?? (prefersDarkMode ? 'dark' : 'light'),
        },
        components: {
            MuiButtonBase: {
                defaultProps: {
                    disableRipple: true,
                }, styleOverrides: {
                    root: {
                        "&:active": {
                            transition: "transform 0.1s ease-in-out",
                            transform: "scale(0.98)",
                        },
                    },
                },
            },
            MuiButtonGroup: {
                defaultProps: {
                    disableRipple: true,
                },
            },
            MuiCssBaseline: {
                styleOverrides: `
            @font-face {
                font-family: 'Twemoji';
                src: url(${Twemoji}) format('truetype');
            },
            @font-face {
                font-family: 'Open Sans';
                font-style: normal;
                font-weight: normal;
                src: local('Open Sans Regular'), local('OpenSans-Regular'), url(${OpenSansRegular}) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            },
            @font-face {
                font-family: 'Open Sans';
                font-style: normal;
                font-weight: bold;
                src: local('Open Sans Bold'), local('OpenSans-Bold'), url(${OpenSansBold}) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            },
            @font-face {
                font-family: 'Open Sans';
                font-style: italic;
                font-weight: normal;
                src: local('Open Sans Italic'), local('OpenSans-Italic'), url(${OpenSansItalic}) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            },
            @font-face {
                font-family: 'Open Sans';
                font-style: italic;
                font-weight: bold;
                src: local('Open Sans Bold Italic'), local('OpenSans-BoldItalic'), url(${OpenSansBoldItalic}) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }
            `,
            },
        },
        typography: {
            fontFamily: [
                "Open Sans",
                "Clear Sans",
                "Helvetica Neue",
                'Helvetica, Arial',
                'Twemoji',
                'sans-serif',
            ].join(','),
        },
    });

    return (
        <React.StrictMode>
            <ThemeProvider theme={theme}>
                <ThemeContext.Provider value={{toggleTheme}}>
                    <RouterProvider router={router}/>
                </ThemeContext.Provider>
            </ThemeProvider>
        </React.StrictMode>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<OpenSIST/>);
