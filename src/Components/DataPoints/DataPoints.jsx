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

    // 创建索引用于快速搜索 - 这是一种优化技术
    const searchIndexes = useRef({
        applicantIndex: new Map(),
        programIndex: new Map(),
        statusIndex: new Map(),
        seasonIndex: new Map()
    });

    // 创建搜索结果缓存
    const searchCache = useRef(new Map());

    // 构建搜索索引以加速搜索
    useEffect(() => {
        // 重置缓存，因为数据已更改
        searchCache.current.clear();

        // 创建新索引
        const newApplicantIndex = new Map();
        const newProgramIndex = new Map();
        const newStatusIndex = new Map();
        const newSeasonIndex = new Map();

        records.forEach((record, idx) => {
            // 索引申请人
            const applicantKey = record.ApplicantID.toLowerCase();
            if (!newApplicantIndex.has(applicantKey)) {
                newApplicantIndex.set(applicantKey, []);
            }
            newApplicantIndex.get(applicantKey).push(idx);

            // 索引项目
            const programKey = record.ProgramID.toLowerCase();
            if (!newProgramIndex.has(programKey)) {
                newProgramIndex.set(programKey, []);
            }
            newProgramIndex.get(programKey).push(idx);

            // 索引状态
            const statusKey = record.Status;
            if (!newStatusIndex.has(statusKey)) {
                newStatusIndex.set(statusKey, []);
            }
            newStatusIndex.get(statusKey).push(idx);

            // 索引申请季
            const seasonKey = `${record.ProgramYear} ${record.Semester}`.toLowerCase();
            if (!newSeasonIndex.has(seasonKey)) {
                newSeasonIndex.set(seasonKey, []);
            }
            newSeasonIndex.get(seasonKey).push(idx);
        });

        searchIndexes.current = {
            applicantIndex: newApplicantIndex,
            programIndex: newProgramIndex,
            statusIndex: newStatusIndex,
            seasonIndex: newSeasonIndex
        };

        setFilteredRecords(records);
    }, [records]);

    // 处理过滤结果的回调 - 使用索引和缓存提升性能
    const handleFilterChange = useCallback((newFilteredRecords) => {
        setIsSearching(true);
        // 使用批处理和异步处理来避免UI阻塞
        setTimeout(() => {
            setFilteredRecords(newFilteredRecords);
            setIsSearching(false);
        }, 0);
    }, []);

    // 高级搜索处理函数 - 使用索引加速搜索
    const handleAdvancedSearch = useCallback((filters) => {
        // 创建缓存键
        const cacheKey = JSON.stringify(filters);

        // 检查缓存
        if (searchCache.current.has(cacheKey)) {
            handleFilterChange(searchCache.current.get(cacheKey));
            return;
        }

        // 如果是空过滤器，则显示所有记录
        if (!filters.applicant && !filters.program && !filters.status &&
            filters.final === null && !filters.season) {
            handleFilterChange(records);
            return;
        }

        // 使用批处理处理搜索
        setIsSearching(true);

        // 异步处理搜索以避免UI阻塞
        setTimeout(() => {
            // 预处理可能的匹配索引
            let potentialMatches;

            // 尝试用最具体的过滤器开始，以尽快缩小搜索范围
            if (filters.status) {
                // 状态过滤是精确匹配，开始效率较高
                potentialMatches = searchIndexes.current.statusIndex.get(filters.status) || [];
            } else if (filters.final !== null) {
                // Final是布尔值，需要全表扫描，但可以提前筛选部分
                potentialMatches = Array.from({length: records.length}, (_, i) => i)
                    .filter(idx => records[idx].Final === filters.final);
            } else if (filters.applicant) {
                // 找出可能包含搜索词的所有申请人
                const applicantSearchKey = filters.applicant.toLowerCase();
                potentialMatches = [];

                // 增量搜索 - 找出所有可能匹配的记录索引
                searchIndexes.current.applicantIndex.forEach((indexes, key) => {
                    if (key.includes(applicantSearchKey)) {
                        potentialMatches.push(...indexes);
                    }
                });
            } else if (filters.program) {
                // 找出可能包含搜索词的所有项目
                const programSearchKey = filters.program.toLowerCase();
                potentialMatches = [];

                searchIndexes.current.programIndex.forEach((indexes, key) => {
                    if (key.includes(programSearchKey)) {
                        potentialMatches.push(...indexes);
                    }
                });
            } else if (filters.season) {
                // 找出可能包含搜索词的所有申请季
                const seasonSearchKey = filters.season.toLowerCase();
                potentialMatches = [];

                searchIndexes.current.seasonIndex.forEach((indexes, key) => {
                    if (key.includes(seasonSearchKey)) {
                        potentialMatches.push(...indexes);
                    }
                });
            } else {
                // 没有过滤器，使用所有记录
                potentialMatches = Array.from({length: records.length}, (_, i) => i);
            }

            // 应用其他过滤器进一步筛选结果
            const filteredIndexes = potentialMatches.filter(idx => {
                const record = records[idx];

                // 筛选申请人
                if (filters.applicant &&
                    !record.ApplicantID.toLowerCase().includes(filters.applicant.toLowerCase())) {
                    return false;
                }

                // 筛选项目
                if (filters.program &&
                    !record.ProgramID.toLowerCase().includes(filters.program.toLowerCase())) {
                    return false;
                }

                // 筛选状态
                if (filters.status && record.Status !== filters.status) {
                    return false;
                }

                // 筛选最终去向
                if (filters.final !== null && record.Final !== filters.final) {
                    return false;
                }

                // 筛选申请季
                if (filters.season &&
                    !(`${record.ProgramYear} ${record.Semester}`).toLowerCase().includes(filters.season.toLowerCase())) {
                    return false;
                }

                return true;
            });

            // 根据索引获取记录
            const finalFilteredRecords = filteredIndexes.map(idx => records[idx]);

            // 存入缓存
            searchCache.current.set(cacheKey, finalFilteredRecords);

            // 更新UI
            handleFilterChange(finalFilteredRecords);
        }, 0);
    }, [records, handleFilterChange]);

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
                case "Fall": {
                    return 2
                }
                case "Spring": {
                    return 1
                }
                default: {
                    return 0
                }
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

    // 组件加载时初始化过滤数据
    useEffect(() => {
        setFilteredRecords(records);
    }, [records]);

    useEffect(() => {
        setSortedFilteredRecords(sortRecords(filteredRecords));
    }, [filteredRecords, records])

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
                            filterElem={insideProgramPage || <SearchFilter onFilterChange={handleAdvancedSearch}/>}
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

function FloatingControls() {
    const [showGuide, setShowGuide] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Add event listener to track window size changes
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Determine if we're on mobile
    const isMobile = windowWidth <= 768;

    const handleToggleGuide = () => {
        setShowGuide(prev => !prev);
    };

    return (
        <>
            {/* Refresh FAB */}
            <Form method="post">
                <DraggableFAB
                    Icon={<Refresh/>}
                    ActionType="Refresh"
                    ButtonClassName="HiddenRefreshButton"
                    color="primary"
                    style={{
                        position: 'fixed',
                        bottom: isMobile ? '20px' : '40px',
                        right: isMobile ? '16px' : '20px',
                        zIndex: 20,
                        transform: isMobile ? 'scale(0.9)' : 'none',
                    }}
                    tooltipTitle="刷新表格"
                />
            </Form>
        </>
    );
}


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
                    // padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    // gap: '16px'
                }}
            >
                <DataGrid records={records} insideProgramPage={false}/>
                <Outlet/>
            </Paper>
            <FloatingControls/>
        </div>
    )
}
