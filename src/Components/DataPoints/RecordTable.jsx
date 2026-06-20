import React, {forwardRef, useMemo, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {TableVirtuoso} from "react-virtuoso";
import {alpha, darken, useTheme} from "@mui/material/styles";
import {Box, Button, Checkbox, IconButton, ListItemText, MenuItem, OutlinedInput, Select, TextField, Tooltip, Typography} from "@mui/material";
import {ArrowDownward, ArrowUpward, Check, ControlPoint, Search, ViewAgendaOutlined} from "@mui/icons-material";
import {recordStatusList} from "../../Data/Schemas";
import {applicantDialogPath, dataPointsProgramPath} from "../RouteUtils";
import "./DataPoints.css";

/* ----------------------------- column model ----------------------------- */

const COLUMNS = [
    {key: "applicant", label: "申请人", width: 150, align: "left", sortType: "string"},
    {key: "program", label: "申请项目", width: 180, align: "left", sortType: "string", programOnly: true},
    {key: "status", label: "申请结果", width: 104, align: "left", sortType: "status"},
    {key: "final", label: "最终去向", width: 92, align: "center", sortType: "bool"},
    {key: "season", label: "申请季", width: 116, align: "left", sortType: "season"},
    {key: "decision", label: "结果时间", width: 110, align: "left", sortType: "date"},
    {key: "interview", label: "面试时间", width: 110, align: "left", sortType: "date"},
    {key: "submit", label: "申请时间", width: 110, align: "left", sortType: "date"},
    {key: "detail", label: "备注、补充说明等", width: 340, align: "left", sortType: null},
];

const STATUS_RANK = {Admit: 0, Waitlist: 1, Defer: 2, Reject: 3};
const SEMESTER_WEIGHT = {Fall: 2, Spring: 1, Summer: 1, Winter: 1};
const TIMELINE_KEY = {decision: "Decision", interview: "Interview", submit: "Submit"};

const dateText = (value) => (value ? String(value).split("T")[0] : "");

/* ----------------------------- chip helpers ----------------------------- */

function useChipColors() {
    const theme = useTheme();
    return useMemo(() => {
        const dark = theme.palette.mode === "dark";
        // light mode: darken the text so it stays legible on the pale tinted
        // chip background (the full-saturation hue was too light to read)
        const make = (main) => ({
            bg: alpha(main, dark ? 0.22 : 0.16),
            fg: dark ? main : darken(main, 0.32),
        });
        return {
            status: {
                Admit: make(theme.palette.admit.main),
                Reject: make(theme.palette.reject.main),
                Defer: make(theme.palette.defer.main),
                Waitlist: make(theme.palette.text.secondary),
            },
            semester: {
                Fall: make(theme.palette.fall.main),
                Spring: make(theme.palette.spring.main),
                Summer: make(theme.palette.spring.main),
                Winter: make(theme.palette.spring.main),
            },
            link: make(theme.palette.primary.main),
        };
    }, [theme]);
}

function Chip({label, colors, onClick, title}) {
    return (
        <span
            className={onClick ? "rt-chip rt-chip-click" : "rt-chip"}
            style={{backgroundColor: colors.bg, color: colors.fg}}
            onClick={onClick}
            title={title}
        >
            {label}
        </span>
    );
}

/* --------------------------- sorting comparator -------------------------- */

function makeComparator(sortKey, sortDir) {
    if (!sortKey || !sortDir) return null;
    const col = COLUMNS.find((c) => c.key === sortKey);
    const sign = sortDir === "asc" ? 1 : -1;
    const value = (r) => {
        switch (col.sortType) {
            case "string":
                return sortKey === "applicant" ? r.ApplicantID : r.ProgramID;
            case "status":
                return STATUS_RANK[r.Status] ?? 99;
            case "bool":
                return r.Final ? 1 : 0;
            case "season":
                return r.ProgramYear * 10 + (SEMESTER_WEIGHT[r.Semester] ?? 0);
            case "date":
                return dateText(r.TimeLine?.[TIMELINE_KEY[sortKey]]);
            default:
                return "";
        }
    };
    return (a, b) => {
        const va = value(a);
        const vb = value(b);
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * sign;
        return String(va).localeCompare(String(vb)) * sign;
    };
}

/* default order: keep program grouping order, newest season first within program */
function defaultSort(records) {
    const programOrder = new Map();
    records.forEach((r) => {
        if (!programOrder.has(r.ProgramID)) programOrder.set(r.ProgramID, programOrder.size);
    });
    return [...records].sort((a, b) => (
        programOrder.get(a.ProgramID) - programOrder.get(b.ProgramID) ||
        b.ProgramYear - a.ProgramYear ||
        (SEMESTER_WEIGHT[b.Semester] ?? 0) - (SEMESTER_WEIGHT[a.Semester] ?? 0)
    ));
}

/* ------------------------------ virtuoso table --------------------------- */

const VirtuosoTableComponents = {
    Scroller: forwardRef((props, ref) => <div {...props} ref={ref} className="rt-scroller"/>),
    Table: (props) => <table {...props} className="rt-table"/>,
    TableHead: forwardRef((props, ref) => <thead {...props} ref={ref}/>),
    TableRow: (props) => <tr {...props} className="rt-row"/>,
    TableBody: forwardRef((props, ref) => <tbody {...props} ref={ref}/>),
};

function HeaderCell({col, sortKey, sortDir, onSort}) {
    const active = sortKey === col.key;
    const sortable = Boolean(col.sortType);
    return (
        <th
            className={sortable ? "rt-th rt-th-sortable" : "rt-th"}
            style={{width: col.width, minWidth: col.width, textAlign: col.align}}
            onClick={sortable ? () => onSort(col.key) : undefined}
        >
            <span className="rt-th-inner">
                {col.label}
                {sortable && (
                    <span className={active ? "rt-sort rt-sort-active" : "rt-sort"}>
                        {active && sortDir === "asc" ? <ArrowUpward fontSize="inherit"/> : <ArrowDownward fontSize="inherit"/>}
                    </span>
                )}
            </span>
        </th>
    );
}

/* ------------------------------ main table ------------------------------- */

export default function RecordTable({records, insideProgramPage = false, style = {}, refreshSlot = null}) {
    const navigate = useNavigate();
    const location = useLocation();
    const chip = useChipColors();
    const theme = useTheme();
    const dark = theme.palette.mode === "dark";
    const columns = useMemo(
        () => COLUMNS.filter((c) => !(insideProgramPage && c.programOnly)),
        [insideProgramPage]
    );
    const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);
    const cssVars = {
        "--rt-border": theme.palette.divider,
        "--rt-head-bg": theme.palette.surfaceVariant,
        "--rt-row-hover": alpha(theme.palette.primary.main, dark ? 0.12 : 0.06),
        "--rt-text": theme.palette.text.primary,
        "--rt-text-2": theme.palette.text.secondary,
        "--rt-group-bg": alpha(theme.palette.text.primary, dark ? 0.06 : 0.035),
        "--rt-success": theme.palette.admit.main,
        "--rt-input-bg": alpha(theme.palette.text.primary, dark ? 0.07 : 0.045),
        "--rt-input-bg-hover": alpha(theme.palette.text.primary, dark ? 0.11 : 0.07),
        "--rt-accent": theme.palette.primary.main,
        "--rt-accent-soft": alpha(theme.palette.primary.main, dark ? 0.25 : 0.4),
        "--rt-min-width": `${tableWidth}px`,
    };

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState([]);
    const [seasonFilter, setSeasonFilter] = useState([]);
    const [finalFilter, setFinalFilter] = useState(""); // '', 'true', 'false'
    const [grouped, setGrouped] = useState(true);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null); // 'asc' | 'desc' | null

    const seasonOptions = useMemo(() => {
        const set = new Set(records.map((r) => `${r.ProgramYear} ${r.Semester}`));
        return [...set].sort((a, b) => b.localeCompare(a));
    }, [records]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return records.filter((r) => {
            if (statusFilter.length && !statusFilter.includes(r.Status)) return false;
            if (seasonFilter.length && !seasonFilter.includes(`${r.ProgramYear} ${r.Semester}`)) return false;
            if (finalFilter !== "" && r.Final !== (finalFilter === "true")) return false;
            if (q) {
                const hay = `${r.ApplicantID} ${r.ProgramID} ${r.Status} ${r.ProgramYear} ${r.Semester} ${r.Detail ?? ""}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [records, search, statusFilter, seasonFilter, finalFilter]);

    const rows = useMemo(() => {
        const comparator = makeComparator(sortKey, sortDir);
        if (grouped && !insideProgramPage) {
            // group by program (in default program order), sort within each group
            const order = defaultSort(filtered);
            const groups = new Map();
            order.forEach((r) => {
                if (!groups.has(r.ProgramID)) groups.set(r.ProgramID, []);
                groups.get(r.ProgramID).push(r);
            });
            const out = [];
            groups.forEach((groupRecords, programID) => {
                out.push({type: "group", programID, count: groupRecords.length});
                const sorted = comparator ? [...groupRecords].sort(comparator) : groupRecords;
                sorted.forEach((r) => out.push({type: "record", record: r}));
            });
            return out;
        }
        const sorted = comparator ? [...filtered].sort(comparator) : defaultSort(filtered);
        return sorted.map((r) => ({type: "record", record: r}));
    }, [filtered, grouped, insideProgramPage, sortKey, sortDir]);

    const handleSort = (key) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDir("asc");
        } else if (sortDir === "asc") {
            setSortDir("desc");
        } else {
            setSortKey(null);
            setSortDir(null);
        }
    };

    const renderRow = (_index, row) => {
        if (row.type === "group") {
            return (
                <td className="rt-group-cell" colSpan={columns.length}>
                    <span className="rt-group-name">{row.programID}</span>
                    <Tooltip title="添加申请记录" arrow>
                        <IconButton
                            size="small"
                            aria-label="添加申请记录"
                            className="rt-group-add"
                            onClick={() => navigate(`/profile/new-record`, {state: {programID: row.programID, from: location.pathname}})}
                        >
                            <ControlPoint sx={{fontSize: "0.95rem"}}/>
                        </IconButton>
                    </Tooltip>
                    <span className="rt-group-count">{row.count}</span>
                </td>
            );
        }
        const r = row.record;
        return columns.map((col) => (
            <td key={col.key} className="rt-td" style={{width: col.width, minWidth: col.width, textAlign: col.align}}>
                {renderCell(col.key, r)}
            </td>
        ));
    };

    const renderCell = (key, r) => {
        switch (key) {
            case "applicant":
                return <Chip label={r.ApplicantID} colors={chip.link} title="查看申请人信息"
                             onClick={() => navigate(applicantDialogPath(location.pathname, r.ApplicantID))}/>;
            case "program":
                return <Chip label={r.ProgramID} colors={chip.link} title="查看项目描述"
                             onClick={() => navigate(dataPointsProgramPath(r.ProgramID))}/>;
            case "status":
                return <Chip label={r.Status} colors={chip.status[r.Status]}/>;
            case "final":
                return r.Final ? <Check className="rt-final" fontSize="small"/> : null;
            case "season":
                return <Chip label={`${r.ProgramYear}${r.Semester}`} colors={chip.semester[r.Semester]}/>;
            case "decision":
            case "interview":
            case "submit":
                return <span className="rt-date">{dateText(r.TimeLine?.[TIMELINE_KEY[key]])}</span>;
            case "detail":
                return <span className="rt-detail">{r.Detail}</span>;
            default:
                return null;
        }
    };

    return (
        <div className="rt-container" style={{...cssVars, ...style}}>
            {!insideProgramPage && (
                <FilterBar
                    search={search} setSearch={setSearch}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    seasonFilter={seasonFilter} setSeasonFilter={setSeasonFilter}
                    seasonOptions={seasonOptions}
                    finalFilter={finalFilter} setFinalFilter={setFinalFilter}
                    grouped={grouped} setGrouped={setGrouped}
                    filteredCount={filtered.length} total={records.length}
                    refreshSlot={refreshSlot}
                />
            )}
            <TableVirtuoso
                data={rows}
                overscan={400}
                components={VirtuosoTableComponents}
                style={{flex: "auto", minHeight: 0}}
                fixedHeaderContent={() => (
                    <tr className="rt-head-row" style={{minWidth: tableWidth}}>
                        {columns.map((col) => (
                            <HeaderCell key={col.key} col={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort}/>
                        ))}
                    </tr>
                )}
                itemContent={renderRow}
            />
            {filtered.length === 0 && (
                <Typography className="rt-empty" variant="body2">
                    {insideProgramPage ? "该项目暂无申请记录" : "未找到任何匹配结果"}
                </Typography>
            )}
        </div>
    );
}

/* ------------------------------ filter bar ------------------------------- */

const MENU_PROPS = {
    PaperProps: {
        className: "rt-menu",
        sx: {
            mt: 0.5,
            maxHeight: 320,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundImage: "none",
            "& .MuiList-root": {py: 0.5},
            "& .MuiMenuItem-root": {fontSize: 13, minHeight: "auto", py: 0.25, px: 1, borderRadius: 1, mx: 0.5},
            "& .MuiCheckbox-root": {p: 0.5, mr: 0.5},
            "& .MuiCheckbox-root .MuiSvgIcon-root": {fontSize: 18},
        },
    },
};

function MultiFilter({label, value, onChange, options}) {
    return (
        <Select
            size="small" multiple displayEmpty
            value={value}
            onChange={(e) => onChange(e.target.value)}
            input={<OutlinedInput/>}
            MenuProps={MENU_PROPS}
            className={`rt-pill rt-select${value.length ? " rt-pill-active" : ""}`}
            renderValue={() => (value.length ? `${label} · ${value.length}` : label)}
        >
            {options.map((o) => (
                <MenuItem key={o} value={o} dense>
                    <Checkbox size="small" checked={value.includes(o)}/>
                    <ListItemText primary={o}/>
                </MenuItem>
            ))}
        </Select>
    );
}

function FilterBar({
                       search, setSearch,
                       statusFilter, setStatusFilter,
                       seasonFilter, setSeasonFilter, seasonOptions,
                       finalFilter, setFinalFilter,
                       grouped, setGrouped,
                       filteredCount, total,
                       refreshSlot,
                   }) {
    return (
        <Box className="rt-filterbar">
            <TextField
                size="small"
                placeholder="搜索申请人 / 项目 / 备注…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rt-search"
                InputProps={{startAdornment: <Search fontSize="small" sx={{mr: 0.5, color: "text.secondary"}}/>}}
            />
            <MultiFilter label="申请结果" value={statusFilter} onChange={setStatusFilter} options={recordStatusList}/>
            <MultiFilter label="申请季" value={seasonFilter} onChange={setSeasonFilter} options={seasonOptions}/>
            <Select
                size="small" displayEmpty
                value={finalFilter}
                onChange={(e) => setFinalFilter(e.target.value)}
                input={<OutlinedInput/>}
                MenuProps={MENU_PROPS}
                className={`rt-pill rt-select${finalFilter !== "" ? " rt-pill-active" : ""}`}
                renderValue={(v) => (v === "" ? "最终去向" : v === "true" ? "是最终去向" : "非最终去向")}
            >
                <MenuItem value="" dense>全部</MenuItem>
                <MenuItem value="true" dense>是最终去向</MenuItem>
                <MenuItem value="false" dense>非最终去向</MenuItem>
            </Select>
            <Button
                disableRipple
                className={`rt-pill rt-group-pill${grouped ? " rt-pill-active" : ""}`}
                onClick={() => setGrouped((g) => !g)}
                startIcon={<ViewAgendaOutlined sx={{fontSize: 16}}/>}
            >
                按项目分组
            </Button>
            {refreshSlot}
            <span className="rt-count">
                {filteredCount === total
                    ? <>共 <b>{total}</b> 条</>
                    : <><b>{filteredCount}</b> / {total} 条</>}
            </span>
        </Box>
    );
}
