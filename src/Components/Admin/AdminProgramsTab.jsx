import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {
    Alert,
    Autocomplete,
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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    DeleteOutlineRounded,
    DriveFileRenameOutlineRounded,
    FilterAltOffRounded,
    FilterAltRounded,
    HistoryRounded,
    OpenInNewRounded,
    RefreshRounded,
    RestoreRounded,
} from "@mui/icons-material";
import {getProgramContent, getPrograms} from "../../Data/ProgramData";
import {univAbbrFullNameMapping, utcToLocal} from "../../Data/Common";
import {
    deleteEmptyProgram,
    extractApiError,
    fetchProgramVersions,
    renameProgramId,
    rollbackProgramVersion,
} from "../../Data/AdminData";
import {programsProgramPath} from "../RouteUtils";
import Markdown from "../Markdown/Markdown";

function flattenProgramMap(programMap) {
    const list = [];
    Object.entries(programMap ?? {}).forEach(([univ, items]) => {
        (items ?? []).forEach((p) => {
            list.push({
                ...p,
                fullUnivName: univAbbrFullNameMapping[univ] ?? univ,
            });
        });
    });
    return list;
}

function formatArrayField(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
        return "—";
    }
    return arr.join(", ");
}

export default function AdminProgramsTab({notify}) {
    const [programs, setPrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(true);
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [newProgramName, setNewProgramName] = useState("");

    const [filterBySelected, setFilterBySelected] = useState(false);
    const [versions, setVersions] = useState([]);
    const [loadingVersions, setLoadingVersions] = useState(true);

    const [confirmRenameOpen, setConfirmRenameOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [mutatingProgram, setMutatingProgram] = useState(false);

    const [inspectVersion, setInspectVersion] = useState(null);
    const [liveProgramForInspect, setLiveProgramForInspect] = useState(null);
    const [loadingLiveInspect, setLoadingLiveInspect] = useState(false);
    const [descViewMode, setDescViewMode] = useState("markdown");
    const [confirmRollbackStep, setConfirmRollbackStep] = useState(false);
    const [rollingBack, setRollingBack] = useState(false);

    const activeVersionFilterId = filterBySelected && selectedProgramId ? selectedProgramId : "";

    const refreshAllPrograms = useCallback(async (forceRefresh = true) => {
        setLoadingPrograms(true);
        try {
            const programMap = await getPrograms(forceRefresh);
            setPrograms(flattenProgramMap(programMap));
        } catch (err) {
            notify(extractApiError(err, "加载项目列表失败"), "error");
        } finally {
            setLoadingPrograms(false);
        }
    }, [notify]);

    const refreshVersions = useCallback(async (filterId = activeVersionFilterId) => {
        setLoadingVersions(true);
        try {
            const data = await fetchProgramVersions(filterId, 100);
            setVersions(data.versions ?? []);
        } catch (err) {
            notify(extractApiError(err, "加载项目历史版本失败"), "error");
        } finally {
            setLoadingVersions(false);
        }
    }, [activeVersionFilterId, notify]);

    useEffect(() => {
        let cancelled = false;
        getPrograms(false)
            .then((programMap) => {
                if (!cancelled) {
                    setPrograms(flattenProgramMap(programMap));
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    notify(extractApiError(err, "加载项目列表失败"), "error");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingPrograms(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [notify]);

    useEffect(() => {
        let cancelled = false;
        fetchProgramVersions(activeVersionFilterId, 100)
            .then((data) => {
                if (!cancelled) {
                    setVersions(data.versions ?? []);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    notify(extractApiError(err, "加载项目历史版本失败"), "error");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingVersions(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [activeVersionFilterId, notify]);

    const selectedProgram = useMemo(
        () => programs.find((p) => p.ProgramID === selectedProgramId) ?? null,
        [programs, selectedProgramId],
    );

    const trimmedNewName = newProgramName.trim();
    const invalidNewNameChar = trimmedNewName.includes("@") || trimmedNewName.includes("|");
    const previewNewProgramId = selectedProgram && trimmedNewName
        ? `${trimmedNewName}@${selectedProgram.University}`
        : "";
    const canSubmitRename = Boolean(
        selectedProgram &&
        trimmedNewName &&
        !invalidNewNameChar &&
        trimmedNewName !== selectedProgram.Program,
    );

    const handleSelectProgram = (_, option) => {
        const nextId = option?.ProgramID ?? "";
        setSelectedProgramId(nextId);
        setNewProgramName(option?.Program ?? "");
        if (!nextId) {
            if (filterBySelected) {
                setLoadingVersions(true);
            }
            setFilterBySelected(false);
        } else if (filterBySelected && nextId !== selectedProgramId) {
            setLoadingVersions(true);
        }
    };

    const handleRenameProgram = async () => {
        if (!selectedProgram || !canSubmitRename) {
            return;
        }
        setMutatingProgram(true);
        const oldId = selectedProgram.ProgramID;
        const newId = previewNewProgramId;
        try {
            await renameProgramId(oldId, newId);
            notify(`已将 ${oldId} 重命名并迁移至 ${newId}`, "success");
            setConfirmRenameOpen(false);
            await refreshAllPrograms(true);
            setSelectedProgramId(newId);
            setNewProgramName(trimmedNewName);
            await refreshVersions(filterBySelected ? newId : "");
        } catch (err) {
            notify(extractApiError(err, "项目重命名迁移失败"), "error");
        } finally {
            setMutatingProgram(false);
        }
    };

    const handleDeleteProgram = async () => {
        if (!selectedProgram) {
            return;
        }
        setMutatingProgram(true);
        const targetId = selectedProgram.ProgramID;
        try {
            await deleteEmptyProgram(targetId);
            notify(`已删除空项目 ${targetId}`, "success");
            setConfirmDeleteOpen(false);
            setSelectedProgramId("");
            setNewProgramName("");
            setFilterBySelected(false);
            await refreshAllPrograms(true);
            await refreshVersions("");
        } catch (err) {
            notify(extractApiError(err, "删除项目失败"), "error");
        } finally {
            setMutatingProgram(false);
        }
    };

    const handleOpenInspect = async (versionRow) => {
        setInspectVersion(versionRow);
        setConfirmRollbackStep(false);
        setLiveProgramForInspect(null);
        if (!versionRow.programExists) {
            return;
        }
        setLoadingLiveInspect(true);
        try {
            const live = await getProgramContent(versionRow.ProgramID, true);
            setLiveProgramForInspect(live);
        } catch {
            setLiveProgramForInspect(null);
        } finally {
            setLoadingLiveInspect(false);
        }
    };

    const handleCloseInspect = () => {
        if (rollingBack) {
            return;
        }
        setInspectVersion(null);
        setLiveProgramForInspect(null);
        setConfirmRollbackStep(false);
    };

    const handleRollback = async () => {
        if (!inspectVersion) {
            return;
        }
        setRollingBack(true);
        try {
            await rollbackProgramVersion(inspectVersion.id, inspectVersion.ProgramID);
            notify(`已将 ${inspectVersion.ProgramID} 回滚至 v${inspectVersion.versionNumber}`, "success");
            setInspectVersion(null);
            setConfirmRollbackStep(false);
            await Promise.all([refreshAllPrograms(true), refreshVersions()]);
        } catch (err) {
            notify(extractApiError(err, "回滚项目版本失败"), "error");
        } finally {
            setRollingBack(false);
        }
    };

    return (
        <Box sx={{flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 1.5}}>
            <Paper variant="outlined" sx={{p: 1.5, display: "flex", flexDirection: "column", gap: 1.5}}>
                <Box sx={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5}}>
                    <Autocomplete
                        size="small"
                        loading={loadingPrograms}
                        options={programs}
                        value={selectedProgram}
                        onChange={handleSelectProgram}
                        getOptionLabel={(option) => `${option.ProgramID} (${option.fullUnivName})`}
                        filterOptions={(options, state) => {
                            const kw = state.inputValue.trim().toLowerCase();
                            if (!kw) {
                                return options.slice(0, 100);
                            }
                            return options
                                .filter(
                                    (opt) =>
                                        opt.ProgramID.toLowerCase().includes(kw) ||
                                        opt.Program.toLowerCase().includes(kw) ||
                                        opt.University.toLowerCase().includes(kw) ||
                                        opt.fullUnivName.toLowerCase().includes(kw),
                                )
                                .slice(0, 100);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="定位项目（支持搜学校缩写 / 全称 / 项目名）"
                                placeholder="例如 MSCS@CMU 或 Carnegie Mellon..."
                            />
                        )}
                        sx={{flex: 1, minWidth: 280}}
                    />

                    {selectedProgram ? (
                        <Box sx={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1}}>
                            <Button
                                size="small"
                                variant="outlined"
                                component={Link}
                                to={programsProgramPath(selectedProgram.ProgramID)}
                                startIcon={<OpenInNewRounded fontSize="small"/>}
                            >
                                查看项目页
                            </Button>
                            <Button
                                size="small"
                                variant={filterBySelected ? "contained" : "outlined"}
                                startIcon={filterBySelected ? <FilterAltOffRounded fontSize="small"/> : <FilterAltRounded fontSize="small"/>}
                                onClick={() => {
                                    setLoadingVersions(true);
                                    setFilterBySelected((prev) => !prev);
                                }}
                            >
                                {filterBySelected ? "显示全站历史" : "仅看该项目历史"}
                            </Button>
                        </Box>
                    ) : null}
                </Box>

                {selectedProgram ? (
                    <>
                        <Divider/>
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1.5,
                            }}
                        >
                            <Box sx={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1}}>
                                <Chip label={`学位: ${selectedProgram.Degree || "—"}`} size="small" variant="outlined"/>
                                <Chip label={`地区: ${formatArrayField(selectedProgram.Region)}`} size="small" variant="outlined"/>
                                <Chip
                                    label={`目标专业: ${formatArrayField(selectedProgram.TargetApplicantMajor)}`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1}}>
                                <TextField
                                    size="small"
                                    label="同校重命名项目"
                                    value={newProgramName}
                                    onChange={(e) => setNewProgramName(e.target.value)}
                                    error={invalidNewNameChar}
                                    helperText={invalidNewNameChar ? "不能包含 @ 或 |" : undefined}
                                    sx={{minWidth: 240}}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    @{selectedProgram.University}
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<DriveFileRenameOutlineRounded fontSize="small"/>}
                                    disabled={!canSubmitRename || mutatingProgram}
                                    onClick={() => setConfirmRenameOpen(true)}
                                >
                                    重命名并迁移
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteOutlineRounded fontSize="small"/>}
                                    disabled={mutatingProgram}
                                    onClick={() => setConfirmDeleteOpen(true)}
                                >
                                    删除空项目
                                </Button>
                            </Box>
                        </Box>
                    </>
                ) : null}
            </Paper>

            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap"}}>
                    <HistoryRounded fontSize="small" color="action"/>
                    <Typography variant="subtitle1" sx={{fontWeight: 700}}>
                        {activeVersionFilterId
                            ? `项目修改历史：${activeVersionFilterId}`
                            : "最近项目修改历史（全站最新 100 条）"}
                    </Typography>
                    {activeVersionFilterId ? (
                        <Chip
                            size="small"
                            label="清除项目筛选"
                            onDelete={() => {
                                setLoadingVersions(true);
                                setFilterBySelected(false);
                            }}
                        />
                    ) : null}
                </Box>
                <Tooltip title="刷新历史版本">
                    <span>
                        <IconButton size="small" onClick={() => refreshVersions()} disabled={loadingVersions}>
                            <RefreshRounded/>
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{flex: 1, minHeight: 0, overflow: "auto"}}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{fontWeight: 700}}>版本</TableCell>
                            <TableCell sx={{fontWeight: 700}}>项目 ID</TableCell>
                            <TableCell sx={{fontWeight: 700}}>覆盖操作人 / 迁移记录</TableCell>
                            <TableCell sx={{fontWeight: 700}}>归档时间</TableCell>
                            <TableCell sx={{fontWeight: 700}}>历史快照摘要</TableCell>
                            <TableCell align="right" sx={{fontWeight: 700}}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loadingVersions ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{py: 6}}>
                                    <CircularProgress size={28}/>
                                </TableCell>
                            </TableRow>
                        ) : versions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{py: 6, color: "text.secondary"}}>
                                    暂无项目历史版本记录
                                </TableCell>
                            </TableRow>
                        ) : (
                            versions.map((ver) => (
                                <TableRow key={ver.id} hover>
                                    <TableCell>
                                        <Chip label={`v${ver.versionNumber}`} size="small" variant="outlined"/>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{display: "flex", alignItems: "center", gap: 0.75}}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontFamily: "monospace",
                                                    cursor: ver.programExists ? "pointer" : "default",
                                                    color: ver.programExists ? "primary.main" : "text.secondary",
                                                }}
                                                onClick={() => {
                                                    if (!ver.programExists) {
                                                        return;
                                                    }
                                                    if (activeVersionFilterId !== ver.ProgramID) {
                                                        setLoadingVersions(true);
                                                    }
                                                    const found = programs.find((p) => p.ProgramID === ver.ProgramID);
                                                    setSelectedProgramId(ver.ProgramID);
                                                    setNewProgramName(found?.Program ?? ver.Program);
                                                    setFilterBySelected(true);
                                                }}
                                            >
                                                {ver.ProgramID}
                                            </Typography>
                                            {!ver.programExists ? (
                                                <Chip label="已迁移/删除" size="small" variant="outlined"/>
                                            ) : null}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{fontFamily: "monospace"}}>
                                            {ver.modifiedBy || "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{color: "text.secondary", whiteSpace: "nowrap"}}>
                                            {ver.createdAt ? utcToLocal(ver.createdAt) : "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{color: "text.secondary"}}>
                                            {ver.Degree || "—"} · 描述 {ver.Description?.length ?? 0} 字
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleOpenInspect(ver)}
                                        >
                                            查看 / 回滚
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Rename / Migrate Confirmation Dialog */}
            <Dialog
                open={confirmRenameOpen}
                onClose={() => !mutatingProgram && setConfirmRenameOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>确认重命名并迁移项目 ID</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 1.5}}>
                        即将把项目从 <b>{selectedProgram?.ProgramID}</b> 迁移至 <b>{previewNewProgramId}</b>。
                    </DialogContentText>
                    <Alert severity="info" variant="outlined">
                        该操作会自动同步更新所有关联的申请记录（Records）、申请人最终去向（Final）以及用户收藏夹，并在原项目 ID 下保留一条迁移历史记录。
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmRenameOpen(false)} disabled={mutatingProgram}>
                        取消
                    </Button>
                    <Button variant="contained" onClick={handleRenameProgram} disabled={mutatingProgram}>
                        确认迁移
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Empty Program Confirmation Dialog */}
            <Dialog
                open={confirmDeleteOpen}
                onClose={() => !mutatingProgram && setConfirmDeleteOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>确认删除空项目</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        确定要删除项目 <b>{selectedProgram?.ProgramID}</b> 吗？仅当该项目没有任何关联申请记录、最终去向或用户收藏时才允许删除。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)} disabled={mutatingProgram}>
                        取消
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteProgram}
                        disabled={mutatingProgram}
                    >
                        确认删除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Version Inspection & Rollback Dialog */}
            <Dialog
                open={Boolean(inspectVersion)}
                onClose={handleCloseInspect}
                maxWidth="lg"
                fullWidth
            >
                {inspectVersion ? (
                    <>
                        <DialogTitle sx={{display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1}}>
                            <Box sx={{display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap"}}>
                                <Typography variant="h6" sx={{fontWeight: 700}}>
                                    {inspectVersion.ProgramID} — 历史快照 v{inspectVersion.versionNumber}
                                </Typography>
                                <Typography variant="caption" sx={{color: "text.secondary"}}>
                                    （在 {inspectVersion.createdAt ? utcToLocal(inspectVersion.createdAt) : "—"} 被 {inspectVersion.modifiedBy} 修改前归档）
                                </Typography>
                            </Box>
                            <ToggleButtonGroup
                                size="small"
                                exclusive
                                value={descViewMode}
                                onChange={(_, next) => next && setDescViewMode(next)}
                            >
                                <ToggleButton value="markdown">Markdown 预览</ToggleButton>
                                <ToggleButton value="raw">纯文本源码</ToggleButton>
                            </ToggleButtonGroup>
                        </DialogTitle>
                        <DialogContent dividers>
                            {!inspectVersion.programExists ? (
                                <Alert severity="warning" sx={{mb: 2}}>
                                    原项目 ID（{inspectVersion.ProgramID}）已不存在（已被重命名迁移或删除），当前仅支持查阅该历史快照，无法直接回滚。
                                </Alert>
                            ) : null}

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        md: inspectVersion.programExists ? "1fr 1fr" : "1fr",
                                    },
                                    gap: 2,
                                }}
                            >
                                <Paper variant="outlined" sx={{p: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                    <Typography variant="subtitle2" color="primary" sx={{fontWeight: 700}}>
                                        历史快照（v{inspectVersion.versionNumber}）
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>学位：</b>{inspectVersion.Degree || "—"}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>地区：</b>{formatArrayField(inspectVersion.Region)}
                                    </Typography>
                                    <Typography variant="body2">
                                        <b>目标专业：</b>{formatArrayField(inspectVersion.TargetApplicantMajor)}
                                    </Typography>
                                    <Divider sx={{my: 0.5}}/>
                                    <Box sx={{maxHeight: 380, overflow: "auto"}}>
                                        {!inspectVersion.Description ? (
                                            <Typography variant="body2" color="text.secondary">
                                                （无项目描述）
                                            </Typography>
                                        ) : descViewMode === "raw" ? (
                                            <Box
                                                component="pre"
                                                sx={{
                                                    m: 0,
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                    fontFamily: "monospace",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                {inspectVersion.Description}
                                            </Box>
                                        ) : (
                                            <Markdown>{inspectVersion.Description}</Markdown>
                                        )}
                                    </Box>
                                </Paper>

                                {inspectVersion.programExists ? (
                                    <Paper variant="outlined" sx={{p: 2, display: "flex", flexDirection: "column", gap: 1}}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{fontWeight: 700}}>
                                            当前线上版本
                                        </Typography>
                                        {loadingLiveInspect ? (
                                            <Box sx={{py: 4, display: "flex", justifyContent: "center"}}>
                                                <CircularProgress size={24}/>
                                            </Box>
                                        ) : liveProgramForInspect ? (
                                            <>
                                                <Typography variant="body2">
                                                    <b>学位：</b>{liveProgramForInspect.Degree || "—"}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <b>地区：</b>{formatArrayField(liveProgramForInspect.Region)}
                                                </Typography>
                                                <Typography variant="body2">
                                                    <b>目标专业：</b>{formatArrayField(liveProgramForInspect.TargetApplicantMajor)}
                                                </Typography>
                                                <Divider sx={{my: 0.5}}/>
                                                <Box sx={{maxHeight: 380, overflow: "auto"}}>
                                                    {!liveProgramForInspect.description ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            （无项目描述）
                                                        </Typography>
                                                    ) : descViewMode === "raw" ? (
                                                        <Box
                                                            component="pre"
                                                            sx={{
                                                                m: 0,
                                                                whiteSpace: "pre-wrap",
                                                                wordBreak: "break-word",
                                                                fontFamily: "monospace",
                                                                fontSize: "0.85rem",
                                                            }}
                                                        >
                                                            {liveProgramForInspect.description}
                                                        </Box>
                                                    ) : (
                                                        <Markdown>{liveProgramForInspect.description}</Markdown>
                                                    )}
                                                </Box>
                                            </>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                加载当前线上版本失败
                                            </Typography>
                                        )}
                                    </Paper>
                                ) : null}
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{justifyContent: "space-between", px: 3}}>
                            <Typography variant="caption" color="text.secondary">
                                回滚操作会将当前线上内容先归档至新历史版本，再恢复为所选快照。
                            </Typography>
                            <Box sx={{display: "flex", gap: 1}}>
                                <Button onClick={handleCloseInspect} disabled={rollingBack}>
                                    关闭
                                </Button>
                                {inspectVersion.programExists ? (
                                    confirmRollbackStep ? (
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            startIcon={<RestoreRounded/>}
                                            onClick={handleRollback}
                                            disabled={rollingBack}
                                        >
                                            确认回滚至 v{inspectVersion.versionNumber}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            color="warning"
                                            startIcon={<RestoreRounded/>}
                                            onClick={() => setConfirmRollbackStep(true)}
                                            disabled={rollingBack}
                                        >
                                            回滚到此版本
                                        </Button>
                                    )
                                ) : null}
                            </Box>
                        </DialogActions>
                    </>
                ) : null}
            </Dialog>
        </Box>
    );
}
