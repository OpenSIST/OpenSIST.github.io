import {
    Avatar, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel,
    IconButton, InputLabel,
    List,
    ListItem,
    ListItemButton,
    Paper, Switch, TextField,
    Typography,
} from "@mui/material";
import "./ProfileHeader.css";
import {Form, Link} from "react-router-dom";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import {ConnectWithoutContact, Edit} from "@mui/icons-material";
import {blue} from "@mui/material/colors";
import {CollapseSideBar} from "../../common";
import {useState} from "react";

export function ProfileHeader({loaderData}) {
    const applicants = loaderData.metaData.ApplicantIDs;
    const avatar = loaderData.avatarUrl;
    const displayName = loaderData.displayName;
    const user = loaderData.user;
    const userContact = loaderData.metaData.Contact;
    const [anonymous, setAnonymous] = useState(displayName !== user);
    const [anonymousOpen, setAnonymousOpen] = useState(false);
    const [editContactOpen, setEditContactOpen] = useState(false);
    const [contact, setContact] = useState(userContact);
    return (
        <CollapseSideBar
            sx={{
                width: '300px',
                '& .MuiDrawer-paper': {
                    width: '300px',
                    boxShadow: 'none'
                },
            }}
        >
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
                <Typography variant='h4'>{displayName}</Typography>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <InputLabel>匿名:</InputLabel>
                    <Switch checked={anonymous} onClick={() => {
                        setAnonymous(!anonymous);
                        setAnonymousOpen(true);
                    }}/>
                    <Dialog open={anonymousOpen} onClose={() => {
                        setAnonymous(!anonymous);
                        setAnonymousOpen(false)
                    }}>
                        <DialogTitle>是否要更改申请人为{anonymous ? "匿名" : "实名"}状态？</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {anonymous ?
                                    "更改申请人为匿名状态后，其他用户将只能看到通过系统生成的伪名。"
                                    :
                                    "更改申请人为实名状态后，其他用户将能够看到您的真实姓名。"
                                }
                            </DialogContentText>
                            <DialogContentText>
                                一旦用户匿名状态发生更新，除此设备外的其他设备的登陆状态将失效，需要重新登陆！
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                setAnonymous(!anonymous);
                                setAnonymousOpen(false);
                            }}>
                                取消
                            </Button>
                            <Form method='post'>
                                <Button color='error' type='submit' name='button' value='ToggleAnonymous'
                                        onClick={() => {
                                            setAnonymousOpen(false);
                                        }}
                                >
                                    确定
                                </Button>
                            </Form>
                        </DialogActions>
                    </Dialog>
                </Box>
                <Typography
                    variant='h6'>{applicants.length} {applicants.length > 1 ? 'Applicants' : 'Applicant'}</Typography>
                <List>
                    {applicants.map((applicant) => (
                        <ListItem key={applicant}>
                            <ListItemButton component={Link} to={`/profile/${applicant}`} sx={{justifyContent: 'center'}}>
                                <PersonOutlineIcon/> {applicant}
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem>
                        <ListItemButton onClick={() => setEditContactOpen(true)} sx={{justifyContent: 'center'}}>
                            <ConnectWithoutContact/> 编辑个人联系方式
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton component={Link} to="/profile/new-applicant" sx={{justifyContent: 'center'}}>
                            <PersonAddAltIcon/> 添加申请人
                        </ListItemButton>
                    </ListItem>
                </List>
                <Dialog open={editContactOpen} onClose={() => {
                    setEditContactOpen(false)
                }}>
                    <DialogTitle>编辑个人联系方式</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            可以输入您的个人主页、LinkedIn、QQ、微信等。
                        </DialogContentText>
                        <TextField
                            margin="dense"
                            label="联系方式"
                            size='small'
                            fullWidth
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setEditContactOpen(false);
                        }}>
                            取消
                        </Button>
                        <Form method='post'>
                            <Button color='success' type='submit' name='contact' value={contact}
                                    onClick={() => {
                                        setEditContactOpen(false);
                                    }}
                            >
                                确定
                            </Button>
                        </Form>
                    </DialogActions>
                </Dialog>
            </Paper>
        </CollapseSideBar>
    )
}