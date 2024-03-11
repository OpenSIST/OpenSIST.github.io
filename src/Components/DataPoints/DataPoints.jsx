import {FilterMatchMode, FilterService} from "primereact/api";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByRecordIDs} from "../../Data/RecordData";
import {Form, Outlet, redirect, useLoaderData, useNavigate, useParams} from "react-router-dom";
import './DataPoints.css';
import React, {useEffect, useRef, useState} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Chip, Dialog, DialogActions,
    DialogContent, Fab,
    IconButton, Paper, Tooltip, Typography, useTheme,
} from "@mui/material";
import {Check, Close, Explore, FilterAltOff, OpenInFull, Refresh} from "@mui/icons-material";
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import {recordStatusList} from "../../Data/Schemas";
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {InlineTypography} from "../common";
import {ThemeSwitcherProvider} from 'react-css-theme-switcher';
import {TriStateCheckbox} from 'primereact/tristatecheckbox';
import {Dropdown} from "primereact/dropdown";
import Draggable from "react-draggable";

export async function loader() {
    // console.time("DataPointsLoader")
    let programs = await getPrograms();
    programs = Object.values(programs).flat().filter(program => program.Applicants.length > 0);
    const recordIDs = programs.map(program => program.Applicants.map(applicant => applicant + "|" + program.ProgramID)).flat();
    let records = Object.values(await getRecordByRecordIDs(recordIDs));
    records = records.map(record => {
        record['Season'] = record.ProgramYear + " " + record.Semester;
        return record;
    });
    programs = programs.map(program => program.ProgramID);
    records = records.sort((a, b) => {
        return programs.indexOf(a.ProgramID) - programs.indexOf(b.ProgramID);
    });

    // console.timeEnd("DataPointsLoader")
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
            onClose={() => navigate(-1)}
            fullWidth
            maxWidth={'xl'}
            sx={{userSelect: 'text'}}
        >
            <DialogActions>
                <IconButton onClick={() => navigate(-1)}>
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
            onClose={() => navigate(-1)}
            fullWidth
            maxWidth={'xl'}
            sx={{userSelect: 'text'}}
        >
            <DialogContent>
                <ProgramContent editable={false}/>
            </DialogContent>
        </Dialog>
    )
}

export default function DataPoints() {
    const {records} = useLoaderData();
    const navigate = useNavigate();
    const [filters, setFilters] = useState(null);
    useEffect(() => {
        initFilters();
    }, []);

    const initFilters = () => {
        setFilters({
            global: {value: null, matchMode: FilterMatchMode.CONTAINS},
            ApplicantID: {value: null, matchMode: FilterMatchMode.CONTAINS},
            ProgramID: {value: null, matchMode: FilterMatchMode.CONTAINS},
            Status: {value: null, matchMode: FilterMatchMode.EQUALS},
            Season: {value: null, matchMode: FilterMatchMode.CUSTOM},
            Final: {value: null, matchMode: FilterMatchMode.EQUALS}
        });
    };

    const theme = useTheme();
    const themeMap = {
        light: "./TableLight.css",
        dark: "./TableDark.css"
    }
    const getStatusColor = (status) => {
        switch (status) {
            case 'Reject':
                return 'error';
            case 'Admit':
                return 'success';
            case 'Waitlist':
                return "default";
            case 'Defer':
                return 'warning';
            default:
                return null;
        }
    };
    const getSemesterColor = (semester) => {
        switch (semester) {
            case 'Fall':
                return 'warning';
            case 'Spring':
                return 'success';
            case 'Winter':
                return 'primary';
            case 'Summer':
                return 'secondary';
            default:
                return null;
        }
    }
    const groupSubheaderTemplate = (data) => {
        return (
            <b>{data.ProgramID}</b>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return <Chip label={rowData.Status} color={getStatusColor(rowData.Status)}/>
    };

    const statusFilterItemTemplate = (option) => {
        return <Chip label={option} color={getStatusColor(option)}/>
    };

    const statusFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={recordStatusList}
                onChange={(e) => options.filterApplyCallback(e.value)}
                itemTemplate={statusFilterItemTemplate}
                className="p-column-filter"
                showClear
            />
        );
    };

    const finalBodyTemplate = (rowData) => {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {rowData.Final ? <Check color='success'/> : null}
        </div>
    };
    const programPeriodBodyTemplate = (rowData) => {
        return <Chip label={`${rowData.ProgramYear} ${rowData.Semester}`} color={getSemesterColor(rowData.Semester)}/>
    };
    const timelineBodyTemplate = (rowData, columnBodyOption) => {
        const field = columnBodyOption.field;
        const timelineKey = field.split('.')[1];
        return <>
            {rowData.TimeLine[timelineKey]?.split('T')[0]}
        </>
    };
    const applicantBodyTemplate = (rowData) => {
        return (
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Tooltip title={rowData.ApplicantID} arrow>
                    <Chip label={rowData.ApplicantID} sx={{maxWidth: "8rem"}}/>
                </Tooltip>
                <Tooltip title='查看申请人信息' arrow>
                    <IconButton onClick={() => navigate(`/datapoints/applicant/${rowData.ApplicantID}`)}>
                        <OpenInFull sx={{fontSize: "0.8rem"}}/>
                    </IconButton>
                </Tooltip>
            </div>
        )
    };

    const programBodyTemplate = (rowData) => {
        return <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Tooltip title={rowData.ProgramID} arrow>
                <Chip label={rowData.ProgramID} sx={{maxWidth: "9rem"}}/>
            </Tooltip>
            <Tooltip title='查看项目描述' arrow>
                <IconButton onClick={() => navigate(`/datapoints/program/${rowData.ProgramID}`)}>
                    <OpenInFull sx={{fontSize: "0.8rem"}}/>
                </IconButton>
            </Tooltip>
        </div>
    };

    const FinalRowFilterTemplate = (options) => {
        // return <Checkbox onChange={(e) => options.filterApplyCallback(e.checked)} checked={options.value}/>;
        return <TriStateCheckbox onChange={(e) => options.filterApplyCallback(e.value)} value={options.value}/>
    };

    FilterService.register('custom_Season', (value, filters) => {
        if (!filters) {
            return true;
        }
        filters = filters.replace(/\s/g, "").toLowerCase();
        value = value.replace(/\s/g, "").toLowerCase();
        return value.includes(filters);
    })

    const nodeRef = useRef(null);

    return (
        <ThemeSwitcherProvider defaultTheme={theme.palette.mode} themeMap={themeMap}>
            <Paper className="DataPointsContent">
                <UsageGuidance/>
                <DataTable
                    value={records}
                    dataKey='RecordID'
                    rowGroupMode="subheader"
                    groupRowsBy="ProgramID"
                    sortMode='multiple'
                    multiSortMeta={[{field: 'ProgramID', order: 0}, {field: 'Season', order: -1}]}
                    size='small'
                    scrollable
                    scrollHeight="100%"
                    rowGroupHeaderTemplate={groupSubheaderTemplate}
                    rowHover
                    showGridlines
                    filters={filters}
                    filterDisplay='row'
                    emptyMessage="未找到任何匹配内容"
                    className='DataTableStyle'
                >
                    <Column
                        field='ApplicantID'
                        header='申请人'
                        body={applicantBodyTemplate}
                        filter
                        align='center'
                        filterPlaceholder="搜索申请人"
                        className="ApplicantIDColumn"
                        style={{width: '10rem'}}
                    />
                    <Column
                        field='ProgramID'
                        header='申请项目'
                        body={programBodyTemplate}
                        align='center'
                        filter
                        filterPlaceholder="搜索项目"
                        className="ProgramIDColumn"
                        style={{width: '12rem'}}
                    />
                    <Column
                        field='Status'
                        header='申请结果'
                        body={statusBodyTemplate}
                        align='center'
                        filter
                        filterElement={statusFilterTemplate}
                        className="StatusColumn"
                        style={{width: '6rem'}}
                    />
                    <Column
                        field='Final'
                        header='最终去向'
                        body={finalBodyTemplate}
                        dataType="boolean"
                        filter
                        align='center'
                        filterElement={FinalRowFilterTemplate}
                        className="FinalColumn"
                        style={{minWidth: '6rem'}}
                    />
                    <Column
                        field='Season'
                        header='申请季'
                        filter
                        align='center'
                        filterPlaceholder="搜索申请季"
                        body={programPeriodBodyTemplate}
                        className="SeasonColumn"
                        style={{minWidth: '8rem'}}
                    />
                    <Column
                        field='TimeLine.Decision'
                        header='结果通知时间'
                        align='center'
                        body={timelineBodyTemplate}
                        style={{minWidth: '9rem'}}
                    />
                    <Column
                        field='TimeLine.Interview'
                        header='面试时间'
                        align='center'
                        body={timelineBodyTemplate}
                        style={{minWidth: '8rem'}}
                    />
                    <Column
                        field='TimeLine.Submit'
                        header='网申提交时间'
                        align='center'
                        body={timelineBodyTemplate}
                        style={{minWidth: '9rem'}}
                    />
                    <Column
                        field='Detail'
                        header='备注、补充说明等'
                        style={{width: '25rem', minWidth: '15rem'}}
                    />
                </DataTable>
                <Outlet/>
            </Paper>
            <Form method='post' style={{position: 'absolute', bottom: '1rem', right: "1rem"}}>
                <Draggable nodeRef={nodeRef} cancel=".dfsd">
                    <Tooltip title="刷新表格" arrow ref={nodeRef} id="FAB">
                        <Fab type='submit' color='primary'>
                            <Refresh className="dfsd"/>
                        </Fab>
                    </Tooltip>
                </Draggable>
            </Form>
        </ThemeSwitcherProvider>

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
                        <InlineTypography>
                            对于<b>申请人</b>和<b>申请项目</b>这两列，可点击单元格右侧<OpenInFull sx={{fontSize: "1rem"}}/>按钮查看申请人或项目的详细信息。
                        </InlineTypography>
                    </li>
                    <li>本页面为只读模式，想要编辑自己的申请人信息或添加/删除/修改所申请的项目，请点击右上角头像下拉菜单中Profile页面编辑相应信息。</li>
                    <li>
                        <InlineTypography>
                            可通过表格上部的filter来进行关键信息筛选。可点击左上角<FilterAltOff/>按钮重置所有筛选。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography>
                            表格会每十分钟自动从服务器获取一次最新数据，您也可以可点击左上角<Refresh/>按钮手动获取。
                        </InlineTypography>
                    </li>
                </ol>
            </AccordionDetails>
        </Accordion>
    );
}