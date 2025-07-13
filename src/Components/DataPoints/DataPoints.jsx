import React, {useCallback, useEffect, useRef, useState} from "react";
import {Form, Outlet, redirect, useLoaderData, useNavigate, useParams} from "react-router-dom";
import {ThemeSwitcherProvider} from 'react-css-theme-switcher';
import {Dialog, DialogActions, DialogContent, IconButton, Paper, useTheme} from "@mui/material";
import {Close, Refresh } from "@mui/icons-material";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByRecordIDs} from "../../Data/RecordData";
import './DataPoints.css';
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import {recordStatusList} from "../../Data/Schemas";
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";
import {BoldTypography, DraggableFAB} from "../common";
import {columnWidthMap, PlainTable, TopStickyRow} from './PlainTable'
import { Input, Select } from 'antd';
import { ConfigProvider, theme } from 'antd';
const { Option } = Select;

export async function loader() {
    let programs = await getPrograms();
    programs = Object.values(programs).flat().filter(program => program.Applicants.length > 0);
    const recordIDs = programs.map(program => program.Applicants.map(applicant => applicant + "|" + program.ProgramID)).flat();
    let records = Object.values(await getRecordByRecordIDs(recordIDs));
    const programIDs = programs.map(program => program.ProgramID);
    records = records.sort((a, b) => {
        return programIDs.indexOf(a.ProgramID) - programIDs.indexOf(b.ProgramID);
    });
    return {records};
}

export async function action() {
    let programs = await getPrograms(true);
    programs = Object.values(programs).flat().filter(program => program.Applicants.length > 0);
    const recordIDs = programs.map(program => program.Applicants.map(applicant => applicant + "|" + program.ProgramID)).flat();
    await getRecordByRecordIDs(recordIDs, true);
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

// 高效的搜索过滤器，替代原有PrimeReact过滤器
function SearchFilter({ onFilterChange }) {
    const [filters, setFilters] = useState({
        applicant: '',
        program: '',
        status: '',
        final: null,
        season: ''
    });
    const searchDebounceRef = useRef(null);

    // 添加防抖函数提高搜索性能
    const handleFilterChange = useCallback((name, value) => {
        setFilters(prev => {
            const newFilters = {...prev, [name]: value};

            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }

            searchDebounceRef.current = setTimeout(() => {
                // 直接将过滤条件传递给父组件的索引搜索函数
                onFilterChange(newFilters);
            }, 200); // 从300ms减少到200ms提高响应速度

            return newFilters;
        });
    }, [onFilterChange]);

    const theme1 = useTheme();
    const isDark = theme1.palette.mode === 'dark';

    return (
        <div className="filter-container">
            {/* Using antd's Input and Select elements */}
            {/* "ConfigProvider" is used for antd's light/dark mode */}
            <ConfigProvider theme={{algorithm: isDark ? theme.darkAlgorithm : theme.compactAlgorithm}} >
                {/* 搜索申请人 */}
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

                {/* 搜索申请项目 */}
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

                {/* 申请结果 */}
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

                {/* 最终去向 */}
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

                {/* 搜索申请季 */}
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

    // 使用useState和useMemo优化搜索性能
    const [filteredRecords, setFilteredRecords] = useState(records);
    const [isSearching, setIsSearching] = useState(false);

    // 按照申请季排序之后的records
    // 排序方式: 申请学期年份越大越靠前, 相同年份Fall比Spring靠前
    const [sortedFilteredRecords, setSortedFilteredRecords] = useState(records);

    /**
     * @typedef {Object} Filter
     * @property {string} applicant
     * @property {string} program
     * @property {'Admit' | 'Reject' | 'Waitlist' | 'Defer' | ''} status
     * @property {boolean | null} final
     * @property {string} season
     */

    /** @param {Filter} filter */
    const handleSearch = (filter) => {
        setIsSearching(true)

        setTimeout(() => {
            const filteredRecords = records.filter((record) => {
                // status和final这两项是精确匹配
                if (filter.status && record.Status !== filter.status)
                    return false;
                if (filter.final !== null && record.Final !== filter.final)
                    return false;
                // applicant, program, season 这三项是"字符串包含"匹配
                if (filter.applicant && !record.ApplicantID.toLowerCase().includes(filter.applicant.toLowerCase()))
                    return false;
                if (filter.program && !record.ProgramID.toLowerCase().includes(filter.program.toLowerCase()))
                    return false;
                if (filter.season &&
                    // 这么写是为了让 "2023Fall" 和 "2023 Fall" (注意空格)等多种输入格式都能得到匹配
                    !(`${record.Season} ${record.ProgramYear}${record.Semester}`).toLowerCase().includes(filter.season.toLowerCase())) {
                    return false;
                }
                return true;
            })
            setFilteredRecords(filteredRecords)
            setIsSearching(false)
        }, 0)
    }

    /**
     * 将records按照申请季排序. 年份越大越靠前, 相同年份Fall比Spring靠前
     *
     * @param {RecordData[]} records The input RecordData list
     * @return {RecordData[]} RecordData list sorted by Semester
     */
    function sortRecords(records) {
        // Sort records by program (already sorted) and then by semester (newer semesters appears first)

        /** @var {RecordData[]} newRecords */
        let newRecords = []
        /** @var {RecordData[]} currentProgramRecords */
        let currentProgramRecords = []
        let currentProgramID = '';

        const semesterNum = (semester) => {
            switch (semester) {
                case "Fall": { return 2 }
                case "Spring": { return 1 }
                default: { return 0 }
            }
        }

        records.forEach((r) => {
            if (currentProgramID !== r.ProgramID) {
                currentProgramRecords.sort((a, b) => (
                    a.ProgramYear === b.ProgramYear ?
                        semesterNum(b.Semester) - semesterNum(a.Semester) :
                        b.ProgramYear - a.ProgramYear
                ));
                currentProgramRecords.forEach((r) => newRecords.push(r))
                currentProgramRecords = []
                currentProgramID = r.ProgramID
            }
            currentProgramRecords.push(r)
        })
        currentProgramRecords.sort((a, b) => (
            a.ProgramYear === b.ProgramYear ?
                semesterNum(b.Semester) - semesterNum(a.Semester) :
                b.ProgramYear - a.ProgramYear
        ));
        currentProgramRecords.forEach((r) => newRecords.push(r))

        return newRecords;
    }

    useEffect(() => {
        setSortedFilteredRecords(sortRecords(filteredRecords));
    }, [filteredRecords])

    useEffect(() => {
        if (insideProgramPage)
            setFilteredRecords(records);
    }, [insideProgramPage, records]);

    return (
        <div className="data-grid-container">
            <ThemeSwitcherProvider defaultTheme={theme.palette.mode} themeMap={themeMap} style={{width: '70%'}}>
                <Paper
                    elevation={0}
                    sx={{
                        overflow: 'hidden',
                        maxWidth: '100%',
                    }}
                >
                    <div style={{
                        height: insideProgramPage ? '100%' : 'calc(100vh - 120px)',
                        overflowX: 'scroll',
                        overflowY: 'hidden',
                    }}>
                        <TopStickyRow
                            filterElem={insideProgramPage || <SearchFilter onFilterChange={handleSearch}/>}
                            insideProgramPage={insideProgramPage}
                        />
                        {isSearching ? (
                            <></>
                        ) : (
                            <PlainTable
                                records={sortedFilteredRecords}
                                insideProgramPage={insideProgramPage}
                            />
                        )}
                    </div>

                </Paper>
                <div className="search-results-indicator" style={{textAlign: 'center'}} >
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

const FloatingControls = () => (
    /* Refresh FAB */
    <Form method="post" className="refresh-button">
        <DraggableFAB
            Icon={<Refresh/>}
            ActionType="Refresh"
            ButtonClassName="HiddenRefreshButton"
            color="primary"
            tooltipTitle="刷新表格"
        />
    </Form>
)

export default function DataPoints() {
    const loaderRecords = useLoaderData();
    const records = loaderRecords.records.map(record => {
        record['Season'] = record.ProgramYear + " " + record.Semester;
        return record;
    });

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
