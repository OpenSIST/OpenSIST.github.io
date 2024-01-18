import {Box, Drawer, List, ListItem, ListItemButton, Toolbar} from "@mui/material";
import {Link, Outlet} from "react-router-dom";
export default function AdminPage() {
    const routerList = [
        {
            name: 'Program',
            path: '/admin/programs'
        },
        {
            name: 'Applicant',
            path: '/admin/applicants'
        },
        {
            name: 'Record',
            path: '/admin/records'
        }
    ]

    return (
        <Box sx={{display: 'flex'}}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
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
            <Outlet/>
        </Box>
    )
}