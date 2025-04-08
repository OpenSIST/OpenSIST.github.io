import {FilterMatchMode, FilterService} from "primereact/api";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByRecordIDs} from "../../Data/RecordData";
import {Form, Outlet, redirect, useLoaderData, useNavigate, useParams} from "react-router-dom";
import './DataPoints.css';
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary, Button,
    Chip, Dialog, DialogActions, DialogContent, 
    IconButton, InputAdornment, MenuItem, Paper, 
    Select, TextField, Tooltip, useTheme,
} from "@mui/material";
import {
    Check,
    Close,
    ExpandMore,
    Explore,
    NavigateNext,
    Refresh,
    Search,
    FilterAlt,
    FilterAltOff,
} from "@mui/icons-material";
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import {recordStatusList, RecordStatusPalette, SemesterPalette} from "../../Data/Schemas";
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {BoldTypography, DraggableFAB, InlineTypography} from "../common";
import {ThemeSwitcherProvider} from 'react-css-theme-switcher';
import {TriStateCheckbox} from 'primereact/tristatecheckbox';
import {Dropdown} from "primereact/dropdown";
import ControlPointIcon from '@mui/icons-material/ControlPoint';

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
    const [expanded, setExpanded] = useState(true); // 控制搜索面板的折叠状态
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
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
            const newFilters = { ...prev, [name]: value };
            
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
            <Paper 
                elevation={0} 
                className={`advanced-search-filter ${expanded ? 'expanded' : 'collapsed'}`}
                sx={{
                    p: expanded ? 2 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    bgcolor: isDarkMode 
                        ? 'rgba(30, 30, 30, 0.85)' 
                        : 'rgba(245, 245, 245, 0.95)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    maxHeight: expanded ? '500px' : '60px', // 控制折叠高度
                }}
                onClick={() => !expanded && setExpanded(true)}
            >
                <div className="filter-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconButton 
                            size="small" 
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                            sx={{
                                bgcolor: expanded ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                                '&:hover': {
                                    bgcolor: expanded ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.08)',
                                }
                            }}
                        >
                            {expanded ? <ExpandMore /> : <NavigateNext />}
                        </IconButton>
                        <InlineTypography>
                            <FilterAlt fontSize="small" 
                                sx={{ 
                                    color: activeFiltersCount > 0 
                                        ? theme.palette.primary.main 
                                        : 'inherit' 
                                }}
                            />
                            <BoldTypography variant="subtitle1">
                                高级搜索
                                {activeFiltersCount > 0 && (
                                    <Chip 
                                        size="small" 
                                        label={activeFiltersCount} 
                                        color="primary" 
                                        sx={{ ml: 1, height: '20px', minWidth: '20px' }} 
                                    />
                                )}
                            </BoldTypography>
                        </InlineTypography>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {activeFiltersCount > 0 && (
                            <Tooltip title="重置所有过滤器">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        resetFilters();
                                    }} 
                                    color="primary"
                                >
                                    <FilterAltOff fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                </div>
                
                {expanded && (
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
                                            <Search fontSize="small" />
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
                                            <Search fontSize="small" />
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
                                        return <span style={{ color: 'gray' }}>申请结果</span>;
                                    }
                                    return (
                                        <Chip
                                            label={selected}
                                            color={RecordStatusPalette[selected]}
                                            size="small"
                                        />
                                    );
                                }}
                                sx={{ minWidth: '120px', flex: '0 0 auto' }}
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
                                        return <span style={{ color: 'gray' }}>最终去向</span>;
                                    }
                                    return selected === "true" ? "已确认" : "未确认";
                                }}
                                sx={{ minWidth: '120px', flex: '0 0 auto' }}
                            >
                                <MenuItem value="">
                                    <em>全部</em>
                                </MenuItem>
                                <MenuItem value="true">已确认</MenuItem>
                                <MenuItem value="false">未确认</MenuItem>
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
                                            <Search fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                    </div>
                )}
            </Paper>
            
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
                            startIcon={<FilterAltOff />}
                        >
                            清除过滤器
                        </Button>
                    ) : null}
                </div>
            )}
        </>
    );
}

export function DataGrid({records, insideProgramPage, style = {}}) {
    const navigate = useNavigate();
    const theme = useTheme();
    const themeMap = {
        light: "/TableLight.css",
        dark: "/TableDark.css"
    };

    // 使用useState和useMemo优化搜索性能
    const [filteredRecords, setFilteredRecords] = useState(records);
    const [isSearching, setIsSearching] = useState(false);

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

    // 组件加载时初始化过滤数据
    useEffect(() => {
        setFilteredRecords(records);
    }, [records]);

    const groupSubheaderTemplate = (data) => {
        return (
            <InlineTypography component='span' sx={{gap: '0.5rem'}}>
                <BoldTypography sx={{fontSize: 'clamp(14px, 1.5vw, 16px)'}}>{data.ProgramID}</BoldTypography>
                <Tooltip title="添加申请记录" arrow>
                    <ControlPointIcon fontSize='0.5rem' onClick={() => navigate(`/profile/new-record`, {
                        state: {
                            programID: data.ProgramID,
                            from: window.location.pathname
                        }
                    })} sx={{
                        cursor: 'pointer',
                        "&:hover": {color: (theme) => theme.palette.mode === "dark" ? "#a1a1a1" : "#6b6b6b"}
                    }}/>
                </Tooltip>
            </InlineTypography>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return <Chip
            label={rowData.Status}
            color={RecordStatusPalette[rowData.Status]}
            sx={{height: '1.6rem', width: '4.5rem'}}
        />
    };

    const finalBodyTemplate = (rowData) => {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {rowData.Final ? <Check color='success' fontSize='small'/> : null}
        </div>
    };
    
    const semesterBodyTemplate = (rowData) => {
        return <Chip
            label={`${rowData.ProgramYear}${rowData.Semester}`}
            color={SemesterPalette[rowData.Semester]}
            sx={{height: '1.6rem', width: '6rem'}}
        />
    };
    
    const timelineBodyTemplate = (rowData, columnBodyOption) => {
        const field = columnBodyOption.field;
        const timelineKey = field.split('.')[1];
        return <div style={{fontSize: 'clamp(11px, 1.5vw, 14px)'}}>
            {rowData.TimeLine[timelineKey]?.split('T')[0]}
        </div>
    };
    
    const applicantBodyTemplate = (rowData) => {
        return (
            <Tooltip title='查看申请人信息' arrow>
                <Chip
                    label={rowData.ApplicantID}
                    sx={{
                        maxWidth: "8rem",
                        height: '1.6rem'
                    }}
                    onClick={() => navigate(`/datapoints/applicant/${rowData.ApplicantID}`)}
                />
            </Tooltip>
        )
    };

    const programBodyTemplate = (rowData) => {
        return (
            <Tooltip title='查看项目描述' arrow>
                <Chip
                    label={rowData.ProgramID}
                    sx={{
                        maxWidth: "9rem",
                        height: '1.6rem'
                    }}
                    onClick={() => navigate(`/datapoints/program/${encodeURIComponent(rowData.ProgramID)}`)}
                />
            </Tooltip>
        )
    };

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
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <DataTable
                            value={filteredRecords}
                            dataKey="RecordID"
                            rowGroupMode={insideProgramPage ? null : "subheader"}
                            groupRowsBy="ProgramID"
                            sortMode='multiple'
                            multiSortMeta={[{field: 'ProgramID', order: 0}, {field: 'Season', order: -1}]}
                            size='small'
                            scrollable
                            scrollHeight="calc(100vh - 280px)" // 留出足够空间给搜索面板
                            rowGroupHeaderTemplate={groupSubheaderTemplate}
                            rowHover
                            paginator={insideProgramPage ? null : true}
                            paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first}~{last} of {totalRecords}"
                            rows={insideProgramPage ? null : 20}
                            emptyMessage={insideProgramPage ? "该项目暂无申请记录" : "未找到任何匹配内容"}
                            className='DataTableStyle'
                            style={{...style, fontSize: 'clamp(14px, 1.5vw, 16px)'}}
                        >
                            <Column
                                field='ApplicantID'
                                header='申请人'
                                body={applicantBodyTemplate}
                                className="ApplicantIDColumn"
                                style={{minWidth: '10rem'}}
                            />
                            {insideProgramPage ? null : <Column
                                field='ProgramID'
                                header='申请项目'
                                body={programBodyTemplate}
                                className="ProgramIDColumn"
                                style={{minWidth: '10rem'}}
                            />}
                            <Column
                                field='Status'
                                header='申请结果'
                                body={statusBodyTemplate}
                                className="StatusColumn"
                                style={{minWidth: '8rem'}}
                            />
                            <Column
                                field='Final'
                                header='最终去向'
                                body={finalBodyTemplate}
                                dataType="boolean"
                                align='center'
                                className="FinalColumn"
                                style={{minWidth: '8rem'}}
                            />
                            <Column
                                field='Season'
                                header='申请季'
                                body={semesterBodyTemplate}
                                className="SeasonColumn"
                                style={{minWidth: '8rem'}}
                            />
                            <Column
                                field='TimeLine.Decision'
                                header='结果通知时间'
                                body={timelineBodyTemplate}
                                style={{minWidth: '8rem'}}
                            />
                            <Column
                                field='TimeLine.Interview'
                                header='面试时间'
                                body={timelineBodyTemplate}
                                style={{minWidth: '8rem'}}
                            />
                            <Column
                                field='TimeLine.Submit'
                                header='网申提交时间'
                                body={timelineBodyTemplate}
                                style={{minWidth: '8rem'}}
                            />
                            <Column
                                field='Detail'
                                header='备注、补充说明等'
                                bodyStyle={{fontSize: 'clamp(11px, 1.5vw, 14px)'}}
                                style={{width: '25rem', minWidth: '15rem'}}
                            />
                        </DataTable>
                    </Paper>
                )}
            </ThemeSwitcherProvider>
        </div>
    )
}

function UsageGuidance() {
    return (
        <Accordion sx={{bgcolor: '#448aff1a'}} disableGutters>
            <AccordionSummary
                expandIcon={<ArrowDropDownIcon/>}
            >
                <InlineTypography>
                    <Explore/> 请先阅读使用指南
                </InlineTypography>
            </AccordionSummary>
            <AccordionDetails>
                <ol>
                    <li>
                        高校的顺序主要参考USNews和CSRankings的排名，每个学校内部的项目按字典序排序，因此<b>任何顺序与项目质量、申请难度并不直接挂钩</b>。
                    </li>
                    <li>
                        <InlineTypography>
                            对于<b>申请人</b>和<b>申请项目</b>这两列，可点击单元格中的药丸查看申请人或项目的详细信息。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography>
                            每个项目分组的标题（也就是项目名）右侧都有一个<ControlPointIcon/>按钮，点击可为该项目添加新的申请记录。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography>
                            使用顶部的<b>高级搜索</b>面板快速筛选数据，搜索功能即时响应，不需点击按钮。点击左侧
                            <NavigateNext style={{fontSize: '1rem', verticalAlign: 'middle'}}/>
                            或
                            <ExpandMore style={{fontSize: '1rem', verticalAlign: 'middle'}}/>
                            按钮可展开或折叠搜索面板。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography>
                            搜索面板会在右上角显示当前激活的过滤器数量<Chip size="small" label="1" sx={{height: '16px', minWidth: '16px', fontSize: '0.7rem'}}/>，
                            也可点击<FilterAltOff style={{fontSize: '1rem', verticalAlign: 'middle'}}/>重置所有过滤条件。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography>
                            在数据量大时，搜索可能需要短暂的处理时间，系统会自动优化搜索速度并缓存结果，使重复搜索更快。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography>
                            表格会每十分钟自动从服务器获取一次最新数据，您也可以可点击右下角<Refresh/>按钮手动获取。
                        </InlineTypography>
                    </li>
                </ol>
            </AccordionDetails>
        </Accordion>
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
                <UsageGuidance />
                <DataGrid records={records} insideProgramPage={false} />
                <Outlet />
            </Paper>
            <Form method="post">
                <DraggableFAB
                    Icon={<Refresh/>}
                    ActionType="Refresh"
                    ButtonClassName="HiddenRefreshButton"
                    color="primary"
                    style={{
                        position: 'fixed',  // 改为固定定位
                        bottom: '40px',     // 从底部增加距离
                        right: "20px",      // 从右侧增加距离
                        zIndex: 20          // 确保在最上层
                    }}
                    tooltipTitle='刷新表格'
                />
            </Form>
        </>
    )
}
