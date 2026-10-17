import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
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
import {LoadingBackdrop} from "./Components/common";

export const ThemeContext = createContext({
    toggleTheme: () => {
    }
});

function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState(null);
    const activeMode = mode ?? (prefersDarkMode ? 'dark' : 'light');
    useEffect(() => {
        let mounted = true;
        localforage.getItem('theme').then((theme) => {
            if (mounted && theme) {
                setMode(theme);
            }
        });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (activeMode === 'dark') {
            root.style.setProperty('--scrollbar-color', 'rgba(155, 155, 155, 0.7)');
            root.style.setProperty('--bg-color', '#1A1A1A');
            root.style.setProperty('--link-color', '#90CAF9');
        } else {
            root.style.setProperty('--scrollbar-color', 'rgba(0, 0, 0, 0.5)');
            root.style.setProperty('--bg-color', '#FAFAFA');
            root.style.setProperty('--link-color', '#4183C4');
        }
    }, [activeMode]);

    const toggleTheme = useCallback(() => {
        const nextMode = activeMode === 'dark' ? 'light' : 'dark';
        setMode(nextMode);
        localforage.setItem('theme', nextMode);
    }, [activeMode]);
    const theme = useMemo(() => createTheme({
        palette: {
            mode: activeMode,
            contrastThreshold: 3,
            secondary: {
                main: activeMode === 'dark' ? '#AAAAAA' : '#666666',
                contrastText: activeMode === 'dark' ? '#1A1A1A' : '#ffffff',
            },
            background: {
                default: activeMode === 'dark' ? '#1A1A1A' : '#FAFAFA',
                paper: activeMode === 'dark' ? '#242424' : '#FFFFFF',
            },
            text: {
                primary: activeMode === 'dark' ? '#EEEEEE' : '#222222',
                secondary: activeMode === 'dark' ? '#AAAAAA' : '#666666',
            },
            divider: activeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
            // Neutral surfaces shared by tables, forms, and sidebars.
            surface: activeMode === 'dark' ? '#242424' : '#FFFFFF',
            surfaceVariant: activeMode === 'dark' ? '#303030' : '#F0F0F0',
            reject: {
                main: activeMode === 'dark' ? '#FF375F' : '#FF2D55',
                contrastText: '#ffffffde',
            }, admit: {
                main: activeMode === 'dark' ? '#30D158' : '#34C759',
                contrastText: '#ffffffde',
            }, defer: {
                main: activeMode === 'dark' ? '#FF9F0A' : '#FF9500',
                contrastText: '#ffffffde',
            }, spring: {
                main: activeMode === 'dark' ? '#12CCA4' : '#00C59B',
                contrastText: '#ffffffde',
            }, fall: {
                main: activeMode === 'dark' ? '#FE892E' : '#FE801E',
                contrastText: '#ffffffde',
            }, neutral: {
                main: activeMode === 'dark' ? '#414041' : '#eaeaea',
                contrastText: activeMode === 'dark' ? '#ffffffde' : '#000000de',
            }, default: {
                main: activeMode === 'dark' ? '#ffffffde' : '#000000de',
                contrastText: '#ffffffde',
            }
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
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
            h1: {fontWeight: 600, letterSpacing: '-0.02em'},
            h2: {fontWeight: 600, letterSpacing: '-0.01em'},
            h3: {fontWeight: 600, letterSpacing: '-0.01em'},
            h4: {fontWeight: 600},
            h5: {fontWeight: 600},
            h6: {fontWeight: 600},
            button: {fontWeight: 600},
        },
    }), [activeMode]);
    const themeContextValue = useMemo(() => ({toggleTheme}), [toggleTheme]);

    return (
        <React.StrictMode>
            <ThemeProvider theme={theme}>
                <ThemeContext.Provider value={themeContextValue}>
                    <RouterProvider router={router} fallbackElement={<LoadingBackdrop forceOpen/>}/>
                </ThemeContext.Provider>
            </ThemeProvider>
        </React.StrictMode>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
