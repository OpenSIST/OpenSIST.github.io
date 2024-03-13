import React, {useState} from 'react';
import "./AddModifyProgram.css";
import {
    DescriptionTemplate,
    degreeOptions,
    majorOptions,
    univOptions
} from "../../../Data/Schemas";
import MarkDownEditor from "./MarkDownEditor/MarkDownEditor";
import {useLoaderData, useNavigate, redirect, Form} from "react-router-dom";
import {addModifyProgram} from "../../../Data/ProgramData";
import {
    Button,
    ButtonGroup, Checkbox,
    FormControl, Input, ListItemText,
    MenuItem,
    Link as MuiLink,
    TextField, Tooltip,
    Typography
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMarkdown} from "@fortawesome/free-brands-svg-icons";
import {HelpOutline} from "@mui/icons-material";

export async function action({request}) {
    const formData = await request.formData();
    const ActionType = formData.get('ActionType');
    const University = formData.get('University');
    const Program = formData.get('Program');
    const ProgramID = `${Program}@${University}`;
    const targetApplicantMajor = formData.get('TargetApplicantMajor')?.split(',');
    const Region = formData.get('Region')?.split(',');
    const Degree = formData.get('Degree');
    const Description = formData.get('Description');
    const requestBody = {
        'newProgram': ActionType === 'new',
        'content': {
            'ProgramID': ProgramID,
            'University': University,
            'Program': Program,
            'Region': Region,
            'Degree': Degree,
            'TargetApplicantMajor': targetApplicantMajor,
            'Description': Description,
        }
    };
    await addModifyProgram(requestBody);
    return redirect(`/programs/${ProgramID}`)
}

export default function AddModifyProgram({type}) {
    const navigate = useNavigate();
    const loaderData = useLoaderData();
    const programContent = loaderData?.programContent;
    const AddMode = !programContent;
    const mode = AddMode ? '添加' : '修改';
    const [Description, setDescription] = useState(AddMode ? DescriptionTemplate : programContent.description);
    const [univ, setUniv] = useState(univOptions.find((univ) => univ.value === programContent?.University) ?? null);
    const [major, setMajor] = useState(majorOptions.filter((m) => programContent?.TargetApplicantMajor.includes(m.value)) ?? []);
    const [programName, setProgramName] = useState(programContent?.Program ?? '');
    const programNameInvalid = ['@', '|', '/', '$', '\\', '?', '!'].some(char => programName.includes(char));
    return (
        <Form method="post"
              style={{display: 'flex', flexDirection: 'column', height: "100%"}}
        >
            <Input type='hidden' sx={{visibility: 'hidden'}} value={type} name='ActionType'/>
            <Typography variant="h4" sx={{alignSelf: 'center'}}>{`${mode}项目`}</Typography>
            <Typography variant="h5">项目信息</Typography>
            <FormControl sx={{display: 'flex', flexDirection: 'row', gap: "15px", mb: "15px"}} fullWidth>
                <Autocomplete
                    autoHighlight
                    options={univOptions}
                    value={univ}
                    onChange={(event, value) => setUniv(value)}
                    readOnly={!AddMode}
                    sx={AddMode ? {} : {color: 'gray', cursor: 'not-allowed', pointerEvents: 'none'}}
                    renderInput={(params) =>
                        <>
                            <TextField {...params}
                                       label={"学校名称" + (AddMode ? "" : " (不可修改)")}
                                       variant="standard"
                                       required
                                       helperText={<MuiLink href="https://github.com/orgs/OpenSIST/discussions/23">未找到学校？请到GitHub提交Issue</MuiLink>}
                            />
                            <TextField sx={{display: 'none'}} name="University" value={univ?.value || ""}/>
                        </>}
                    fullWidth
                    required
                >
                    {univOptions.map((univ) => (
                        <MenuItem value={univ.value} key={univ.value}>
                            {univ.label}
                        </MenuItem>
                    ))}
                </Autocomplete>
                <TextField
                    InputProps={{readOnly: !AddMode}}
                    variant="standard"
                    name="Program"
                    label={"项目名称" + (AddMode ? "" : " (不可修改)")}
                    value={programName}
                    onChange={(event) => setProgramName(event.target.value)}
                    error={programNameInvalid}
                    helperText={programNameInvalid ? "项目名称中不可包含@, |, /, \\, ?, !, $，如果必须要使用'/'字符，请用'&'代替" : ""}
                    placeholder="硕士写简称 (e.g. MSCS)，博士要加院系 (e.g. EECS PhD)"
                    sx={AddMode ? {} : {color: 'gray', cursor: 'not-allowed', pointerEvents: 'none'}}
                    fullWidth
                    required
                />
            </FormControl>
            <FormControl sx={{display: 'flex', flexDirection: 'row', gap: "15px", mb: "15px"}} fullWidth>
                <Autocomplete
                    options={degreeOptions}
                    defaultValue={programContent?.Degree ? degreeOptions.find((degree) => {
                        return degree.value === programContent?.Degree;
                    }) : null}
                    renderInput={
                        (params) =>
                            <TextField
                                {...params}
                                name="Degree"
                                label="项目学位"
                                variant="standard"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {params.InputProps.endAdornment}
                                            <Tooltip
                                                title='只填写项目最终学位，但若涉及中间学位授予，请在项目介绍中说明'
                                                arrow
                                                enterTouchDelay={0}
                                                leaveTouchDelay={4000}
                                            >
                                                <HelpOutline/>
                                            </Tooltip>
                                        </>
                                    ),
                                }}
                                required
                            />
                    }
                    fullWidth
                    required
                />
                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    onChange={(event, value) => {
                        setMajor(value);
                    }}
                    options={majorOptions}
                    value={major}
                    renderTags={(value) =>
                        <Typography variant="body1">
                            {value.map((option) => option.label).join(', ')}
                        </Typography>
                    }
                    renderOption={(props, option) => {
                        return (
                            <MenuItem {...props} key={option.label} value={option.value}>
                                <Checkbox checked={major.indexOf(option) > -1}/>
                                <ListItemText primary={option.label}/>
                            </MenuItem>
                        )
                    }}
                    renderInput={
                        (params) =>
                            <>
                                <TextField
                                    {...params}
                                    label="目标申请人专业"
                                    variant="standard"
                                    required={major.length === 0}
                                />
                                <TextField sx={{display: "none"}} name="TargetApplicantMajor"
                                           value={major.map((m) => m.value).join(',')}/>
                            </>
                    }
                    fullWidth
                    required
                />
                <TextField sx={{display: 'none'}} name="Region" value={univ?.region.join(',') ?? []}/>
            </FormControl>
            <Typography variant="h5" sx={{mb: "10px"}}>
                {"项目描述 "}
                <FontAwesomeIcon icon={faMarkdown}/>
            </Typography>
            <MarkDownEditor Description={Description} setDescription={setDescription}/>
            <textarea id='Description' name='Description' hidden={true} value={Description} readOnly/>
            <ButtonGroup sx={{mt: '1vh'}}>
                <Button type="submit" disabled={programNameInvalid}> 提交 </Button>
                <Button onClick={() => navigate(-1)}> 取消 </Button>
            </ButtonGroup>
        </Form>
    )
}

