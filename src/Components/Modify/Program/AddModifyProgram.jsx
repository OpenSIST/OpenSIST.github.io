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
import {setProgramContent} from "../../../Data/ProgramData";
import {faMarkdown} from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    Button,
    ButtonGroup,
    FormControl,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

export async function action({request}) {
    const formData = await request.formData();
    const University = formData.get('University');
    const Program = formData.get('Program');
    const ProgramID = `${Program}@${University}`;
    const targetApplicantMajor = formData.get('TargetApplicantMajor')?.split(',');
    console.log(formData.get('TargetApplicantMajor'))
    const Region = formData.get('Region')?.split(',');
    const Degree = formData.get('Degree');
    const Description = formData.get('Description');
    const requestBody = {
        'newProgram': false,
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
    // console.log(requestBody)
    await setProgramContent(requestBody)
    return redirect(`/programs/${ProgramID}`)
}

export default function AddModifyProgram() {
    const navigate = useNavigate();
    const loaderData = useLoaderData();
    const programContent = loaderData?.programContent;
    const AddMode = !programContent;
    const mode = AddMode ? '添加' : '修改';
    const OriginDesc = AddMode ? DescriptionTemplate : programContent.description;
    const [Description, setDescription] = useState(OriginDesc);
    const [univ, setUniv] = useState(univOptions.find((univ) => univ.value === programContent?.University) ?? null);
    const [major, setMajor] = useState(majorOptions.filter((m) => programContent?.TargetApplicantMajor.includes(m.value)) ?? []);
    return (
        <Form method="post" className='ProgramContent'>
            <Typography variant="h4" sx={{mb: "10px", alignSelf: 'center'}}>{`${mode}项目`}</Typography>
            <Typography variant="h5" sx={{mb: "10px"}}>项目信息</Typography>
            <FormControl sx={{display: 'flex', flexDirection: 'row', gap: "15px", mb: "15px"}} fullWidth>
                <Autocomplete
                    autoSelect
                    autoHighlight
                    options={univOptions}
                    value={univ}
                    onChange={(event, value) => setUniv(value)}
                    readOnly={!AddMode}
                    sx={AddMode ? {} : {color: 'gray', cursor: 'not-allowed', pointerEvents: 'none'}}
                    renderInput={(params) =>
                        <>
                            <TextField {...params} label={"学校名称" + (AddMode ? "" : "(不可修改)")} variant="standard"
                                       required/>
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
                    label={"项目名称" + (AddMode ? "" : "(不可修改)")}
                    defaultValue={programContent?.Program}
                    placeholder="请使用缩写，例如 MSCS, EECS PhD 等"
                    sx={AddMode ? {} : {color: 'gray', cursor: 'not-allowed', pointerEvents: 'none'}}
                    fullWidth
                    required
                />
                <Autocomplete
                    autoSelect
                    autoHighlight
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
                                required
                            />
                    }
                    fullWidth
                    required
                />
            </FormControl>
            <FormControl sx={{display: 'flex', flexDirection: 'row', gap: "15px", mb: "15px"}} fullWidth>
                <Autocomplete
                    autoSelect
                    autoHighlight
                    multiple
                    onChange={(event, value) => {
                        setMajor(value);
                    }}
                    options={majorOptions}
                    value={major}
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
            <Typography variant="h5" sx={{mb: "10px"}}>项目描述</Typography>
            <MarkDownEditor OriginDesc={OriginDesc} Description={Description} setDescription={setDescription}/>
            <textarea id='Description' name='Description' hidden={true} value={Description} readOnly/>
            <ButtonGroup>
                <Button type="submit"> Submit </Button>
                <Button onClick={() => navigate(-1)}> Cancel </Button>
            </ButtonGroup>
        </Form>
    )
}

