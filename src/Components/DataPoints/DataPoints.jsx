import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Form, Outlet, redirect, useLoaderData, useNavigate, useParams} from "react-router-dom";
import {ThemeSwitcherProvider} from 'react-css-theme-switcher';
import {Dialog, DialogActions, DialogContent, IconButton, Paper, useTheme} from "@mui/material";
import {Close, Refresh} from "@mui/icons-material";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByRecordIDs} from "../../Data/RecordData";
import './DataPoints.css';
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import {recordStatusList} from "../../Data/Schemas";
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";
import {BoldTypography, DraggableFAB} from "../common";
import {columnWidthMap, PlainTable, TopStickyRow} from './PlainTable'
import {ConfigProvider, Input, Select, theme} from 'antd';

const {Option} = Select;

async function getAllRecords(isRefresh = false) {
    let programs = await getPrograms(isRefresh);
    programs = Object.values(programs).flat().filter(program => program.Applicants?.length > 0);
    const recordIDs = programs.flatMap(program => (
        program.Applicants.map(applicant => applicant + "|" + program.ProgramID)
    ));
    const programOrder = new Map(programs.map((program, index) => [program.ProgramID, index]));
    return Object.values(await getRecordByRecordIDs(recordIDs, isRefresh)).sort((a, b) => {
        return programOrder.get(a.ProgramID) - programOrder.get(b.ProgramID);
    });
}

export async function loader() {
    return {records: await getAllRecords()};
}

export async function action() {
    await getAllRecords(true);
    return redirect('/datapoints');
}

export function ApplicantProfileInDataPoints() {
    const navigate = useNavigate();
    const params = useParams();
    const applicantID = params.applicantId;
    const {applicant} = useLoaderData();
    return (
        <Dialog
            open={applicantID === applicant.ApplicantID}
            onClose={() => navigate("..")}
            fullWidth
            maxWidth={'xl'}
            sx={{userSelect: 'text'}}
        >
            <DialogActions>
                <IconButton onClick={() => navigate("..")}>
                    <Close/>
                </IconButton>
            </DialogActions>
            <DialogContent>
                <ProfileApplicantPage editable={false}/>
            </DialogContent>
        </Dialog>
    )
}

export function ProgramContentInDataPoints() {
    const navigate = useNavigate();
    const params = useParams();
    const programID = params.programId;
    const {programContent} = useLoaderData();
    return (
        <Dialog
            open={programID === programContent.ProgramID}
            onClose={() => navigate("..")}
            fullWidth
            maxWidth={'xl'}
            sx={{userSelect: 'text'}}
        >
            <DialogContent>
                <ProgramContent editable={false} inDialog={true}/>
            </DialogContent>
        </Dialog>
    )
}

function SearchFilter({onFilterChange}) {
    const [filters, setFilters] = useState({
        applicant: '',
        program: '',
        status: '',
        final: null,
        season: ''
    });
    useEffect(() => {
        const timeoutId = setTimeout(() => onFilterChange(filters), 200);
        return () => clearTimeout(timeoutId);
    }, [filters, onFilterChange]);

    const handleFilterChange = useCallback((name, value) => {
        setFilters(currentFilters => ({...currentFilters, [name]: value}));
    }, []);

    const muiTheme = useTheme();
    const isDark = muiTheme.palette.mode === 'dark';

    return (
        <div className="filter-container">
            <ConfigProvider theme={{algorithm: isDark ? theme.darkAlgorithm : theme.compactAlgorithm}}>
                <Input
                    id="applicant"
                    size="small"
                    placeholder="搜索申请人"
                    value={filters.applicant}
                    onChange={e => handleFilterChange('applicant', e.target.value)}
                    style={{
                        margin: '0 8px',
                        maxWidth: columnWidthMap[0],
                    }}
                />

                <Input
                    id="program"
                    size="small"
                    placeholder="搜索申请项目"
                    value={filters.program}
                    onChange={e => handleFilterChange('program', e.target.value)}
                    style={{
                        margin: '0 8px',
                        maxWidth: columnWidthMap[1],
                    }}
                />

                <Select
                    id="status"
                    size="small"
                    value={filters.status || ''}
                    onChange={value => handleFilterChange('status', value)}
                    placeholder="所有结果"
                    style={{
                        margin: '0 8px',
                        maxWidth: columnWidthMap[2],
                        width: columnWidthMap[2],
                    }}
                >
                    <Option value="">所有结果</Option>
                    {recordStatusList.map(status => (
                        <Option key={status} value={status}>
                            {status}
                        </Option>
                    ))}
                </Select>

                <Select
                    id="final"
                    size="small"
                    value={filters.final === null ? '' : filters.final ? 'true' : 'false'}
                    onChange={value => {
                        handleFilterChange('final', value === '' ? null : value === 'true');
                    }}
                    placeholder="最终去向"
                    style={{
                        margin: '0 8px',
                        maxWidth: columnWidthMap[3],
                        width: columnWidthMap[3],
                    }}
                >
                    <Option value="">全部</Option>
                    <Option value="true">是</Option>
                    <Option value="false">否</Option>
                </Select>

                <Input
                    id="season"
                    size="small"
                    placeholder="搜索申请季"
                    value={filters.season}
                    onChange={e => handleFilterChange('season', e.target.value)}
                    style={{
                        margin: '0 8px',
                        maxWidth: columnWidthMap[4],
                    }}
                />
            </ConfigProvider>
        </div>
    );
}

/**
 * @typedef {Object} Timeline
 * @property {string?} Decision
 * @property {string?} Interview
 * @property {string?} Submit
 */

/**
 * @typedef {Object} RecordData
 * @property {string} ApplicantID
 * @property {string} Detail
 * @property {boolean} Final
 * @property {string} ProgramID
 * @property {number} ProgramYear
 * @property {string} RecordID
 * @property {string} Season
 * @property {string} Semester
 * @property {string} Status
 * @property {Timeline} TimeLine
 */

/**
 * DataGrid
 *
 * @param {RecordData[]} records
 * @param {boolean} insideProgramPage
 * @param {any} style
 * @returns {Element}
 * @constructor
 */
export function DataGrid({records, insideProgramPage, style = {}}) {
    const theme = useTheme();
    const themeMap = {
        light: "/TableLight.css",
        dark: "/TableDark.css"
    };

    const [filters, setFilters] = useState(null);

    /**
     * @typedef {Object} Filter
     * @property {string} applicant
     * @property {string} program
     * @property {'Admit' | 'Reject' | 'Waitlist' | 'Defer' | ''} status
     * @property {boolean | null} final
     * @property {string} season
     */

    /** @param {Filter} filter */
    const filteredRecords = useMemo(() => records.filter((record) => {
        if (!filters) {
            return true;
        }
        if (filters.status && record.Status !== filters.status) {
            return false;
        }
        if (filters.final !== null && record.Final !== filters.final) {
            return false;
        }
        if (filters.applicant && !record.ApplicantID.toLowerCase().includes(filters.applicant.toLowerCase())) {
            return false;
        }
        if (filters.program && !record.ProgramID.toLowerCase().includes(filters.program.toLowerCase())) {
            return false;
        }
        return !filters.season ||
            `${record.Season} ${record.ProgramYear}${record.Semester}`.toLowerCase().includes(filters.season.toLowerCase());
    }), [filters, records]);

    const sortedFilteredRecords = useMemo(() => sortRecords(filteredRecords), [filteredRecords]);

    return (
        <div className="data-grid-container" style={style}>
            <ThemeSwitcherProvider defaultTheme={theme.palette.mode} themeMap={themeMap} style={{width: '70%'}}>
                <Paper
                    elevation={0}
                    sx={{
                        overflowX: 'scroll',
                        overflowY: 'hidden',
                        maxWidth: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <TopStickyRow
                        filterElem={insideProgramPage || <SearchFilter onFilterChange={setFilters}/>}
                        insideProgramPage={insideProgramPage}
                    />
                    <PlainTable
                        records={sortedFilteredRecords}
                        insideProgramPage={insideProgramPage}
                    />
                </Paper>
                <div className="search-results-indicator" style={{textAlign: 'center'}}>
                    {filteredRecords.length === records.length ? (
                        <BoldTypography variant="body2">
                            总计 <b>{records.length}</b> 条记录
                        </BoldTypography>
                    ) : (
                        <BoldTypography variant="body2">
                            已找到 <b>{filteredRecords.length}</b> 条记录 (共 {records.length} 条)
                        </BoldTypography>
                    )}
                </div>
            </ThemeSwitcherProvider>
        </div>
    )
}

/**
 * Sort records by their existing program order, then by the newest application semester.
 *
 * @param {RecordData[]} records
 * @return {RecordData[]}
 */
function sortRecords(records) {
    const semesterWeight = (semester) => {
        switch (semester) {
            case "Fall": {
                return 2;
            }
            case "Spring": {
                return 1;
            }
            default: {
                return 0;
            }
        }
    };
    const programOrder = new Map();
    records.forEach((record) => {
        if (!programOrder.has(record.ProgramID)) {
            programOrder.set(record.ProgramID, programOrder.size);
        }
    });
    return [...records].sort((a, b) => (
        programOrder.get(a.ProgramID) - programOrder.get(b.ProgramID) ||
        b.ProgramYear - a.ProgramYear ||
        semesterWeight(b.Semester) - semesterWeight(a.Semester)
    ));
}

const FloatingControls = () => (
    /* Refresh FAB */
    (<Form method="post" className="refresh-button">
        <DraggableFAB
            Icon={<Refresh/>}
            ActionType="Refresh"
            ButtonClassName="HiddenRefreshButton"
            color="primary"
            tooltipTitle="刷新表格"
        />
    </Form>)
)

export default function DataPoints() {
    const loaderRecords = useLoaderData();
    const records = useMemo(() => loaderRecords.records.map(record => ({
        ...record,
        Season: record.ProgramYear + " " + record.Semester,
    })), [loaderRecords.records]);

    return (
        <div style={{overflowY: 'hidden'}}>
            <Paper
                className="DataPointsContent"
                sx={{
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "#1A1E24" : "#FAFAFA",
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <DataGrid records={records} insideProgramPage={false}/>
                <Outlet/>
                <FloatingControls/>
            </Paper>
        </div>
    )
}
