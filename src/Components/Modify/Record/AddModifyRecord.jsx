import {getPrograms} from "../../../Data/ProgramData";
import React, {useState} from "react";
import {addModifyRecord, getRecordByRecordIDs} from "../../../Data/RecordData";
import {Box, Button, Input, Link as MuiLink, Paper, TextField, Tooltip, Typography} from "@mui/material";
import {Form, redirect, useLoaderData, useLocation, useNavigate} from "react-router-dom";
import Grid2 from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import {applicationYearOptions, list2Options, recordSemesterOptions, recordStatusOptions} from "../../../Data/Schemas";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";
import {DatePicker} from "@mui/x-date-pickers";
import {HelpOutline} from "@mui/icons-material";
import {getDisplayName, getMetaData} from "../../../Data/UserData";
import {useSmallPage} from "../../common";

export async function loader({params}) {
    const programs = await getPrograms();
    const paramsApplicantID = params?.applicantId;
    let applicantIDs = null;
    if (!paramsApplicantID) {
        const displayName = await getDisplayName();
        const metaData = await getMetaData(displayName);
        applicantIDs = metaData.ApplicantIDs;
        return {programs, applicantIDs};
    } else {
        const recordsDict = params.programId ? await getRecordByRecordIDs([`${paramsApplicantID}|${params.programId}`]) : null;
        const applicantIDs = [paramsApplicantID];
        return {programs, recordsDict, applicantIDs};
    }
}
export async function action({request}) {
    const formData = await request.formData();
    const actionType = formData.get('ActionType');
    const applicantID = formData.get('ApplicantID');
    const programID = formData.get('ProgramID');
    const passedProgramID = formData.get('passedProgramID');
    const recordID = `${applicantID}|${programID}`;
    const year = formData.get('Year');
    const semester = formData.get('Semester');
    const status = formData.get('Status');
    const submit = formData.get('Submit');
    const interview = formData.get('Interview');
    const decision = formData.get('Decision');
    const detail = formData.get('Detail');
    const final = formData.get('Final');
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
            'Detail': detail,
            'Final': final === 'false' ? false : final === 'true',
        }
    }
    await addModifyRecord(requestBody);
    if (passedProgramID) {
        return redirect(`/profile/${passedProgramID}`);
    } else {
        return redirect(`/profile/${applicantID}`);
    }
}

export default function AddModifyRecord({type}) {
    const loaderData = useLoaderData();
    const programs = loaderData.programs;
    const applicantIDs = loaderData.applicantIDs;
    const recordsDict = loaderData.recordsDict;
    const navigate = useNavigate();

    const location = useLocation();
    const passedProgramID = location?.state?.programID;

    const programOptions = Object.values(programs).reduce((acc, programArray) => {
        programArray.forEach(program => {
            acc.push({label: program.ProgramID, value: program.ProgramID})
        });
        return acc;
    }, []);

    const applicantOptions = list2Options(applicantIDs);

    const record = recordsDict ? recordsDict[Object.keys(recordsDict)[0]] : null;
    const [programOption, setProgramOption] = useState(record ? record.ProgramID : null);
    const [applicantOption, setApplicantOption] = useState(record ? record.ApplicantID : null);
    const [statusOption, setStatusOption] = useState(record ? record.Status : null);
    const [yearOption, setYearOption] = useState(record ? record.ProgramYear : null);
    const [semesterOption, setSemesterOption] = useState(record ? record.Semester : null);
    const mode = type === 'new' ? '添加' : '修改';

    const smallPage = useSmallPage();

    return (
        <Form method='post'>
            <Input type='hidden' value={type} name='ActionType'/>
            <Input type='hidden' value={record ? record.Final : false} name='Final'/>
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center"
            }}>
                <Paper variant='outlined' sx={{width: smallPage ? '90%' : '70%'}}>
                    <Typography variant="h4" sx={{alignSelf: 'center', marginTop: '10px'}}>{`${mode}申请记录`}</Typography>
                    <Input type='hidden' name='passedProgramID' value={passedProgramID}/>
                    <Box className='AddModifyForm'>
                        <Grid2
                            container
                            spacing={2}
                            sx={{width: '80%', marginTop: '10px'}}
                        >
                            <Grid2 xs={12}>
                                {applicantOptions.length === 1 ? <Autocomplete
                                        fullWidth
                                        options={applicantOptions}
                                        readOnly
                                        renderInput={
                                            (params) =>
                                                <TextField
                                                    {...params}
                                                    label='选择申请人 (不可修改)'
                                                    name='ApplicantID'
                                                    size='small'
                                                    required
                                                />
                                        }
                                        defaultValue={applicantOptions[0]}
                                    /> :
                                <Autocomplete
                                    fullWidth
                                    options={applicantOptions}
                                    renderInput={
                                        (params) =>
                                            <TextField
                                                {...params}
                                                label='选择申请人'
                                                name='ApplicantID'
                                                size='small'
                                                required
                                            />
                                    }
                                    value={applicantOption ? applicantOptions.find(option => option.value === applicantOption) : null}
                                    onChange={(event, newValue) => {
                                        setApplicantOption(newValue?.value);
                                    }}
                                />}
                            </Grid2>
                            {passedProgramID ? <Grid2 xs={12} md={6}>
                                <Autocomplete
                                    fullWidth
                                    options={programOptions}
                                    readOnly
                                    renderInput={
                                        (params) =>
                                            <TextField
                                                {...params}
                                                label='选择项目 (不可修改)'
                                                name='ProgramID'
                                                size='small'
                                                required
                                            />
                                    }
                                    defaultValue={passedProgramID}
                                />
                            </Grid2> : <Grid2 xs={12} md={6}>
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
                                                helperText={<MuiLink
                                                    href='/programs/new'>未找到项目？请点此前往添加项目信息</MuiLink>}
                                                required
                                            />
                                    }
                                    value={programOption ? programOptions.find(option => option.value === programOption) : null}
                                    onChange={(event, newValue) => {
                                        setProgramOption(newValue?.value);
                                    }}
                                />
                            </Grid2>}
                            <Grid2 xs={12} md={6}>
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
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {params.InputProps.endAdornment}
                                                            <Tooltip
                                                                title='此项为项目方而非本人的决定；如果被录取但被项目方延期入学 (如申的2024 Fall但被要求2025 Spring入学)，则选择Defer而非Admit；如果项目方给了你面试但你拒绝了面试，请填写Reject并在最下方一栏备注'
                                                                arrow
                                                            >
                                                                <HelpOutline/>
                                                            </Tooltip>
                                                        </>
                                                    ),
                                                }}
                                            />
                                    }
                                    options={recordStatusOptions}
                                    value={statusOption ? recordStatusOptions.find((option) => option.value === statusOption) : null}
                                    onChange={(event, newValue) => {
                                        setStatusOption(newValue?.value);
                                    }}
                                />
                            </Grid2>
                            <Grid2 xs={12} md={6}>
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
                                        setYearOption(newValue?.value);
                                    }}
                                />
                            </Grid2>
                            <Grid2 xs={12} md={6}>
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
                                        setSemesterOption(newValue?.value);
                                    }}
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2
                            container
                            spacing={2}
                            sx={{width: '80%', marginTop: '10px',
                                '& .MuiStack-root>.MuiTextField-root': {
                                    minWidth: 'unset',
                                },
                            }}
                        >
                            <Grid2 xs={12} lg={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="提交申请时间"
                                            name='Submit'
                                            format='YYYY-MM-DD'
                                            slotProps={ { textField: {size: 'small', fullWidth: true, required: true} }}
                                            defaultValue={record ? dayjs(record.TimeLine.Submit.split('T')[0]) : null}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid2>
                            <Grid2 xs={12} lg={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="面试时间"
                                            name='Interview'
                                            format='YYYY-MM-DD'
                                            slotProps={ { textField: {size: 'small', fullWidth: true} }}
                                            defaultValue={record ? record.TimeLine.Interview ? dayjs(record.TimeLine.Interview.split('T')[0]) : null : null}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Grid2>
                            <Grid2 xs={12} lg={4}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            label="结果通知时间"
                                            name='Decision'
                                            format='YYYY-MM-DD'
                                            slotProps={ { textField: {size: 'small', fullWidth: true} }}
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
                            sx={{ mr: 1 }}
                            variant='contained'
                            onClick={() => {
                                if (passedProgramID) {
                                    navigate(`/profile/${passedProgramID}`);
                                } else if (applicantOptions.length === 1) {
                                    navigate(`/profile/${applicantIDs[0]}`);
                                } else {
                                    navigate(`/profile/${applicantOption}`);
                                }
                            }}
                        >
                            取消
                        </Button>
                        <Button
                            sx={{ mr: 2 }}
                            variant='contained'
                            type="submit"
                            color='success'
                        >
                            提交
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Form>
    )
}