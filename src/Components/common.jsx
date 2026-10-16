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

export function CollapseSideBar({children, sx = {}, label = "浏览列表"}) {
    const smallPage = useSmallPage();
    const [open, setOpen] = useState(false)
    return (
        <>
            <SwipeableDrawer
                variant={smallPage ? "temporary" : "persistent"}
                open={!smallPage || (smallPage && open)}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                elevation={0}
                sx={{
                    display: "flex",
                    width: 'auto',
                    height: 'auto',
                    zIndex: (smallPage ? 1201 : 1),
                    ...sx,
                    '& .MuiDrawer-paper': {
                        borderRadius: (smallPage ? '0 18px 18px 0' : '12px'),
                        border: 'none',
                        backgroundImage: 'none',
                        position: (smallPage ? 'absolute' : 'initial'),
                        top: '60px',
                        overflowY: 'auto',
                        // flat on desktop (no 3D card shadow); on the mobile overlay
                        // drawer use a soft modern shadow to lift it off the page
                        boxShadow: (smallPage ? "0 12px 40px rgba(16,24,40,0.22)" : 'none'),
                        ...(sx['& .MuiDrawer-paper'] ?? {}),
                        ...(smallPage ? {boxSizing: 'border-box', width: 'min(340px, 90vw)', height: 'calc(100dvh - 60px)', mt: 0} : {})
                    },
                }}
            >
                {smallPage && <Button onClick={() => setOpen(false)} sx={{minHeight: 44}}>关闭列表</Button>}
                <Box sx={{display: 'contents'}} onClick={(event) => {
                    if (smallPage && event.target.closest('a[href]')) setOpen(false);
                }}>{children}</Box>
            </SwipeableDrawer>
            <Button
                className="ShowUpButton"
                onClick={() => setOpen(!open)}
                disableRipple
                sx={{
                    position: 'fixed',
                    top: 'auto',
                    bottom: 'max(16px, env(safe-area-inset-bottom))',
                    left: 12,

                    visibility: smallPage ? 'visible' : 'hidden',
                    minWidth: 0,
                    px: 2,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: (theme) => theme.palette.surface,
                    color: 'primary.main',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderLeft: 'none',
                    boxShadow: '0 4px 16px rgba(16,24,40,0.18)',
                    transition: 'background-color 0.15s ease, padding-left 0.15s ease',
                    '&:hover': {
                        bgcolor: (theme) => theme.palette.surfaceVariant,
                    },
                    zIndex: (smallPage ? 1200 : 1)
                }}
            >
                <ChevronRight fontSize="small"/>{label}
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
