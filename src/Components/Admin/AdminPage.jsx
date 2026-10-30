import React, {useCallback, useState} from "react";
import {Alert, Box, Paper, Snackbar, Tab, Tabs, Typography} from "@mui/material";
import {AdminPanelSettingsRounded, EmailRounded, PeopleAltRounded, SchoolRounded} from "@mui/icons-material";
import {getIsAdmin} from "../../Data/UserData";
import AdminUsersTab from "./AdminUsersTab";
import AdminProgramsTab from "./AdminProgramsTab";
import AdminMailboxTab from "./AdminMailboxTab";

export async function loader() {
    let isAdmin = await getIsAdmin();
    if (!isAdmin) {
        isAdmin = await getIsAdmin(true);
    }
    if (!isAdmin) {
        throw new Response("", {
            status: 403,
            statusText: "Admin access not granted",
        });
    }
    return {isAdmin};
}

export default function AdminPage() {
    const [tab, setTab] = useState("users");
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const notify = useCallback((message, severity = "success") => {
        setToast({
            open: true,
            message,
            severity,
        });
    }, []);

    const handleCloseToast = (_, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setToast((prev) => ({...prev, open: false}));
    };

    return (
        <Paper
            elevation={0}
            sx={{
                flexGrow: 1,
                minWidth: 0,
                m: "10px",
                height: "calc(100vh - 80px)",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                bgcolor: (theme) => theme.palette.surface,
                p: {xs: 1.5, sm: 2.5},
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    borderBottom: 1,
                    borderColor: "divider",
                    pb: 1,
                    mb: 2,
                }}
            >
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                    <AdminPanelSettingsRounded color="primary"/>
                    <Typography variant="h5" sx={{fontWeight: 700}}>
                        管理员后台
                    </Typography>
                </Box>
                <Tabs
                    value={tab}
                    onChange={(_, nextValue) => setTab(nextValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{minHeight: 42}}
                >
                    <Tab
                        value="users"
                        icon={<PeopleAltRounded fontSize="small"/>}
                        iconPosition="start"
                        label="用户管理"
                        sx={{minHeight: 42}}
                    />
                    <Tab
                        value="programs"
                        icon={<SchoolRounded fontSize="small"/>}
                        iconPosition="start"
                        label="项目维护"
                        sx={{minHeight: 42}}
                    />
                    <Tab
                        value="mailbox"
                        icon={<EmailRounded fontSize="small"/>}
                        iconPosition="start"
                        label="管理员收件箱"
                        sx={{minHeight: 42}}
                    />
                </Tabs>
            </Box>

            <Box sx={{flex: 1, minHeight: 0, display: "flex", flexDirection: "column"}}>
                {tab === "users" ? <AdminUsersTab notify={notify}/> : null}
                {tab === "programs" ? <AdminProgramsTab notify={notify}/> : null}
                {tab === "mailbox" ? <AdminMailboxTab notify={notify}/> : null}
            </Box>

            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{width: "100%"}}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
}
