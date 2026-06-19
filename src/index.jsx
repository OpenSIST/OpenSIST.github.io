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
            root.style.setProperty('--bg-color', '#0F1318');
            root.style.setProperty('--link-color', '#6BA6E8');
        } else {
            root.style.setProperty('--scrollbar-color', 'rgba(0, 0, 0, 0.5)');
            root.style.setProperty('--bg-color', '#E8EDF5');
            root.style.setProperty('--link-color', '#1C5BAA');
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
            primary: {
                main: activeMode === 'dark' ? '#6BA6E8' : '#1C5BAA',
                light: activeMode === 'dark' ? '#93C0F2' : '#5189C9',
                dark: activeMode === 'dark' ? '#4F86CE' : '#14457F',
                contrastText: activeMode === 'dark' ? '#0B1B2E' : '#ffffff',
            },
            secondary: {
                main: activeMode === 'dark' ? '#9AA4B2' : '#55606C',
                contrastText: activeMode === 'dark' ? '#0B1B2E' : '#ffffff',
            },
            background: {
                default: activeMode === 'dark' ? '#0F1318' : '#E2E8F2',
                paper: activeMode === 'dark' ? '#181D25' : '#ECF1F9',
            },
            text: {
                primary: activeMode === 'dark' ? '#E7EBF1' : '#1A2027',
                secondary: activeMode === 'dark' ? '#97A1AF' : '#55606C',
            },
            divider: activeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
            // App-level surface tiers. Light mode is a soft blue-tinted off-white family
            // (never pure #fff — it reads as glaring); tiers are distinguished by gentle
            // tone shifts, not borders. surface = panels/content; surfaceVariant = flat
            // filled controls/cards sitting on a surface.
            surface: activeMode === 'dark' ? '#161B22' : '#ECF1F9',
            surfaceVariant: activeMode === 'dark' ? '#1F2630' : '#E6EDF6',
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
