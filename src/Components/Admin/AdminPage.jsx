import {Box, Drawer, List, ListItem, ListItemButton, Typography} from "@mui/material";
import {Link, Outlet} from "react-router-dom";

export default function AdminPage() {
    const routerList = [
        {
            name: 'Program',
            path: '/admin/programs'
        }, {
            name: 'Email',
            path: '/admin/emails'
        },
    ]

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: "240px",
                    [`& .MuiDrawer-paper`]: {
                        mr: 'auto',
                        position: 'initial',
                    },
                }}
            >
                <List>
                    {routerList.map((item, index): React.ReactNode => (
                        <ListItem key={item.name}>
                            <ListItemButton key={index} component={Link} to={item.path}>
                                {item.name}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: "80%",
                    height: "calc(100vh - 60px)",
                    mx: "20px"
                }}
            >
                <Outlet/>
            </Box>
        </>
    )
}

export function AdminIndex() {
    return (
        <Box sx={{}}>
            <Typography variant={'body1'} sx={{color: 'red'}}>如果您不是OpenSIST的管理员，请</Typography>
            <Typography variant={'h1'} sx={{color: 'red'}}>拱出去</Typography>
        </Box>
    )
}