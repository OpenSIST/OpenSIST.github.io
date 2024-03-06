import {useNavigation} from "react-router-dom";
import React, {useState} from "react";
import {Backdrop, Button, CircularProgress, styled, SwipeableDrawer, Typography, useMediaQuery} from "@mui/material";
import {ChevronRight} from "@mui/icons-material";

export function isEmptyObject(value) {
    return value === '' || value.length === 0;
}

export function LoadingBackdrop() {
    const navigation = useNavigation()
    const loading = navigation.state !== 'idle';
    // const loading = navigation.state === 'loading';
    return (
        <Backdrop open={loading} sx={{zIndex: 99999}} transitionDuration={1000}>
            <CircularProgress color="inherit"/>
        </Backdrop>
    )
}

export const InlineTypography = styled(Typography)(() => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: "wrap"
}));

export function useSmallPage() {
    return useMediaQuery('(max-width:900px)');
}

export function CollapseSideBar({children, sx}) {
    const smallPage = useSmallPage();
    const [open, setOpen] = useState(false)
    return (
        <>
            <SwipeableDrawer
                variant={smallPage ? "temporary" : "persistent"}
                open={!smallPage || (smallPage && open)}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                elevation={1}
                sx={{
                    display: "flex",
                    width: 'auto',
                    height: 'auto',
                    zIndex: (smallPage ? 1201 : 1),
                    ...sx,
                    '& .MuiDrawer-paper': {
                        border: 'none',
                        position: (smallPage ? 'absolute' : 'initial'),
                        top: '60px',
                        borderRadius: '5px',
                        overflowY: 'auto',
                        boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);",
                        ...(sx['& .MuiDrawer-paper'] ?? {})
                    },
                }}
            >
                {children}
            </SwipeableDrawer>
            <Button
                className="ShowUpButton"
                variant="contained"
                onClick={() => setOpen(!open)}
                sx={{
                    position: 'absolute',
                    visibility: smallPage ? 'visible' : 'hidden',
                    minWidth: "0",
                    px: "1vw",
                    width: "20px",
                    height: "80px",
                    borderRadius: "0 10px 10px 0",
                }}
            >
                <ChevronRight/>
            </Button>
        </>
    )
}
