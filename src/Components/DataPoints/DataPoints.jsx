import {FilterMatchMode, FilterOperator, PrimeReactProvider} from "primereact/api";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByProgram} from "../../Data/RecordData";
import {Link, Outlet, useLoaderData, useNavigate, useParams} from "react-router-dom";
import './DataPoints.css';
import React, {useEffect, useState} from "react";
import {
    Button,
    Chip, Dialog, DialogActions,
    DialogContent,
    IconButton, InputAdornment, Paper, TextField, useTheme,
} from "@mui/material";
import {Check, Close, FilterAltOff, Link as LinkIcon, Search} from "@mui/icons-material";
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import {recordStatusList} from "../../Data/Schemas";
import { MultiSelect } from 'primereact/multiselect';
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";

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
            <DialogActions>
                <IconButton onClick={() => navigate(-1)}>
                    <Close/>
                </IconButton>
            </DialogActions>
            <DialogContent>
                <ProgramContent editable={false}/>
            </DialogContent>
        </Dialog>
    )
}

export default function DataPoints() {
    const {records} = useLoaderData();
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    useEffect(() => {
        initFilters();
    }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            ApplicantID: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
            Status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
            'TimeLine.Submit': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            'TimeLine.Interview': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            'TimeLine.Decision': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            ProgramYear: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            Semester: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            Final: { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    };

    const clearFilter = () => {
        initFilters();
    };

    const theme = useTheme();
    const darkMode = theme.palette.mode === "dark";
    useEffect(() => {
        if (darkMode) {
            require('./TableDark.css');
        } else {
            require('./TableLight.css');
        }
    }, [darkMode]);

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
            // <InlineTypography sx={{fontWeight: 'bold'}}>
            //     {data.ProgramID}
            //     <IconButton component={Link} to={`/programs/${data.ProgramID}`}>
            //         <LinkIcon/>
            //     </IconButton>
            // </InlineTypography>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return <Chip label={rowData.Status} color={getStatusColor(rowData.Status)}/>
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
        return <>{rowData.Final ? <Check/> : null}</>
    };
    const semesterBodyTemplate = (rowData) => {
        return <Chip label={rowData.Semester} color={getSemesterColor(rowData.Semester)}/>
    };
    const timelineBodyTemplate = (rowData, columnBodyOption) => {
        const field = columnBodyOption.field;
        const timelineKey = field.split('.')[1];
        return <>
            {rowData.TimeLine[timelineKey]?.split('T')[0]}
        </>
    };
    const applicantBodyTemplate = (rowData) => {
        return <Chip
            component={Link}
            to={`/datapoints/applicant/${rowData.ApplicantID}`}
            label={rowData.ApplicantID}
            sx={{cursor: 'pointer'}}
            color='info'
        />
    };

    const programBodyTemplate = (rowData) => {
        return <Chip
            component={Link}
            to={`/datapoints/program/${rowData.ProgramID}`}
            label={rowData.ProgramID}
            sx={{cursor: 'pointer'}}
            color='ochre'
        />
    };

    const renderHeader = () => {
        return (
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button variant='outlined' size='large' endIcon={<FilterAltOff/>} onClick={clearFilter}>Clear Filter</Button>
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
                        let _filters = { ...filters };
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
        <PrimeReactProvider>
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
                scrollHeight="90%"
                rowGroupHeaderTemplate={groupSubheaderTemplate}
                rowHover
                showGridlines
                filters={filters}
                globalFilterFields={['ApplicantID', 'Status', 'Final', 'ProgramYear', 'Semester', 'TimeLine.Decision', 'TimeLine.Interview', 'TimeLine.Submit']}
                emptyMessage="未找到任何匹配内容"
                header={renderHeader}
                className='DataTableStyle'
            >
                <Column field='ApplicantID' header='申请人' body={applicantBodyTemplate} filter filterPlaceholder="Search by Applicant ID"/>
                <Column field='ProgramID' header='申请项目' body={programBodyTemplate}/>
                <Column field='Status' header='申请结果' body={statusBodyTemplate} filter filterElement={statusFilterTemplate}/>
                <Column field='Final' header='最终去向' body={finalBodyTemplate} align='center'/>
                <Column field='ProgramYear' header='申请年份'/>
                <Column field='Semester' header='申请学期' body={semesterBodyTemplate}/>
                <Column field='TimeLine.Decision' header='结果通知时间' body={timelineBodyTemplate}/>
                <Column field='TimeLine.Interview' header='面试时间' body={timelineBodyTemplate}/>
                <Column field='TimeLine.Submit' header='网申提交时间' body={timelineBodyTemplate}/>
                <Column field='Detail' header='备注、补充说明'/>
            </DataTable>
            <Outlet/>
        </PrimeReactProvider>
    )
}