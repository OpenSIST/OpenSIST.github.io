import {Avatar, Drawer, List, ListItem, ListItemButton, Paper, SwipeableDrawer, Typography} from "@mui/material";
import {useUser} from "../../../Data/UserData";
import "./ProfileHeader.css";
import {Link} from "react-router-dom";
import {useState} from "react";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

export function ProfileHeader({loaderData}) {
    const applicants = loaderData.applicants;
    const user = useUser();
    const [open, setOpen] = useState(true);
    return (
        <SwipeableDrawer
            variant="persistent"
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            sx={{
                width: '300px',
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    position: 'absolute',
                    width: '300px',
                    boxSizing: 'border-box',
                },
            }}>
            <Paper className="ProfileHeader">
                <Avatar sx={{height: '100px', width: '100px'}}/>
                <Typography variant='h4'>{user}</Typography>
                <Typography variant='h6'>{applicants.length} {applicants.length > 1 ? 'Applicants' : 'Applicant'}</Typography>
                <List>
                    {applicants.map((applicant) => (
                        <ListItem key={applicant}>
                            <ListItemButton component={Link} to={`/profile/${applicant}`}>
                                <PersonOutlineIcon/> {applicant}
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem>
                        <ListItemButton component={Link} to="/profile/new-applicant">
                            <PersonAddAltIcon/> 添加申请人
                        </ListItemButton>
                    </ListItem>
                </List>
            </Paper>
        </SwipeableDrawer>
    )
}