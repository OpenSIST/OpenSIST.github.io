import {
    Avatar,
    Badge,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Input,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import "./ProfileSideBar.css";
import {Form, Link} from "react-router-dom";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import {ConnectWithoutContact, Edit, Refresh, HomeRounded, LinkedIn, Link as LinkIcon, Mail} from "@mui/icons-material";
import {blue, grey} from "@mui/material/colors";
import {CollapseSideBar} from "../../common";
import React, {useState} from "react";
import Grid2 from "@mui/material/Unstable_Grid2";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQq, faWeixin} from "@fortawesome/free-brands-svg-icons";

export function ProfileSideBar({loaderData}) {
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
                '& .MuiDrawer-paper': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[900] : grey[50],
                    width: '250px',
                    height: 'calc(100vh - 120px)',
                    p: '20px',
                    mt: '10px'
                },
            }}
        >
            <Box className="ProfileSideBar">
                <Badge
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
                                            const file = e.target.files[0];
                                            if (file.size > 4 * 1024 * 1024) {
                                                alert("图片大小不能超过4MB!");
                                                return;
                                            }
                                            if (!(/^[\x00-\x7F]*$/.test(file.name))) {
                                                alert("图片文件名不能包含中文!");
                                                return;
                                            }
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
                <Form method='post' style={{position: 'absolute', right: '10px'}}>
                    <Tooltip title='刷新侧边栏信息' arrow>
                        <IconButton type='submit' variant="outlined" name='button' value='Refresh' >
                            <Refresh fontSize='large'/>
                        </IconButton>
                    </Tooltip>
                </Form>
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
                <List>
                    {applicants.map((applicant) => (
                        <ListItem key={applicant}>
                            <ListItemButton component={Link} to={`/profile/${applicant}`} sx={{justifyContent: 'center'}}>
                                <PersonOutlineIcon/> {applicant}
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem>
                        <ListItemButton component={Link} to="/profile/new-applicant" sx={{justifyContent: 'center'}}>
                            <PersonAddAltIcon/> 添加申请人
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton onClick={() => setEditContactOpen(true)} sx={{justifyContent: 'center'}}>
                            <ConnectWithoutContact/> 编辑个人联系方式
                        </ListItemButton>
                    </ListItem>
                </List>
                <Dialog open={editContactOpen} onClose={() => {
                    setEditContactOpen(false)
                }}>
                    <DialogTitle>编辑个人联系方式</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            可填写下方任何联系方式：
                        </DialogContentText>
                        <Grid2 container spacing={2}>
                            <Grid2 container xs={12}>
                                <ContactField field='HomePage' label='个人主页' icon={<HomeRounded/>} contact={contact}
                                              setContact={setContact}/>
                                <ContactField field='Email' label='邮箱' icon={<Mail/>} contact={contact}
                                              setContact={setContact}/>
                                <ContactField label='LinkedIn' field='LinkedIn' icon={<LinkedIn/>} contact={contact}
                                              setContact={setContact}/>
                                <ContactField label='QQ' field='QQ' icon={<FontAwesomeIcon icon={faQq}/>} contact={contact}
                                              setContact={setContact}/>
                                <ContactField label='WeChat' field='WeChat' icon={<FontAwesomeIcon icon={faWeixin}/>} contact={contact}
                                              setContact={setContact}/>
                                <ContactField label='其他外部链接' field='OtherLink' icon={<LinkIcon/>} contact={contact}
                                              setContact={setContact}/>
                            </Grid2>
                        </Grid2>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setEditContactOpen(false);
                        }}>
                            取消
                        </Button>
                        <Form method='post'>
                            <Button color='success' type='submit' name='button' value="EditContact"
                                    onClick={() => {
                                        setEditContactOpen(false);
                                    }}
                            >
                                确定
                            </Button>
                            <Input value={JSON.stringify(contact)} name='contact' type="hidden"/>
                        </Form>
                    </DialogActions>
                </Dialog>
            </Box>
        </CollapseSideBar>
    )
}

function ContactField({field, label, icon, contact, setContact}) {
    return (
        <>
            <Grid2 xs={1} sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {icon}
            </Grid2>
            <Grid2 xs={11}>
                <TextField
                    margin="dense"
                    label={label}
                    size='small'
                    fullWidth
                    value={contact[field] ?? ""}
                    onChange={(e) => {
                        setContact(() => {
                            if (e.target.value.length > 0) {
                                return {...contact, [field]: e.target.value};
                            } else {
                                const newContact = {...contact};
                                delete newContact[field];
                                return newContact;
                            }
                        });
                    }}
                />
            </Grid2>
        </>
    );
}