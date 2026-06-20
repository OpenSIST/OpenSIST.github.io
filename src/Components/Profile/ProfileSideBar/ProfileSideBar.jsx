import {
    Avatar,
    Badge,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Input,
    Paper,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import "./ProfileSideBar.css";
import {Form, Link, useParams} from "react-router-dom";
import {Add, ConnectWithoutContact, Edit, HomeRounded, Link as LinkIcon, LinkedIn, Mail, Refresh} from "@mui/icons-material";
import React, {useRef, useState} from "react";
import Grid2 from "@mui/material/Grid";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQq, faWeixin} from "@fortawesome/free-brands-svg-icons";
import {decodePathParam, profileApplicantPath} from "../../RouteUtils";

const CONTACT_META = {
    HomePage: {label: "个人主页", icon: <HomeRounded fontSize="small"/>, href: (v) => v},
    Email: {label: "邮箱", icon: <Mail fontSize="small"/>, href: (v) => `mailto:${v}`},
    LinkedIn: {label: "LinkedIn", icon: <LinkedIn fontSize="small"/>, href: (v) => v},
    QQ: {label: "QQ", icon: <FontAwesomeIcon icon={faQq}/>, href: null},
    WeChat: {label: "WeChat", icon: <FontAwesomeIcon icon={faWeixin}/>, href: null},
    OtherLink: {label: "其他链接", icon: <LinkIcon fontSize="small"/>, href: (v) => v},
};

export function ProfileHeader({loaderData}) {
    const applicants = loaderData.metadata.ApplicantIDs;
    const avatar = loaderData.avatarUrl;
    const displayName = loaderData.displayName;
    const user = loaderData.user;
    const userContact = loaderData.metadata.Contact ?? {};
    const avatarFormRef = useRef(null);
    const anonymous = displayName !== user;
    const [anonymousOpen, setAnonymousOpen] = useState(false);
    const [editContactOpen, setEditContactOpen] = useState(false);
    const [contact, setContact] = useState(userContact);

    const currentApplicant = decodePathParam(useParams().applicantId);
    const contactEntries = Object.entries(CONTACT_META).filter(([field]) => userContact[field]);

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
            <Paper
                elevation={0}
                sx={{
                    bgcolor: (theme) => theme.palette.surface,
                    borderRadius: 3,
                    p: {xs: 2, sm: 2.5},
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Badge
                    sx={{"& .MuiBadge-badge": {bgcolor: "transparent", p: 0}}}
                    badgeContent={
                        <Form ref={avatarFormRef} method="post" encType="multipart/form-data">
                            <Tooltip title="更换头像" arrow>
                                <IconButton
                                    component="label"
                                    size="small"
                                    sx={{
                                        width: 26,
                                        height: 26,
                                        bgcolor: (theme) => theme.palette.primary.main,
                                        color: (theme) => theme.palette.primary.contrastText,
                                        boxShadow: 1,
                                        "&:hover": {bgcolor: (theme) => theme.palette.primary.dark},
                                    }}
                                >
                                    <Edit sx={{fontSize: 15}}/>
                                    <input
                                        accept="image/*"
                                        name="avatar"
                                        hidden
                                        type="file"
                                        onChange={(e) => {
                                            if (e.target.files.length > 0) {
                                                const file = e.target.files[0];
                                                if (file.size > 4 * 1024 * 1024) {
                                                    alert("图片大小不能超过4MB!");
                                                    return;
                                                }
                                                if (!/^[a-zA-Z0-9_\-. ]+$/.test(file.name)) {
                                                    alert("图片文件名不能包含中文!");
                                                    return;
                                                }
                                                avatarFormRef.current?.requestSubmit();
                                            }
                                        }}
                                    />
                                </IconButton>
                            </Tooltip>
                            <button type="submit" name="button" value="EditAvatar" hidden>submit</button>
                        </Form>
                    }
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                    overlap="circular"
                >
                    <Avatar src={avatar} sx={{height: 64, width: 64}}/>
                </Badge>

                <Box sx={{flex: 1, minWidth: 180}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap"}}>
                        <Typography variant="h6" sx={{fontWeight: 600, lineHeight: 1.2}}>{displayName}</Typography>
                        <FormControlLabel
                            sx={{m: 0}}
                            control={<Switch size="small" checked={!anonymous} onChange={() => setAnonymousOpen(true)}/>}
                            label={<Typography variant="body2" sx={{color: "text.secondary"}}>实名展示</Typography>}
                        />
                    </Box>
                    <Box sx={{display: "flex", alignItems: "center", gap: 0.25, mt: 0.5, flexWrap: "wrap"}}>
                        {contactEntries.length > 0 ? contactEntries.map(([field, meta]) => {
                            const value = userContact[field];
                            const rawHref = meta.href ? meta.href(value) : "";
                            const safeHref = rawHref && (rawHref.startsWith("mailto:") || /^https?:\/\//i.test(rawHref)) ? rawHref : "";
                            const linkProps = safeHref
                                ? {component: "a", href: safeHref, target: "_blank", rel: "noopener noreferrer"}
                                : {};
                            return (
                                <Tooltip key={field} title={`${meta.label}: ${value}`} arrow>
                                    <IconButton size="small" sx={{color: "text.secondary"}} {...linkProps}>
                                        {meta.icon}
                                    </IconButton>
                                </Tooltip>
                            );
                        }) : (
                            <Typography variant="caption" sx={{color: "text.secondary"}}>暂未填写联系方式</Typography>
                        )}
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ConnectWithoutContact/>}
                    onClick={() => {
                        setContact(userContact);
                        setEditContactOpen(true);
                    }}
                    sx={{whiteSpace: "nowrap", flexShrink: 0}}
                >
                    联系方式
                </Button>
                <Form method="post">
                    <Tooltip title="刷新信息" arrow>
                        <IconButton type="submit" name="button" value="Refresh" sx={{color: "text.secondary"}}>
                            <Refresh/>
                        </IconButton>
                    </Tooltip>
                </Form>
            </Paper>

            <Box sx={{display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap"}}>
                <Typography variant="caption" sx={{color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em", mr: 0.5}}>
                    申请人
                </Typography>
                {applicants.map((applicant) => {
                    const active = applicant === currentApplicant;
                    return (
                        <Chip
                            key={applicant}
                            label={applicant}
                            clickable
                            component={Link}
                            to={profileApplicantPath(applicant)}
                            color={active ? "primary" : "default"}
                            variant={active ? "filled" : "outlined"}
                            sx={{fontWeight: active ? 600 : 400}}
                        />
                    );
                })}
                <Chip
                    icon={<Add/>}
                    label="添加申请人"
                    clickable
                    component={Link}
                    to="/profile/new-applicant"
                    variant="outlined"
                    sx={{
                        borderStyle: "dashed",
                        color: "text.secondary",
                    }}
                />
            </Box>

            <Dialog open={anonymousOpen} onClose={() => setAnonymousOpen(false)}>
                <DialogTitle>是否要更改申请人为{anonymous ? "实名" : "匿名"}状态？</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {anonymous
                            ? "更改申请人为实名状态后，其他用户将能够看到您的真实姓名。"
                            : "更改申请人为匿名状态后，其他用户将只能看到通过系统生成的伪名。"}
                    </DialogContentText>
                    <DialogContentText>
                        一旦用户匿名状态发生更新，除此设备外的其他设备的登陆状态将失效，需要重新登陆！
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnonymousOpen(false)}>取消</Button>
                    <Form method="post">
                        <Button color="error" type="submit" name="button" value="ToggleAnonymous" onClick={() => setAnonymousOpen(false)}>
                            确定
                        </Button>
                    </Form>
                </DialogActions>
            </Dialog>

            <Dialog open={editContactOpen} onClose={() => setEditContactOpen(false)}>
                <DialogTitle>编辑个人联系方式</DialogTitle>
                <DialogContent>
                    <DialogContentText>可填写下方任何联系方式：</DialogContentText>
                    <Grid2 container spacing={2}>
                        <Grid2 container size={12}>
                            <ContactField field="HomePage" label="个人主页" icon={<HomeRounded/>} contact={contact} setContact={setContact}/>
                            <ContactField field="Email" label="邮箱" icon={<Mail/>} contact={contact} setContact={setContact}/>
                            <ContactField label="LinkedIn" field="LinkedIn" icon={<LinkedIn/>} contact={contact} setContact={setContact}/>
                            <ContactField label="QQ" field="QQ" icon={<FontAwesomeIcon icon={faQq}/>} contact={contact} setContact={setContact}/>
                            <ContactField label="WeChat" field="WeChat" icon={<FontAwesomeIcon icon={faWeixin}/>} contact={contact} setContact={setContact}/>
                            <ContactField label="其他外部链接" field="OtherLink" icon={<LinkIcon/>} contact={contact} setContact={setContact}/>
                        </Grid2>
                    </Grid2>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditContactOpen(false)}>取消</Button>
                    <Form method="post">
                        <Button color="success" type="submit" name="button" value="EditContact" onClick={() => setEditContactOpen(false)}>
                            确定
                        </Button>
                        <Input value={JSON.stringify(contact)} name="contact" type="hidden"/>
                    </Form>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function ContactField({field, label, icon, contact, setContact}) {
    return (
        <>
            <Grid2 sx={{display: "flex", alignItems: "center", justifyContent: "center"}} size={1}>
                {icon}
            </Grid2>
            <Grid2 size={11}>
                <TextField
                    margin="dense"
                    label={label}
                    size="small"
                    fullWidth
                    value={contact[field] ?? ""}
                    onChange={(e) => {
                        setContact((currentContact) => {
                            if (e.target.value.length > 0) {
                                return {...currentContact, [field]: e.target.value};
                            }
                            const newContact = {...currentContact};
                            delete newContact[field];
                            return newContact;
                        });
                    }}
                />
            </Grid2>
        </>
    );
}
