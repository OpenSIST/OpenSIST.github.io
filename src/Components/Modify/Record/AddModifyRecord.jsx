import {getPrograms} from "../../../Data/ProgramData";
import React, {useEffect, useState} from "react";
import {addModifyRecord, getRecordByRecordIDs} from "../../../Data/RecordData";
import {Box, Button, Divider, Input, Paper, TextField, Typography} from "@mui/material";
import {Form, Link, redirect, useLoaderData} from "react-router-dom";
import Grid2 from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import {applicationYearOptions, recordSemesterOptions, recordStatusOptions} from "../../../Data/Schemas";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";

export async function loader({params}) {
    const programs = await getPrograms();
    const recordID = `${params.applicantId}|${params.programId}`;
    const recordsDict = recordID ? await getRecordByRecordIDs([recordID]) : null;
    return {programs, recordsDict};
}
export async function action({params, request}) {
    const formData = await request.formData();
    const actionType = formData.get('ActionType');
    const applicantID = params.applicantId;
    const programID = formData.get('ProgramID');
    const recordID = `${applicantID}|${programID}`;
    const year = formData.get('Year');
    const semester = formData.get('Semester');
    const status = formData.get('Status');
    const submit = formData.get('Submit');
    const interview = formData.get('Interview');
    const decision = formData.get('Decision');
    const detail = formData.get('Detail');
    const requestBody = {
        'newRecord': actionType === 'new',
        'content': {
            'RecordID': recordID,
            'ApplicantID': applicantID,
            'ProgramID': programID,
            'ProgramYear': Number(year),
            'Semester': semester,
            'Status': status,
            'TimeLine': {
                'Submit': submit,
                'Interview': interview.length > 0 ? interview : null,
                'Decision': decision.length > 0 ? decision : null,
            },
            'Detail': detail
        }
    }
    console.log(requestBody)
    await addModifyRecord(requestBody);
    return redirect(`/profile/${applicantID}`);
}

export default function AddModifyRecord({type}) {
    const {programs, recordsDict} = useLoaderData();
    const programOptions = Object.values(programs).reduce((acc, programArray) => {
        programArray.forEach(program => {
            acc.push({label: program.ProgramID, value: program.ProgramID})
        });
        return acc;
    }, []);
    const record = recordsDict ? recordsDict[Object.keys(recordsDict)[0]] : null;
    console.log(recordsDict)
    const [programOption, setProgramOption] = useState(record ? record.ProgramID : null);
    const [statusOption, setStatusOption] = useState(record ? record.Status : null);
    const [yearOption, setYearOption] = useState(record ? record.ProgramYear : null);
    const [semesterOption, setSemesterOption] = useState(record ? record.Semester : null);

    const mode = type === 'new' ? '添加' : '修改';
    return (
        <Form method='post'>
            <Input type='hidden' value={type} name='ActionType'/>
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center"
            }}>
                <Paper variant='outlined' sx={{width: '70%'}}>
                    <Typography variant="h4" sx={{alignSelf: 'center', marginTop: '10px'}}>{`${mode}申请记录`}</Typography>
                    <Box className='AddModifyForm'>
                        <Grid2
                            container
                            spacing={2}
                            sx={{width: '80%', marginTop: '10px'}}
                        >
                            <Grid2 xs={6}>
                                <Autocomplete
                                    fullWidth
                                    options={programOptions}
                                    readOnly={type === 'edit'}
                                    renderInput={
                                        (params) =>
                                            <TextField
                                                {...params}
                                                label={`选择项目 ${type === 'edit' ? ' (不可修改)' : ''}`}
                                                name='ProgramID'
                                                size='small'
                                                helperText='未找到项目？请先前往项目信息表添加项目'
                                                required
                                            />
                                    }
                                    value={programOption ? programOptions.find(option => option.value === programOption) : null}
                                    onChange={(event, newValue) => {
                                        setProgramOption(newValue.value);
                                    }}
                                >
                                </Autocomplete>
                            </Grid2>
                            <Grid2 xs={6}>
                                <Autocomplete
                                    fullWidth
                                    renderInput={
                                        (params) =>
                                            <TextField
                                                {...params}
                                                label='录取状态'
                                                name='Status'
                                                size='small'
                                                required
                                            />
                                    }
                                    options={recordStatusOptions}
                                    value={statusOption ? recordStatusOptions.find((option) => option.value === statusOption) : null}
                                    onChange={(event, newValue) => {
                                        setStatusOption(newValue.value);
                                    }}
                                />
                            </Grid2>
                            <Grid2 xs={6}>
                                <Autocomplete
                                    fullWidth
                                    renderInput={
                                        (params) =>
                                            <TextField
                                                {...params}
                                                label='项目开始学年'
                                                name='Year'
                                                size='small'
                                                required
                                            />
                                    }
                                    options={applicationYearOptions}
                                    value={yearOption ? applicationYearOptions.find((option) => option.value === yearOption) : null}
                                    onChange={(event, newValue) => {
                                        setYearOption(newValue.value);
                                    }}
                                />
                            </Grid2>
                            <Grid2 xs={6}>
                                <Autocomplete
                                    fullWidth
                                    renderInput={
                                        (params) =>
                                            <TextField
                                                {...params}
                                                label='项目开始学期'
                                                name='Semester'
                                                size='small'
                                                required
                                            />
                                    }
                                    options={recordSemesterOptions}
                                    value={semesterOption ? recordSemesterOptions.find((option) => option.value === semesterOption) : null}
                                    onChange={(event, newValue) => {
                                        setSemesterOption(newValue.value);
                                    }}
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2
                            container
                            spacing={2}
                            sx={{width: '80%', marginTop: '10px'}}
                        >
                            <Grid2 xs={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="提交申请时间"
                                            name='Submit'
                                            format='YYYY-MM-DD'
                                            slotProps={{ textField: { size: 'small', required: true, fullWidth: true } }}
                                            defaultValue={record ? dayjs(record.TimeLine.Submit.split('T')[0]) : null}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid2>
                            <Grid2 xs={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="面试时间"
                                            name='Interview'
                                            format='YYYY-MM-DD'
                                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                            defaultValue={record ? record.TimeLine.Interview ? dayjs(record.TimeLine.Interview.split('T')[0]) : null : null}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid2>
                            <Grid2 xs={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="结果通知时间"
                                            name='Decision'
                                            format='YYYY-MM-DD'
                                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                            defaultValue={record ? record.TimeLine.Decision ? dayjs(record.TimeLine.Decision.split('T')[0]) : null : null}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid2>
                        </Grid2>
                        <Grid2
                            container
                            spacing={2}
                            sx={{width: '80%', marginTop: '15px'}}
                        >
                            <Grid2 xs={12}>
                                <TextField
                                    fullWidth
                                    label='备注、补充说明等'
                                    name='Detail'
                                    variant='outlined'
                                    size='small'
                                    defaultValue={record ? record.Detail : null}
                                />
                            </Grid2>
                        </Grid2>
                    </Box>
                    <Box sx={{display: "flex", justifyContent: "flex-end", margin: 3}}>
                        <Button
                            sx={{mr: 1}}
                            variant='contained'
                            type="submit"
                        >
                            提交
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Form>
    )
}