import {getPrograms} from "../../Data/ProgramData";
import {getRecordByRecordIDs} from "../../Data/RecordData";
import {Form, Outlet, redirect, useLoaderData, useNavigate, useParams} from "react-router-dom";
import './DataPoints.css';
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Box, Button,
    Chip, Dialog, DialogActions, DialogContent, Fade,
    IconButton, InputAdornment, MenuItem, Paper,
    Select, TextField, Tooltip, useTheme
} from "@mui/material";
import {
    Check,
    Close,
    Explore,
    Refresh,
    Search,
    FilterAltOff,
    QuestionMark,
} from "@mui/icons-material";
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import {recordStatusList, RecordStatusPalette, SemesterPalette} from "../../Data/Schemas";
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";
import {BoldTypography, DraggableFAB, InlineTypography} from "../common";
import {ThemeSwitcherProvider} from 'react-css-theme-switcher';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { PlainTable } from './PlainTable'

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
function AdvancedSearchFilter({
                                  records,
                                  onFilterChange,
                                  insideProgramPage,
                                  filteredCount = 0,
                                  totalCount = 0
                              }) {
    const [filters, setFilters] = useState({
        applicant: '',
        program: '',
        status: '',
        final: null,
        season: ''
    });
    const searchDebounceRef = useRef(null);
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.applicant) count++;
        if (filters.program) count++;
        if (filters.status) count++;
        if (filters.final !== null) count++;
        if (filters.season) count++;
        return count;
    }, [filters]);

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

    // 重置所有过滤器
    const resetFilters = () => {
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        setFilters({
            applicant: '',
            program: '',
            status: '',
            final: null,
            season: ''
        });

        // 使用空过滤器触发搜索重置
        onFilterChange({
            applicant: '',
            program: '',
            status: '',
            final: null,
            season: ''
        });
    };

    // 如果在程序页面内，则不显示搜索过滤器
    if (insideProgramPage) {
        return null;
    }

    return (
        <>
            <div className="filter-container-wrapper">
                <div className="filter-container">
                    <TextField
                        label="申请人"
                        size="small"
                        value={filters.applicant}
                        onChange={(e) => handleFilterChange('applicant', e.target.value)}
                        placeholder="搜索申请人"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small"/>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="申请项目"
                        size="small"
                        value={filters.program}
                        onChange={(e) => handleFilterChange('program', e.target.value)}
                        placeholder="搜索项目"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small"/>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Select
                        size="small"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        displayEmpty
                        renderValue={selected => {
                            if (!selected) {
                                return <span style={{color: 'gray'}}>申请结果</span>;
                            }
                            return (
                                <Chip
                                    label={selected}
                                    color={RecordStatusPalette[selected]}
                                    size="small"
                                />
                            );
                        }}
                        sx={{minWidth: '120px', flex: '0 0 auto'}}
                    >
                        <MenuItem value="">
                            <em>所有结果</em>
                        </MenuItem>
                        {recordStatusList.map(status => (
                            <MenuItem key={status} value={status}>
                                <Chip
                                    label={status}
                                    color={RecordStatusPalette[status]}
                                    size="small"
                                />
                            </MenuItem>
                        ))}
                    </Select>

                    <Select
                        size="small"
                        value={filters.final === null ? "" : filters.final ? "true" : "false"}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleFilterChange('final', value === "" ? null : value === "true");
                        }}
                        displayEmpty
                        renderValue={selected => {
                            if (selected === "") {
                                return <span style={{color: 'gray'}}>最终去向</span>;
                            }
                            return selected === "true" ? "已确认" : "未确认";
                        }}
                        sx={{minWidth: '120px', flex: '0 0 auto'}}
                    >
                        <MenuItem value="">
                            <em>全部</em>
                        </MenuItem>
                        <MenuItem value="true">是</MenuItem>
                        <MenuItem value="false">否</MenuItem>
                    </Select>

                    <TextField
                        label="申请季"
                        size="small"
                        value={filters.season}
                        onChange={(e) => handleFilterChange('season', e.target.value)}
                        placeholder="如: 2023 Fall"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small"/>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Tooltip title="重置所有过滤器">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                resetFilters();
                            }}
                            color="primary"
                        >
                            <FilterAltOff fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* 搜索结果统计指示器 */}
            {activeFiltersCount > 0 && filteredCount !== totalCount && (
                <div className="search-results-indicator">
                    <BoldTypography variant="body2">
                        已找到 <b>{filteredCount}</b> 条记录 (共 {totalCount} 条)
                    </BoldTypography>

                    {filteredCount === 0 ? (
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={resetFilters}
                            startIcon={<FilterAltOff/>}
                        >
                            清除过滤器
                        </Button>
                    ) : null}
                </div>
            )}
        </>
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
    const navigate = useNavigate();
    const theme = useTheme();
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
                case "Fall": {return 2}
                case "Spring": {return 1}
                default: {return 0}
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
            <AdvancedSearchFilter
                records={records}
                onFilterChange={handleAdvancedSearch}
                insideProgramPage={insideProgramPage}
                filteredCount={filteredRecords.length}
                totalCount={records.length}
            />
            <ThemeSwitcherProvider defaultTheme={theme.palette.mode} themeMap={themeMap}>
                {isSearching ? (
                    <Paper
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(245, 245, 245, 0.9)',
                            borderRadius: '8px',
                            marginBottom: '16px'
                        }}
                    >
                        <BoldTypography>
                            正在搜索中...
                        </BoldTypography>
                    </Paper>
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '12px',
                            overflow: 'scroll',
                            maxWidth: '100%',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div style={{ height: insideProgramPage? '35vh': 'calc(100vh - 180px)' }}>
                            <PlainTable records={sortedFilteredRecords} insideProgramPage={insideProgramPage} />
                        </div>
                    </Paper>
                )}
            </ThemeSwitcherProvider>
        </div>
    )
}

function UsageGuidance() {
    // Use window size hook to determine responsive layout
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    
    // Add event listener to track window size changes
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    // Determine if we're on mobile - check width
    const isMobile = windowSize.width <= 768;
    
    // Calculate appropriate max height based on screen dimensions
    const maxHeightValue = Math.min(windowSize.height * 0.6, 500);
    
    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: isMobile ? 90 : 24,
                right: isMobile ? 16 : 80,
                left: isMobile ? 16 : 'auto',
                width: isMobile ? 'auto' : 500,
                maxHeight: `${maxHeightValue}px`,
                zIndex: 25,
            }}
        >
            <Paper 
                elevation={6} 
                sx={{
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    px: isMobile ? 2 : 3, 
                    py: 2,
                    overflowY: 'auto',
                    maxHeight: isMobile ? `${Math.min(maxHeightValue - 20, windowSize.height - 150)}px` : 'none',
                    position: 'relative',
                    '&::after': isMobile ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40px',
                        background: (theme) => 
                            theme.palette.mode === 'dark' 
                                ? 'linear-gradient(to top, rgba(18,18,18,0.8), rgba(18,18,18,0))' 
                                : 'linear-gradient(to top, rgba(255,255,255,0.8), rgba(255,255,255,0))',
                        pointerEvents: 'none',
                        zIndex: 5
                    } : {}
                }}
            >
                <InlineTypography sx={{
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    fontSize: isMobile ? '15px' : 'inherit',
                    fontWeight: 'bold'
                }}>
                    <Explore sx={{mr: 0.5, fontSize: isMobile ? '20px' : '24px'}}/>
                    请先阅读使用指南
                </InlineTypography>
                <ol style={{
                    paddingLeft: isMobile ? 16 : 20, 
                    marginBottom: 0,
                    fontSize: isMobile ? '14px' : 'inherit',
                    lineHeight: isMobile ? 1.4 : 'inherit',
                }}>
                    <li>
                        高校的顺序主要参考USNews和CSRankings的排名，每个学校内部的项目按字典序排序，因此<b>任何顺序与项目质量、申请难度并不直接挂钩</b>。
                    </li>
                    <li>
                        <InlineTypography>
                            对于<b>申请人</b>和<b>申请项目</b>这两列，可点击单元格中的药丸查看申请人或项目的详细信息。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '3px'}}>
                            每个项目分组的标题（也就是项目名）右侧都有一个
                            <ControlPointIcon fontSize="small" sx={{mx: '2px', verticalAlign: 'middle'}}/>
                            按钮，点击可为该项目添加新的申请记录。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography>
                            在数据量大时，搜索可能需要短暂的处理时间，系统会自动优化搜索速度并缓存结果，使重复搜索更快。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '3px'}}>
                            表格会每十分钟自动从服务器获取一次最新数据，您也可以点击右下角<Refresh fontSize="small" sx={{mx: '2px', verticalAlign: 'middle'}}/>
                            按钮手动获取。
                        </InlineTypography>
                    </li>
                </ol>
            </Paper>
        </Box>
    );
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

            {/* Help / Close FAB */}
            <DraggableFAB
                Icon={
                    <>
                        <Fade in={!showGuide} timeout={200} unmountOnExit>
                            <QuestionMark sx={{position: 'absolute'}}/>
                        </Fade>
                        <Fade in={showGuide} timeout={200} unmountOnExit>
                            <Close sx={{position: 'absolute'}}/>
                        </Fade>
                    </>
                }
                ActionType="HelpToggle"
                ButtonClassName="HiddenHelpButton"
                color={showGuide ? "error" : "primary"}
                style={{
                    position: 'fixed',
                    bottom: isMobile ? '80px' : '110px',
                    right: isMobile ? '16px' : '20px',
                    zIndex: 1070,
                    transform: isMobile ? 'scale(1)' : 'none',
                    boxShadow: showGuide ? '0 4px 10px rgba(0, 0, 0, 0.5)' : undefined,
                }}
                tooltipTitle={showGuide ? "关闭指南" : "使用指南"}
                onClick={handleToggleGuide}
            />

            {/* Usage Guidance Panel */}
            <Fade in={showGuide}>
                <div>
                    <UsageGuidance/>
                </div>
            </Fade>
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
        <>
            <Paper
                className="DataPointsContent"
                sx={{
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "#1A1E24" : "#FAFAFA",
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}
            >
                <DataGrid records={records} insideProgramPage={false}/>
                <Outlet/>
            </Paper>
            <FloatingControls/>
        </>
    )
}
