import {
    Avatar, Badge, Button,
    IconButton, Input,
    List,
    ListItem,
    ListItemButton,
    Paper,
    SwipeableDrawer,
    Typography
} from "@mui/material";
import {useUser} from "../../../Data/UserData";
import "./ProfileHeader.css";
import {Form, Link} from "react-router-dom";
import {useState} from "react";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import {Edit} from "@mui/icons-material";
import {blue} from "@mui/material/colors";

export function ProfileHeader({loaderData}) {
    const applicants = loaderData.metaData.ApplicantIDs;
    const avatar = loaderData.avatarUrl;
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
                <Badge
                    className="ProfileHeaderAvatarBadge"
                    badgeContent={
                        <Form method="post" encType="multipart/form-data">
                            <IconButton
                                component='label'
                                sx={{
                                    bgcolor: (theme) => theme.mode === 'dark' ? blue[200] : blue[600],
                                    "&:hover": {
                                        bgcolor: (theme) => theme.mode === 'dark' ? blue[300] : blue[500],
                                    }
                                }}
                            >
                                <Edit/>
                                <input
                                    accept="image/*"
                                    name='avatar'
                                    hidden
                                    type='file'
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            document.querySelector("button[type='submit']").click();
                                        }
                                    }}
                                />
                            </IconButton>
                            <button type='submit' name='button' value='EditAvatar' hidden>submit</button>
                        </Form>
                    }
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    overlap='circular'
                >
                    <Avatar src={avatar} sx={{height: '100px', width: '100px'}}/>
                </Badge>
                <Typography variant='h4'>{user}</Typography>
                <Typography
                    variant='h6'>{applicants.length} {applicants.length > 1 ? 'Applicants' : 'Applicant'}</Typography>
                <List>
                    {applicants.map((applicant) => (
                        <ListItem key={applicant}>
                            <ListItemButton component={Link} to={`/profile/${applicant}`}>
                                <PersonOutlineIcon/> {applicant}
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem>
                        <ListItemButton component={Link} to="/profile/new-applicant" sx={{justifyContent: 'center'}}>
                            <PersonAddAltIcon/> 添加申请人
                        </ListItemButton>
                    </ListItem>
                </List>
            </Paper>
        </SwipeableDrawer>
    )
}