import {useNavigation} from "react-router-dom";
import React, {useRef, useState} from "react";
import {Backdrop, Box, Button, CircularProgress, Fab, styled, SwipeableDrawer, Tooltip, Typography, useMediaQuery} from "@mui/material";
import {ChevronRight} from "@mui/icons-material";
import Draggable from "react-draggable";

export function LoadingBackdrop({forceOpen = false} = {}) {
    const navigation = useNavigation()
    const loading = forceOpen || navigation.state !== 'idle';
    return (
        <Backdrop open={loading} sx={{zIndex: 99999}} transitionDuration={1000} style={{pointerEvents: "none"}}>
            <CircularProgress color="inherit"/>
        </Backdrop>
    )
}

export const InlineTypography = styled(Typography)(() => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: "wrap"
}));

export const BoldTypography = styled(Typography)(() => ({
    fontWeight: 'bold',
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
                        borderRadius: (smallPage ? '0 8px 8px 0' : '8px'),
                        border: 'none',
                        position: (smallPage ? 'absolute' : 'initial'),
                        top: '60px',
                        overflowY: 'auto',
                        // flat on desktop (no 3D card shadow); keep a shadow only for the
                        // mobile overlay drawer where it needs to lift off the page
                        boxShadow: (smallPage ? "0px 2px 8px rgba(0,0,0,0.18)" : 'none'),
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
                    zIndex: (smallPage ? 1200 : 1)
                }}
            >
                <ChevronRight/>
            </Button>
        </>
    )
}

export function DraggableFAB({Icon, DragThreshold, ActionType, ButtonClassName, color, onClick, style, tooltipTitle}) {
    const nodeRef = useRef(null);
    const buttonRef = useRef(null);
    const dragStartPositionXYRef = useRef({x: 0, y: 0});
    return (
        <>
            <Box style={{...style}}>
                <Draggable
                    nodeRef={nodeRef}
                    onStart={(event, data) => {
                        dragStartPositionXYRef.current = {x: data.x, y: data.y};
                    }}
                    onStop={(event, data) => {
                        const THRESHOLD = DragThreshold ?? 2;
                        const {x, y} = dragStartPositionXYRef.current ?? {x: 0, y: 0};
                        const wasDragged = Math.abs(data.x - x) > THRESHOLD || Math.abs(data.y - y) > THRESHOLD;
                        if (!wasDragged) {
                            event.preventDefault();
                            buttonRef.current?.click();
                        }
                    }}
                >
                    <Tooltip title={tooltipTitle} arrow enterTouchDelay={0}>
                        <Fab color={color} ref={nodeRef}>
                            {Icon}
                        </Fab>
                    </Tooltip>
                </Draggable>
            </Box>
            <button
                ref={buttonRef}
                onClick={onClick}
                type="submit" style={{display: "none"}}
                className={ButtonClassName} name="ActionType"
                value={ActionType}
            />
        </>
    )
}

export function OpenSIST({props, sx}) {
    return (
        <Typography {...props} sx={{fontFamily: 'Merriweather', ...sx}} component='span'>
            OpenSIST
        </Typography>
    )
}
