import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {BlockRounded, CheckCircleOutlineRounded, ClearRounded, RefreshRounded, SearchRounded} from "@mui/icons-material";
import {allowAdminUser, banAdminUser, extractApiError, fetchAdminUsers} from "../../Data/AdminData";

export default function AdminUsersTab({notify}) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pendingAction, setPendingAction] = useState(null);
    const [submittingUser, setSubmittingUser] = useState("");

    const refreshUsers = useCallback(async () => {
        setLoading(true);
        try {
            const list = await fetchAdminUsers();
            setUsers(list);
        } catch (err) {
            notify(extractApiError(err, "加载用户列表失败"), "error");
        } finally {
            setLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        let cancelled = false;
        fetchAdminUsers()
            .then((list) => {
                if (!cancelled) {
                    setUsers(list);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    notify(extractApiError(err, "加载用户列表失败"), "error");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [notify]);

    const counts = useMemo(() => {
        let anonymous = 0;
        let banned = 0;
        users.forEach((u) => {
            if (u.nickname) {
                anonymous += 1;
            }
            if (u.isBanned) {
                banned += 1;
            }
        });
        return {
            total: users.length,
            anonymous,
            banned,
        };
    }, [users]);

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return users.filter((u) => {
            if (statusFilter === "anonymous" && !u.nickname) {
                return false;
            }
            if (statusFilter === "banned" && !u.isBanned) {
                return false;
            }
            if (!keyword) {
                return true;
            }
            const matchUser = u.user.toLowerCase().includes(keyword);
            const matchNickname = (u.nickname ?? "").toLowerCase().includes(keyword);
            const matchEmail = (u.emails ?? []).some((e) => e.toLowerCase().includes(keyword));
            return matchUser || matchNickname || matchEmail;
        });
    }, [users, search, statusFilter]);

    const handleConfirmToggleBan = async () => {
        if (!pendingAction) {
            return;
        }
        const {user, nextBanned} = pendingAction;
        setSubmittingUser(user);
        try {
            if (nextBanned) {
                await banAdminUser(user);
                notify(`已封禁用户 ${user}`, "success");
            } else {
                await allowAdminUser(user);
                notify(`已解封用户 ${user}`, "success");
            }
            setUsers((prev) =>
                prev.map((item) => (item.user === user ? {...item, isBanned: nextBanned} : item)),
            );
            setPendingAction(null);
        } catch (err) {
            notify(extractApiError(err, "更新封禁状态失败"), "error");
        } finally {
            setSubmittingUser("");
        }
    };

    return (
        <Box sx={{flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 1.5}}>
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                }}
            >
                <TextField
                    size="small"
                    placeholder="搜索真实 user_id、匿名昵称或邮箱（支持双向反查）..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{flex: 1, minWidth: 260, maxWidth: 480}}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded fontSize="small" color="action"/>
                                </InputAdornment>
                            ),
                            endAdornment: search ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearch("")} aria-label="清空搜索">
                                        <ClearRounded fontSize="small"/>
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                />

                <Box sx={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1}}>
                    <Chip
                        label={`全部 (${counts.total})`}
                        color={statusFilter === "all" ? "primary" : "default"}
                        variant={statusFilter === "all" ? "filled" : "outlined"}
                        onClick={() => setStatusFilter("all")}
                    />
                    <Chip
                        label={`匿名中 (${counts.anonymous})`}
                        color={statusFilter === "anonymous" ? "primary" : "default"}
                        variant={statusFilter === "anonymous" ? "filled" : "outlined"}
                        onClick={() => setStatusFilter("anonymous")}
                    />
                    <Chip
                        label={`已封禁 (${counts.banned})`}
                        color={statusFilter === "banned" ? "error" : "default"}
                        variant={statusFilter === "banned" ? "filled" : "outlined"}
                        onClick={() => setStatusFilter("banned")}
                    />
                    <Tooltip title="刷新用户列表">
                        <span>
                            <IconButton onClick={refreshUsers} disabled={loading} size="small">
                                <RefreshRounded/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{flex: 1, minHeight: 0, overflow: "auto"}}
            >
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{fontWeight: 700}}>用户 ID</TableCell>
                            <TableCell sx={{fontWeight: 700}}>当前匿名昵称</TableCell>
                            <TableCell sx={{fontWeight: 700}}>注册邮箱</TableCell>
                            <TableCell sx={{fontWeight: 700}}>账号状态</TableCell>
                            <TableCell align="right" sx={{fontWeight: 700}}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{py: 6}}>
                                    <CircularProgress size={28}/>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{py: 6, color: "text.secondary"}}>
                                    没有匹配的用户记录
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((row) => (
                                <TableRow key={row.user} hover>
                                    <TableCell>
                                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                            <Typography variant="body2" sx={{fontWeight: 600, fontFamily: "monospace"}}>
                                                {row.user}
                                            </Typography>
                                            {row.isAdmin ? (
                                                <Chip label="Admin" size="small" color="info" variant="outlined"/>
                                            ) : null}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {row.nickname ? (
                                            <Chip label={row.nickname} size="small" color="secondary" variant="outlined"/>
                                        ) : (
                                            <Typography variant="body2" sx={{color: "text.secondary"}}>
                                                实名
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.emails.length > 0 ? (
                                            <Typography variant="body2" sx={{fontFamily: "monospace"}}>
                                                {row.emails.join(", ")}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" sx={{color: "text.secondary"}}>
                                                —
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {row.isBanned ? (
                                            <Chip label="已封禁" size="small" color="error"/>
                                        ) : (
                                            <Chip label="正常" size="small" color="success" variant="outlined"/>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row.isAdmin ? null : row.isBanned ? (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="success"
                                                startIcon={<CheckCircleOutlineRounded fontSize="small"/>}
                                                disabled={submittingUser === row.user}
                                                onClick={() => setPendingAction({user: row.user, nextBanned: false})}
                                            >
                                                解封
                                            </Button>
                                        ) : (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<BlockRounded fontSize="small"/>}
                                                disabled={submittingUser === row.user}
                                                onClick={() => setPendingAction({user: row.user, nextBanned: true})}
                                            >
                                                封禁
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={Boolean(pendingAction)}
                onClose={() => !submittingUser && setPendingAction(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {pendingAction?.nextBanned ? "确认封禁用户" : "确认解封用户"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {pendingAction?.nextBanned
                            ? `确定要封禁用户 "${pendingAction.user}" 吗？封禁后该账号（含在读与校友邮箱）将无法登录。`
                            : `确定要恢复用户 "${pendingAction?.user ?? ""}" 的登录权限吗？`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPendingAction(null)} disabled={Boolean(submittingUser)}>
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color={pendingAction?.nextBanned ? "error" : "success"}
                        onClick={handleConfirmToggleBan}
                        disabled={Boolean(submittingUser)}
                    >
                        {pendingAction?.nextBanned ? "确认封禁" : "确认解封"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
