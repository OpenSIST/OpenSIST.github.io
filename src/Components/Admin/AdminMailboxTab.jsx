import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    AttachFileRounded,
    ClearRounded,
    DeleteForeverRounded,
    DeleteOutlineRounded,
    InboxRounded,
    RefreshRounded,
    RestoreFromTrashRounded,
    SearchRounded,
} from "@mui/icons-material";
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
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    extractApiError,
    fetchMailboxMessages,
    fetchMessageDetail,
    moveMessagesBackToInbox,
    moveMessagesToTrash,
    removeMessagesPermanently,
} from "../../Data/AdminData";

function formatDateTime(value) {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatByteSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 1024) {
        return `${bytes ?? 0} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildSandboxedEmailHtml(html) {
    return `<!doctype html><html><head><meta charset="utf-8"/><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;color:#222;background:#fff;margin:16px;overflow-wrap:break-word;}img{max-width:100%;height:auto;}</style></head><body>${html}</body></html>`;
}

export default function AdminMailboxTab({notify}) {
    const [folder, setFolder] = useState("inbox");
    const [messages, setMessages] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState("");

    const [detailCache, setDetailCache] = useState({});
    const [viewMode, setViewMode] = useState("text");

    const [acting, setActing] = useState(false);
    const [confirmPermanentDelete, setConfirmPermanentDelete] = useState(false);

    const refreshFolder = useCallback(async (targetFolder = folder) => {
        setLoadingList(true);
        try {
            const list = await fetchMailboxMessages(targetFolder);
            setMessages(list);
            setSelectedId((prev) => (list.some((m) => m.id === prev) ? prev : list[0]?.id ?? ""));
        } catch (err) {
            notify(extractApiError(err, "加载邮件列表失败"), "error");
        } finally {
            setLoadingList(false);
        }
    }, [folder, notify]);

    useEffect(() => {
        let cancelled = false;
        fetchMailboxMessages(folder)
            .then((list) => {
                if (!cancelled) {
                    setMessages(list);
                    setSelectedId((prev) => (list.some((m) => m.id === prev) ? prev : list[0]?.id ?? ""));
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    notify(extractApiError(err, "加载邮件列表失败"), "error");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingList(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [folder, notify]);

    useEffect(() => {
        if (!selectedId || Object.hasOwn(detailCache, selectedId)) {
            return undefined;
        }
        let cancelled = false;
        fetchMessageDetail(selectedId)
            .then((detail) => {
                if (cancelled) {
                    return;
                }
                setDetailCache((prev) => ({...prev, [selectedId]: detail}));
                if (detail.parsed?.text) {
                    setViewMode("text");
                } else if (detail.parsed?.html) {
                    setViewMode("html");
                } else {
                    setViewMode("raw");
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setDetailCache((prev) => ({...prev, [selectedId]: {raw: null, parsed: null}}));
                    notify(extractApiError(err, "读取邮件正文失败"), "error");
                }
            });
        return () => {
            cancelled = true;
        };
    }, [selectedId, detailCache, notify]);

    const filteredMessages = useMemo(() => {
        const kw = search.trim().toLowerCase();
        if (!kw) {
            return messages;
        }
        return messages.filter(
            (m) =>
                (m.subject ?? "").toLowerCase().includes(kw) ||
                (m.from ?? "").toLowerCase().includes(kw) ||
                (m.to ?? "").toLowerCase().includes(kw),
        );
    }, [messages, search]);

    const selectedSummary = useMemo(
        () => messages.find((m) => m.id === selectedId) ?? null,
        [messages, selectedId],
    );

    const selectedDetail = selectedId ? detailCache[selectedId] : null;
    const loadingDetail = Boolean(selectedId && !Object.hasOwn(detailCache, selectedId));
    const parsedMail = selectedDetail?.parsed;

    const handleSelectMessage = (id) => {
        setSelectedId(id);
        const cached = detailCache[id];
        if (cached) {
            if (cached.parsed?.text) {
                setViewMode("text");
            } else if (cached.parsed?.html) {
                setViewMode("html");
            } else {
                setViewMode("raw");
            }
        }
    };

    const removeSelectedFromLocalList = (removedId) => {
        setMessages((prev) => {
            const next = prev.filter((m) => m.id !== removedId);
            setSelectedId(next[0]?.id ?? "");
            return next;
        });
    };

    const handleMoveToTrash = async () => {
        if (!selectedId) {
            return;
        }
        setActing(true);
        try {
            await moveMessagesToTrash([selectedId]);
            notify("已移入回收站（30 天后自动清理）", "success");
            removeSelectedFromLocalList(selectedId);
        } catch (err) {
            notify(extractApiError(err, "移入回收站失败"), "error");
        } finally {
            setActing(false);
        }
    };

    const handleRestoreInbox = async () => {
        if (!selectedId) {
            return;
        }
        setActing(true);
        try {
            await moveMessagesBackToInbox([selectedId]);
            notify("已恢复至收件箱", "success");
            removeSelectedFromLocalList(selectedId);
        } catch (err) {
            notify(extractApiError(err, "恢复邮件失败"), "error");
        } finally {
            setActing(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (!selectedId) {
            return;
        }
        setActing(true);
        try {
            await removeMessagesPermanently([selectedId]);
            notify("已彻底删除该邮件", "success");
            setConfirmPermanentDelete(false);
            removeSelectedFromLocalList(selectedId);
        } catch (err) {
            notify(extractApiError(err, "彻底删除邮件失败"), "error");
        } finally {
            setActing(false);
        }
    };

    return (
        <Box
            sx={{
                flex: 1,
                minHeight: 0,
                display: "grid",
                gridTemplateColumns: {xs: "1fr", md: "360px 1fr"},
                gridTemplateRows: {xs: "minmax(220px, 42%) 1fr", md: "1fr"},
                gap: 1.5,
            }}
        >
            {/* Left / Top: Message List */}
            <Paper
                variant="outlined"
                sx={{
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Box sx={{p: 1.25, display: "flex", flexDirection: "column", gap: 1, borderBottom: 1, borderColor: "divider"}}>
                    <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1}}>
                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={folder}
                            onChange={(_, next) => {
                                if (next && next !== folder) {
                                    setLoadingList(true);
                                    setFolder(next);
                                }
                            }}
                        >
                            <ToggleButton value="inbox">
                                <InboxRounded fontSize="small" sx={{mr: 0.5}}/>
                                收件箱
                            </ToggleButton>
                            <ToggleButton value="trash">
                                <DeleteOutlineRounded fontSize="small" sx={{mr: 0.5}}/>
                                回收站
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Tooltip title="刷新邮件列表">
                            <span>
                                <IconButton size="small" onClick={() => refreshFolder(folder)} disabled={loadingList}>
                                    <RefreshRounded/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>

                    <TextField
                        size="small"
                        placeholder="搜索主题、发件人或收件人..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRounded fontSize="small" color="action"/>
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearch("")}>
                                            <ClearRounded fontSize="small"/>
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                    />
                </Box>

                <Box sx={{flex: 1, minHeight: 0, overflow: "auto"}}>
                    {loadingList ? (
                        <Box sx={{py: 6, display: "flex", justifyContent: "center"}}>
                            <CircularProgress size={26}/>
                        </Box>
                    ) : filteredMessages.length === 0 ? (
                        <Box sx={{py: 6, px: 2, textAlign: "center", color: "text.secondary"}}>
                            <Typography variant="body2">
                                {folder === "inbox" ? "收件箱为空" : "回收站为空"}
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {filteredMessages.map((msg) => (
                                <ListItemButton
                                    key={msg.id}
                                    selected={msg.id === selectedId}
                                    onClick={() => handleSelectMessage(msg.id)}
                                    divider
                                    sx={{alignItems: "flex-start", py: 1.25}}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" noWrap sx={{fontWeight: 600}}>
                                                {msg.subject || "(无主题)"}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box component="span" sx={{display: "flex", flexDirection: "column", mt: 0.25}}>
                                                <Typography component="span" variant="caption" color="text.secondary" noWrap>
                                                    来自: {msg.from}
                                                </Typography>
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    {formatDateTime(msg.time)}
                                                    {folder === "trash" && msg.expireAt
                                                        ? ` · 清理于 ${formatDateTime(msg.expireAt).slice(0, 10)}`
                                                        : ""}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>
            </Paper>

            {/* Right / Bottom: Message Detail */}
            <Paper
                variant="outlined"
                sx={{
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {!selectedSummary ? (
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "text.secondary",
                        }}
                    >
                        <Typography variant="body2">选择一封邮件查看详情</Typography>
                    </Box>
                ) : (
                    <>
                        <Box sx={{p: 2, display: "flex", flexDirection: "column", gap: 1}}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: 1,
                                }}
                            >
                                <Typography variant="h6" sx={{fontWeight: 700, wordBreak: "break-word", flex: 1, minWidth: 200}}>
                                    {parsedMail?.subject || selectedSummary.subject || "(无主题)"}
                                </Typography>

                                <Box sx={{display: "flex", flexWrap: "wrap", gap: 1}}>
                                    {folder === "inbox" ? (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteOutlineRounded fontSize="small"/>}
                                            disabled={acting}
                                            onClick={handleMoveToTrash}
                                        >
                                            移入回收站
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<RestoreFromTrashRounded fontSize="small"/>}
                                                disabled={acting}
                                                onClick={handleRestoreInbox}
                                            >
                                                恢复至收件箱
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<DeleteForeverRounded fontSize="small"/>}
                                                disabled={acting}
                                                onClick={() => setConfirmPermanentDelete(true)}
                                            >
                                                彻底删除
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{display: "flex", flexWrap: "wrap", columnGap: 3, rowGap: 0.5, color: "text.secondary"}}>
                                <Typography variant="caption">
                                    <b>发件人：</b>{parsedMail?.from || selectedSummary.from}
                                </Typography>
                                <Typography variant="caption">
                                    <b>收件人：</b>{parsedMail?.to || selectedSummary.to}
                                </Typography>
                                <Typography variant="caption">
                                    <b>时间：</b>{formatDateTime(parsedMail?.date || selectedSummary.time)}
                                </Typography>
                            </Box>

                            {parsedMail?.attachments?.length > 0 ? (
                                <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.5}}>
                                    {parsedMail.attachments.map((att, idx) => (
                                        <Chip
                                            key={`${att.filename}-${idx}`}
                                            size="small"
                                            icon={<AttachFileRounded fontSize="small"/>}
                                            label={`${att.filename} (${formatByteSize(att.size)})`}
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            ) : null}

                            <Box sx={{display: "flex", justifyContent: "flex-end"}}>
                                <ToggleButtonGroup
                                    size="small"
                                    exclusive
                                    value={viewMode}
                                    onChange={(_, next) => next && setViewMode(next)}
                                >
                                    <ToggleButton value="text" disabled={!parsedMail?.text}>
                                        纯文本
                                    </ToggleButton>
                                    <ToggleButton value="html" disabled={!parsedMail?.html}>
                                        HTML 预览
                                    </ToggleButton>
                                    <ToggleButton value="raw">
                                        原始源码
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        </Box>

                        <Divider/>

                        <Box sx={{flex: 1, minHeight: 0, overflow: "auto", p: viewMode === "html" ? 0 : 2}}>
                            {loadingDetail && !selectedDetail ? (
                                <Box sx={{py: 6, display: "flex", justifyContent: "center"}}>
                                    <CircularProgress size={28}/>
                                </Box>
                            ) : viewMode === "html" && parsedMail?.html ? (
                                <Box
                                    component="iframe"
                                    title="email-html-preview"
                                    sandbox=""
                                    srcDoc={buildSandboxedEmailHtml(parsedMail.html)}
                                    sx={{
                                        border: 0,
                                        width: "100%",
                                        height: "100%",
                                        minHeight: 320,
                                        display: "block",
                                    }}
                                />
                            ) : viewMode === "text" && parsedMail?.text ? (
                                <Box
                                    component="pre"
                                    sx={{
                                        m: 0,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        fontFamily: "inherit",
                                        fontSize: "0.92rem",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {parsedMail.text}
                                </Box>
                            ) : (
                                <Box
                                    component="pre"
                                    sx={{
                                        m: 0,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        fontFamily: "monospace",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    {selectedDetail?.raw ?? "（无邮件内容）"}
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </Paper>

            <Dialog
                open={confirmPermanentDelete}
                onClose={() => !acting && setConfirmPermanentDelete(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>彻底删除邮件</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        确定要从回收站彻底删除这封邮件吗？此操作无法撤销。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmPermanentDelete(false)} disabled={acting}>
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handlePermanentDelete}
                        disabled={acting}
                    >
                        彻底删除
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
