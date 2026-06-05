import {useMemo, useState} from "react";
import {Box, Button, Link as MuiLink, Paper, TextField, Tooltip, Typography} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid2 from "@mui/material/Grid";
import {grey} from "@mui/material/colors";
import {HelpOutline} from "@mui/icons-material";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from "@mui/x-date-pickers";
import {DemoContainer} from '@mui/x-date-pickers/internals/demo';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";
import {Form, redirect, useLoaderData, useLocation, useNavigate} from "react-router-dom";
import {getPrograms} from "../../../Data/ProgramData";
import {addModifyRecord, getRecordByRecordIDs} from "../../../Data/RecordData";
import {applicationYearOptions, list2Options, recordSemesterOptions, recordStatusOptions} from "../../../Data/Schemas";
import {getDisplayName, getMetadata} from "../../../Data/UserData";
import {useSmallPage} from "../../common";
import {decodePathParam, profileApplicantPath, safeLocalPath} from "../../RouteUtils";

export async function loader({params}) {
    const programs = await getPrograms();
    const paramsApplicantId = decodePathParam(params?.applicantId);
    if (!paramsApplicantId) {
        const displayName = await getDisplayName();
        const metadata = await getMetadata(displayName);
        return {programs, applicantIds: metadata?.ApplicantIDs ?? []};
    }
    const programId = decodePathParam(params.programId);
    const recordsDict = programId ? await getRecordByRecordIDs([`${paramsApplicantId}|${programId}`]) : null;
    return {programs, recordsDict, applicantIds: [paramsApplicantId]};
}

function createRecordRequestBody(formData) {
    const applicantId = formData.get('ApplicantID');
    const programId = formData.get('ProgramID');
    const final = formData.get('Final');
    return {
        applicantId,
        fromPath: formData.get('FromPath'),
        requestBody: {
            newRecord: formData.get('ActionType') === 'new',
            content: {
                RecordID: `${applicantId}|${programId}`,
                ApplicantID: applicantId,
                ProgramID: programId,
                ProgramYear: Number(formData.get('Year')),
                Semester: formData.get('Semester'),
                Status: formData.get('Status'),
                TimeLine: {
                    Submit: formData.get('Submit') || null,
                    Interview: formData.get('Interview') || null,
                    Decision: formData.get('Decision') || null,
                },
                Detail: formData.get('Detail'),
                Final: final === 'true',
            }
        }
    };
}

export async function action({request}) {
    const formData = await request.formData();
    const {applicantId, fromPath, requestBody} = createRecordRequestBody(formData);
    await addModifyRecord(requestBody);
    return redirect(safeLocalPath(fromPath, profileApplicantPath(applicantId)));
}

function RecordOptionField({
                               endAdornment,
                               helperText,
                               label,
                               onChange,
                               options,
                               readOnly = false,
                               value,
                           }) {
    return (
        <Autocomplete
            fullWidth
            options={options}
            readOnly={readOnly}
            renderInput={(params) =>
                <TextField
                    {...params}
                    label={label}
                    size='small'
                    required
                    helperText={helperText}
                    InputProps={endAdornment ? {
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {params.InputProps.endAdornment}
                                {endAdornment}
                            </>
                        ),
                    } : params.InputProps}
                />
            }
            value={value ? options.find((option) => option.value === value) ?? null : null}
            onChange={(event, newValue) => onChange(newValue?.value ?? null)}
        />
    );
}

function TimelineDatePicker({label, name, value}) {
    return (
        <Grid2 size={{xs: 12, lg: 4}}>
            <DemoContainer components={['DatePicker']}>
                <DatePicker
                    label={label}
                    name={name}
                    format='YYYY-MM-DD'
                    slotProps={{textField: {size: 'small', fullWidth: true}}}
                    defaultValue={value ? dayjs(value.split('T')[0]) : null}
                />
            </DemoContainer>
        </Grid2>
    );
}

export default function AddModifyRecord({type}) {
    const {programs, applicantIds, recordsDict} = useLoaderData();
    const navigate = useNavigate();
    const location = useLocation();
    const smallPage = useSmallPage();
    const record = recordsDict ? Object.values(recordsDict)[0] : null;
    const programOptions = useMemo(() => Object.values(programs).flatMap(programArray => (
        programArray.map(program => ({label: program.ProgramID, value: program.ProgramID}))
    )), [programs]);
    const applicantOptions = useMemo(() => list2Options(applicantIds), [applicantIds]);
    const [programId, setProgramId] = useState(record?.ProgramID ?? location.state?.programID ?? null);
    const [applicantId, setApplicantId] = useState(record?.ApplicantID ?? location.state?.applicantID ?? null);
    const [status, setStatus] = useState(record?.Status ?? null);
    const [year, setYear] = useState(record?.ProgramYear ?? null);
    const [semester, setSemester] = useState(record?.Semester ?? null);
    const selectedApplicantId = applicantOptions.length === 1 ? applicantOptions[0].value : applicantId;
    const fromPath = location.state?.from ?? '';
    const canSubmit = [selectedApplicantId, programId, status, year, semester].every(Boolean);
    const mode = type === 'new' ? '添加' : '修改';

    return (
        <Form method='post'>
            <input type='hidden' value={type} name='ActionType'/>
            <input type='hidden' value={String(record?.Final ?? false)} name='Final'/>
            <input type='hidden' value={fromPath} name='FromPath'/>
            <input type='hidden' value={selectedApplicantId ?? ''} name='ApplicantID'/>
            <input type='hidden' value={programId ?? ''} name='ProgramID'/>
            <input type='hidden' value={status ?? ''} name='Status'/>
            <input type='hidden' value={year ?? ''} name='Year'/>
            <input type='hidden' value={semester ?? ''} name='Semester'/>
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center"
            }}>
                <Paper
                    variant='elevation'
                    sx={{
                        width: smallPage ? '90%' : '70%',
                        bgcolor: (theme) => theme.palette.mode === "dark" ? grey[900] : grey[50]
                    }}
                    elevation={2}
                >
                    <Typography variant="h4" sx={{alignSelf: 'center', marginTop: '10px'}}>{`${mode}申请记录`}</Typography>
                    <Box className='AddModifyForm'>
                        <Grid2 container spacing={2} sx={{width: '80%', marginTop: '10px'}}>
                            <Grid2 size={{xs: 12, md: 6}}>
                                <RecordOptionField
                                    label={`选择申请人${applicantOptions.length === 1 ? ' (不可修改)' : ''}`}
                                    options={applicantOptions}
                                    value={selectedApplicantId}
                                    onChange={setApplicantId}
                                    readOnly={applicantOptions.length === 1}
                                    helperText={applicantOptions.length > 1 ?
                                        <MuiLink href='/profile/new-applicant'>没有选项？请点击此处前往添加申请人信息</MuiLink> :
                                        null}
                                />
                            </Grid2>
                            <Grid2 size={{xs: 12, md: 6}}>
                                <RecordOptionField
                                    label={`选择项目${type === 'edit' ? ' (不可修改)' : ''}`}
                                    options={programOptions}
                                    value={programId}
                                    onChange={setProgramId}
                                    readOnly={type === 'edit'}
                                    helperText={
                                        <MuiLink href='/programs/new'>未找到项目？请点此前往添加项目信息</MuiLink>
                                    }
                                />
                            </Grid2>
                            <Grid2 size={12}>
                                <RecordOptionField
                                    label='录取状态'
                                    options={recordStatusOptions}
                                    value={status}
                                    onChange={setStatus}
                                    endAdornment={
                                        <Tooltip
                                            title='此项为项目方而非本人的决定；如果被录取但被项目方延期入学 (如申的2024 Fall但被要求2025 Spring入学)，则选择Defer而非Admit；如果项目方给了你面试但你拒绝了面试，请填写Reject并在最下方一栏备注'
                                            arrow
                                            enterTouchDelay={0}
                                            leaveTouchDelay={10000}
                                        >
                                            <HelpOutline/>
                                        </Tooltip>
                                    }
                                />
                            </Grid2>
                            <Grid2 size={{xs: 12, md: 6}}>
                                <RecordOptionField label='项目开始学年' options={applicationYearOptions}
                                                   value={year} onChange={setYear}/>
                            </Grid2>
                            <Grid2 size={{xs: 12, md: 6}}>
                                <RecordOptionField label='项目开始学期' options={recordSemesterOptions}
                                                   value={semester} onChange={setSemester}/>
                            </Grid2>
                        </Grid2>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid2
                                container
                                spacing={2}
                                sx={{
                                    width: '80%',
                                    marginTop: '10px',
                                    '& .MuiStack-root>.MuiTextField-root': {
                                        minWidth: 'unset',
                                    },
                                }}
                            >
                                <TimelineDatePicker label="提交申请时间" name="Submit" value={record?.TimeLine?.Submit}/>
                                <TimelineDatePicker label="面试时间" name="Interview" value={record?.TimeLine?.Interview}/>
                                <TimelineDatePicker label="结果通知时间" name="Decision" value={record?.TimeLine?.Decision}/>
                            </Grid2>
                        </LocalizationProvider>
                        <Grid2 container spacing={2} sx={{width: '80%', marginTop: '15px'}}>
                            <Grid2 size={12}>
                                <TextField
                                    fullWidth
                                    label='备注、补充说明等'
                                    name='Detail'
                                    variant='outlined'
                                    size='small'
                                    defaultValue={record?.Detail ?? ''}
                                />
                            </Grid2>
                        </Grid2>
                    </Box>
                    <Box sx={{display: "flex", justifyContent: "flex-end", margin: 3}}>
                        <Button sx={{mr: 1}} variant='contained' onClick={() => navigate(fromPath ? safeLocalPath(fromPath, "..") : "..")}>
                            取消
                        </Button>
                        <Button sx={{mr: 2}} variant='contained' type="submit" color='success' disabled={!canSubmit}>
                            提交
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Form>
    );
}
