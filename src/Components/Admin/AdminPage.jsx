import {Box, Drawer, List, ListItem, ListItemButton, Toolbar, Typography} from "@mui/material";
import {Link, Outlet} from "react-router-dom";

export default function AdminPage() {
    const routerList = [
        {
            name: 'Program',
            path: '/admin/programs'
        }, {
            name: 'Applicant',
            path: '/admin/applicants'
        }, {
            name: 'Record',
            path: '/admin/records'
        }, {
            name: 'Email',
            path: '/admin/emails'
        },
    ]

    return (
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {width: 240, boxSizing: 'border-box'},
                }}
            >
                <Toolbar/>
                <Box sx={{overflow: 'auto'}}>
                    <List>
                        {routerList.map((item, index) => (
                            <ListItem key={item.name}>
                                <ListItemButton key={index} component={Link} to={item.path}>
                                    {item.name}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: "80%",
                    height: "calc(100vh - 60px)"
                }}
            >
                <Outlet/>
            </Box>
        </Box>
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