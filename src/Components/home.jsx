import TopBar from "./TopBar/TopBar";
import {Outlet} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {LoadingBackdrop} from "./common";
import {Box, Paper, Typography} from "@mui/material";
import {init_map} from "./WorldMap/display";
import MarkDownPage from "./MarkDownPage/MarkDownPage";

function Home() {
    return (
        <Paper elevation={0}>
            <TopBar/>
            <Paper
                className="ContentBlock"
                elevation={0}
            >
                <Outlet/>
            </Paper>
            <LoadingBackdrop/>
        </Paper>
    );
}

export function HomeIndex() {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return (
        <Box
            sx={{
                bgcolor: "#1A1E24",
                height: "100%",
                width: "100%",
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <WorldMap width={width} height={height} style={{position: 'relative'}}/>
            <Typography sx={{position: 'absolute'}}> This is a world map</Typography>
            {/*<MarkDownPage sx={{position: 'absolute'}}/>*/}
        </Box>
    )
}

function WorldMap({width, height, style}) {
    const canvasRef = useRef(null);
    useEffect(() => {
        let map_width = Math.min(width, 1700);
        let map_height = height - 60;
        if (map_width > map_height * 1.75) {
            map_width = map_height * 1.75;
        } else {
            map_height = map_width / 1.75;
        }
        init_map(canvasRef.current, map_width, map_height);
    }, [width, height]);
    return (
        <canvas ref={canvasRef} width={width} height={height} style={{overflow: "auto", ...style}}/>
    )
}

export default Home;
