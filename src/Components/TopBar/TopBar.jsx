import React from 'react';
import './TopBar.css';
import {StatusBlock} from "./StatusBlock/StatusBlock";
import NavBar from "./NavBar/NavBar";
import {useNavigate} from "react-router-dom";
import {AppBar, Box, Toolbar, Typography} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';


function TopBar() {
    const navigate = useNavigate();
    return (
        <Box>
            <AppBar position='static' className="TopBarBlock"
                    elevation={1}
                    sx={{
                        backgroundColor: "var(--bg-color)",
                        color: "var(--color)",
                        display: "block"
                    }}>
                <Toolbar className="TopBar">
                    <div className="IconBlock" onClick={() => navigate("/")}>
                        <MenuIcon/>
                        <Typography sx={{cursor: 'pointer'}} variant="h5">OpenSIST</Typography>
                    </div>
                    <NavBar/>
                    <StatusBlock/>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default TopBar;