import {FilterMatchMode, FilterOperator} from "primereact/api";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByProgram} from "../../Data/RecordData";
import {Outlet, useLoaderData, useNavigate, useParams} from "react-router-dom";
import './DataPoints.css';
import React, {useEffect, useState} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary, Box,
    Button,
    Chip, Dialog, DialogActions,
    DialogContent,
    IconButton, InputAdornment, Paper, TextField, Tooltip, useTheme,
} from "@mui/material";
import {Check, Close, Explore, FilterAltOff, OpenInFull, Search} from "@mui/icons-material";
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import {recordStatusList} from "../../Data/Schemas";
import {MultiSelect} from 'primereact/multiselect';
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {InlineTypography} from "../common";
import {ThemeSwitcherProvider, useThemeSwitcher} from 'react-css-theme-switcher';
export async function loader() {
    const programs = await getPrograms();
    const programIDs = Object.values(programs).map(program => {
        return program.map(p => p.ProgramID);
    }).flat();
    let records = await Promise.all(programIDs.map(async id => await getRecordByProgram(id)));
    records = records.filter(record => Object.keys(record).length > 0);
    records = records.map(record => {
        return Object.values(record)
    }).flat();
    return {records};
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
    console.log(params)
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
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    useEffect(() => {
        initFilters();
    }, []);

    const initFilters = () => {
        setFilters({
            global: {value: null, matchMode: FilterMatchMode.CONTAINS},
            ApplicantID: {
                operator: FilterOperator.AND,
                constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}]
            },
            ProgramID: {operator: FilterOperator.OR, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}]},
            Status: {operator: FilterOperator.OR, constraints: [{value: null, matchMode: FilterMatchMode.CONTAINS}]},
            'TimeLine.Submit': {
                operator: FilterOperator.AND,
                constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]
            },
            'TimeLine.Interview': {
                operator: FilterOperator.AND,
                constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]
            },
            'TimeLine.Decision': {
                operator: FilterOperator.AND,
                constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}]
            },
            ProgramPeriod: {
                operator: FilterOperator.OR,
                constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}]
            },
            Final: {value: null, matchMode: FilterMatchMode.EQUALS}
        });
        setGlobalFilterValue('');
    };

    const clearFilter = () => {
        initFilters();
    };

    const theme = useTheme();
    const themeMap = {
        light: "/TableLight.css",
        dark: "/TableDark.css"
    };
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
        return <Chip label={rowData.Status} color={getStatusColor(rowData.Status)}
                     sx={{maxWidth: '100px'}}
        />
    };
    const statusFilterTemplate = (options) => {
        return <MultiSelect
            value={options.value}
            options={recordStatusList}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            placeholder="Select Status"
        />;
    };

    const finalBodyTemplate = (rowData) => {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {rowData.Final ? <Check/> : null}
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
                    <Chip label={rowData.ApplicantID} sx={{maxWidth: "100px"}}/>
                </Tooltip>
                <Tooltip title='查看申请人信息' arrow>
                    <IconButton onClick={() => navigate(`/datapoints/applicant/${rowData.ApplicantID}`)}>
                        <OpenInFull fontSize='small'/>
                    </IconButton>
                </Tooltip>
            </div>
        )
    };

    const programBodyTemplate = (rowData) => {
        return <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Tooltip title={rowData.ProgramID} arrow>
                <Chip label={rowData.ProgramID} sx={{maxWidth: "100px"}}/>
            </Tooltip>
            <Tooltip title='查看项目描述' arrow>
                <IconButton onClick={() => navigate(`/datapoints/program/${rowData.ProgramID}`)}>
                    <OpenInFull fontSize='small'/>
                </IconButton>
            </Tooltip>
        </div>
    };

    const renderHeader = () => {
        return (
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button variant='outlined' size='large' endIcon={<FilterAltOff/>} onClick={clearFilter}>Clear
                    Filter</Button>
                <TextField
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search/>
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                    size='small'
                    value={globalFilterValue}
                    onChange={(e) => {
                        const value = e.target.value;
                        let _filters = {...filters};
                        _filters['global'].value = value;
                        setFilters(_filters);
                        setGlobalFilterValue(value);
                    }}
                    label='Global Search'
                />
            </div>
        );
    };

    return (
        <ThemeSwitcherProvider
            defaultTheme={theme.palette.mode}
            themeMap={themeMap}
        >
            <Paper className="DataPointsContent">
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ArrowDropDownIcon/>}
                    >
                        <InlineTypography>
                            <Explore/> 请先阅读使用指南
                        </InlineTypography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <InlineTypography>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                            malesuada lacus ex, sit amet blandit leo lobortis eget.
                        </InlineTypography>
                    </AccordionDetails>
                </Accordion>
                <DataTable
                    value={records}
                    dataKey='RecordID'
                    rowGroupMode="subheader"
                    groupRowsBy="ProgramID"
                    sortMode='single'
                    sortField='ProgramID'
                    sortOrder={1}
                    size='small'
                    scrollable
                    scrollHeight="100%"
                    rowGroupHeaderTemplate={groupSubheaderTemplate}
                    rowHover
                    showGridlines
                    filters={filters}
                    globalFilterFields={['ApplicantID', 'Status', 'Final', 'ProgramYear', 'Semester', 'TimeLine.Decision', 'TimeLine.Interview', 'TimeLine.Submit']}
                    emptyMessage="未找到任何匹配内容"
                    header={renderHeader}
                    className='DataTableStyle'
                >
                    <Column field='ApplicantID' header='申请人' body={applicantBodyTemplate} filter
                            filterPlaceholder="Search by Applicant ID"
                            style={{minWidth: '10rem'}}
                    />
                    <Column field='ProgramID' header='申请项目' body={programBodyTemplate} filter
                            style={{minWidth: '10rem'}}
                    />
                    <Column field='Status' header='申请结果' body={statusBodyTemplate} filter
                            filterElement={statusFilterTemplate}
                            style={{minWidth: '9rem'}}
                    />
                    <Column field='Final' header='最终去向' body={finalBodyTemplate} filter align='center'
                            style={{minWidth: '9rem'}}
                    />
                    <Column field='ProgramPeriod' header='申请季' filter body={programPeriodBodyTemplate}
                            style={{minWidth: '8rem'}}
                    />
                    <Column field='TimeLine.Decision' header='结果通知时间' body={timelineBodyTemplate} filter
                            style={{minWidth: '12rem'}}
                    />
                    <Column field='TimeLine.Interview' header='面试时间' body={timelineBodyTemplate} filter
                            style={{minWidth: '9rem'}}
                    />
                    <Column field='TimeLine.Submit' header='网申提交时间' body={timelineBodyTemplate} filter
                            style={{minWidth: '12rem'}}
                    />
                    <Column field='Detail' header='备注、补充说明'
                            style={{minWidth: '12rem'}}
                    />
                </DataTable>
                <Outlet/>
            </Paper>
        </ThemeSwitcherProvider>
    )
}