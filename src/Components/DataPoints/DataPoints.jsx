import {PrimeReactProvider} from "primereact/api";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByProgram} from "../../Data/RecordData";
import {Link, useLoaderData} from "react-router-dom";
import 'primereact/resources/themes/md-light-indigo/theme.css';
import React from "react";
import {Chip} from "@mui/material";
import {Check} from "@mui/icons-material";

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
    return records;
}

export default function DataPoints() {
    const records = useLoaderData();
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
    const headerTemplate = (data) => {
        return (
            <React.Fragment>
                <span><b>{data.ProgramID}</b></span>
            </React.Fragment>
        );
    };
    const statusBodyTemplate = (rowData) => {
        return <Chip label={rowData.Status} color={getStatusColor(rowData.Status)}/>
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
            {rowData.TimeLine[timelineKey] ? rowData.TimeLine[timelineKey].split('T')[0] : null}
        </>
    };
    const applicantBodyTemplate = (rowData) => {
        return <Link to={`/datapoints/${rowData.ApplicantID}`}>
            <b>{rowData.ApplicantID}</b>
        </Link>
    }

    return (
        <PrimeReactProvider>
            <DataTable
                value={records}
                rowGroupMode="subheader"
                groupRowsBy="ProgramID"
                sortMode='single'
                sortField='ProgramID'
                sortOrder={1}
                size='small'
                showGridlines
                scrollable
                scrollHeight="90%"
                rowGroupHeaderTemplate={headerTemplate}
            >
                <Column field='ApplicantID' header='申请人' body={applicantBodyTemplate} align='center'/>
                <Column field='Status' header='申请结果' body={statusBodyTemplate} align='center'/>
                <Column field='Final' header='最终去向' body={finalBodyTemplate} align='center'/>
                <Column field='ProgramYear' header='申请年份' align='center'/>
                <Column field='Semester' header='申请学期' body={semesterBodyTemplate} align='center'/>
                <Column field='TimeLine.Decision' header='结果通知时间' body={timelineBodyTemplate} align='center'/>
                <Column field='TimeLine.Interview' header='面试时间' body={timelineBodyTemplate} align='center'/>
                <Column field='TimeLine.Submit' header='网申提交时间' body={timelineBodyTemplate} align='center'/>
                <Column field='Detail' header='备注、补充说明' align='center'/>
            </DataTable>
        </PrimeReactProvider>
    )
}