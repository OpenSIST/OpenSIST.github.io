import React, {useState} from "react";
import {
    Box,
    Button, Divider,
    Paper,
    TextField,
    Tooltip
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {HelpOutline} from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import {
    applicationYearOptions,
    currentDegreeOptions, englishOptions,
    genderOptions, list2Options,
    majorOptions, rankPercentOptions,
} from "../../../../Data/Schemas";
import "../AddModifyApplicant.css";
import {useNavigate} from "react-router-dom";

function BasicInfo({formValues, handleNext, handleChange, actionType}) {
    let finalOptions = formValues.Programs ? Object.keys(formValues.Programs).filter((record) => {
        return ['Admit', 'Defer'].includes(formValues.Programs[record]);
    }) : [];
    finalOptions = list2Options(finalOptions);

    const [englishOption, setEnglishOption] = useState('');
    const [isGRETotalRequired, setIsGRETotalRequired] = useState(false);
    const [isGREVRequired, setIsGREVRequired] = useState(false);
    const [isGREQRequired, setIsGREQRequired] = useState(false);
    const [isGREAWRequired, setIsGREAWRequired] = useState(false);
    const setGREStatus = (value) => {
        setIsGRETotalRequired(value);
        setIsGREVRequired(value);
        setIsGREQRequired(value);
        setIsGREAWRequired(value);
    }
    const disableNumberUpDown = {
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
            display: "none",
        },
        "& input[type=number]": {
            MozAppearance: "textfield",
        },
    };

    const navigate = useNavigate();
    const isError = () => {
        return !formValues.Gender || !formValues.CurrentDegree || !formValues.ApplicationYear || !formValues.Major || !formValues.GPA || !formValues.Ranking || !formValues.EnglishOption || !formValues.EnglishTotal || !formValues.R || !formValues.L || !formValues.S || !formValues.W || (isGRETotalRequired && !formValues.GRETotal) || (isGREVRequired && !formValues.V) || (isGREQRequired && !formValues.Q) || (isGREAWRequired && !formValues.AW);
    }

    return (
        <Paper variant='outlined' sx={{width: '70%'}}>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>申请人基本信息</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12} md={6}>
                        <Autocomplete
                            fullWidth
                            options={genderOptions}
                            renderInput={
                                (params) =>
                                    <TextField
                                        {...params}
                                        label="申请人性别"
                                        size="small"
                                        variant="outlined"
                                        name="Gender"
                                        required
                                    />
                            }
                            value={formValues.Gender ? genderOptions.find((gender) => {
                                return gender.value === formValues.Gender;
                            }) : null}
                            onChange={
                                (event, newInputValue) => {
                                    handleChange(event, newInputValue?.value, "Gender")
                                }
                            }
                        />
                    </Grid2>
                    <Grid2 xs={12} md={6}>
                        <Autocomplete
                            fullWidth
                            options={currentDegreeOptions}
                            renderInput={
                                (params) =>
                                    <TextField
                                        {...params}
                                        label="申请人学位"
                                        size="small"
                                        variant="outlined"
                                        name="CurrentDegree"
                                        required
                                    />
                            }
                            value={formValues.CurrentDegree ? currentDegreeOptions.find((degree) => {
                                return degree.value === formValues.CurrentDegree;
                            }) : null}
                            onChange={
                                (event, newInputValue) => {
                                    handleChange(event, newInputValue?.value, "CurrentDegree")
                                }
                            }
                        />
                    </Grid2>
                    <Grid2 xs={12} md={6}>
                        <Autocomplete
                            fullWidth
                            options={applicationYearOptions}
                            readOnly={actionType === 'edit'}
                            renderInput={
                                (params) =>
                                    <TextField
                                        {...params}
                                        label={`申请年份 ${actionType === 'edit' ? ' (不可修改)' : ''}`}
                                        size="small"
                                        variant="outlined"
                                        name="ApplicationYear"
                                        // helperText="例：若申请2024Fall或2024Spring，则统一填2024"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {params.InputProps.endAdornment}
                                                    <Tooltip
                                                        title='例：若申请2024Fall或2024Spring，则统一填2024'
                                                        arrow
                                                    >
                                                        <HelpOutline/>
                                                    </Tooltip>
                                                </>
                                            ),
                                        }}
                                        required
                                    />
                            }
                            value={formValues.ApplicationYear ? applicationYearOptions.find((year) => {
                                return year.value === formValues.ApplicationYear;
                            }) : null}
                            onChange={
                                (event, newInputValue) => {
                                    handleChange(event, newInputValue?.value, "ApplicationYear")
                                }
                            }
                        />
                    </Grid2>
                    <Grid2 xs={12} md={6}>
                        <Autocomplete
                            fullWidth
                            options={majorOptions}
                            renderInput={
                                (params) =>
                                    <TextField
                                        {...params}
                                        label="申请人专业"
                                        size="small"
                                        variant="outlined"
                                        name="Major"
                                        required
                                    />
                            }
                            value={formValues.Major ? majorOptions.find((major) => {
                                return major.value === formValues.Major;
                            }) : null}
                            onChange={
                                (event, newInputValue) => {
                                    handleChange(event, newInputValue?.value, "Major")
                                }
                            }
                        />
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>学业成绩</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12} md={6}>
                        <TextField
                            fullWidth
                            name="GPA"
                            label="GPA"
                            variant="outlined"
                            size="small"
                            required
                            value={formValues.GPA ?? ""}
                            onChange={(event) => {handleChange(event)}}
                            type="number"
                            sx={disableNumberUpDown}
                            InputProps={{
                                endAdornment: (
                                    <Tooltip title={'填写在该申请季用于申请的最高学历的GPA'} arrow sx={{cursor: 'pointer'}}>
                                        <HelpOutline/>
                                    </Tooltip>
                                ),
                            }}
                        />
                    </Grid2>
                    <Grid2 xs={12} md={6}>
                        <Autocomplete
                            fullWidth
                            renderInput={(params) =>
                                <TextField
                                    {...params}
                                    size="small"
                                    name="Ranking"
                                    label="学院或专业排名"
                                    variant="outlined"
                                    required
                                />
                            }
                            options={rankPercentOptions}
                            value={formValues.Ranking ? rankPercentOptions.find((option) => {
                                return option.value === formValues.Ranking;
                            }) : null}
                            onChange={
                                (event, newInputValue) => {
                                    handleChange(event, newInputValue?.value, "Ranking")
                                }
                            }
                        />
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>英语成绩</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12}>
                        <Autocomplete
                            fullWidth
                            onInputChange={(event, value) => {
                                setEnglishOption(value);
                            }}
                            options={englishOptions}
                            renderInput={(params) =>
                                <TextField
                                    {...params}
                                    size="small"
                                    name="EnglishOption"
                                    label="选择考试"
                                    variant="outlined"
                                    required
                                />
                            }
                            value={formValues.EnglishOption ? englishOptions.find((option) => {
                                return option.value === formValues.EnglishOption;
                            }) : null}
                            onChange={
                                (event, newInputValue) => {
                                    handleChange(event, newInputValue?.value, "EnglishOption")
                                }
                            }
                        />
                    </Grid2>
                    {englishOption.length > 0 ?
                        <>
                            <Grid2 xs={12}>
                                <TextField
                                    fullWidth
                                    name="EnglishTotal"
                                    label="总分"
                                    variant="outlined"
                                    size="small"
                                    value={formValues.EnglishTotal || ""}
                                    onChange={(event) => {handleChange(event)}}
                                    type="number"
                                    required
                                    sx={disableNumberUpDown}
                                />
                            </Grid2>
                            <Grid2 xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    name="R"
                                    label="阅读"
                                    variant="outlined"
                                    size="small"
                                    value={formValues.R || ""}
                                    onChange={(event) => {handleChange(event)}}
                                    type="number"
                                    required
                                    sx={disableNumberUpDown}
                                />
                            </Grid2>
                            <Grid2 xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    name="L"
                                    label="听力"
                                    variant="outlined"
                                    size="small"
                                    value={formValues.L || ""}
                                    onChange={(event) => {handleChange(event)}}
                                    type="number"
                                    required
                                    sx={disableNumberUpDown}
                                />
                            </Grid2>
                            <Grid2 xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    name="S"
                                    label="口语"
                                    variant="outlined"
                                    size="small"
                                    value={formValues.S || ""}
                                    onChange={(event) => {handleChange(event)}}
                                    type="number"
                                    sx={disableNumberUpDown}
                                />
                            </Grid2>
                            <Grid2 xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    name="W"
                                    label="写作"
                                    variant="outlined"
                                    size="small"
                                    value={formValues.W || ""}
                                    onChange={(event) => {handleChange(event)}}
                                    type="number"
                                    required
                                    sx={disableNumberUpDown}
                                />
                            </Grid2>
                        </> : null
                    }
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>GRE成绩</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12}>
                        <TextField
                            fullWidth
                            name="GRETotal"
                            label="V+Q总分"
                            variant="outlined"
                            size="small"
                            value={formValues.GRETotal ?? ""}
                            onChange={(event) => {
                                handleChange(event);
                                if (event.target.value) {
                                    setGREStatus(true);
                                } else {
                                    setGREStatus(false);
                                }
                            }}
                            type="number"
                            sx={disableNumberUpDown}
                            required={isGRETotalRequired}
                        />
                    </Grid2>
                    <Grid2 xs={12} md={4}>
                        <TextField
                            fullWidth
                            name="V"
                            label="语文"
                            variant="outlined"
                            size="small"
                            value={formValues.V ?? ""}
                            onChange={(event) => {
                                handleChange(event);
                                if (event.target.value) {
                                    setGREStatus(true);
                                } else {
                                    setGREStatus(false);
                                }
                            }}
                            type="number"
                            sx={disableNumberUpDown}
                            required={isGREVRequired}
                        />
                    </Grid2>
                    <Grid2 xs={12} md={4}>
                        <TextField
                            fullWidth
                            name="Q"
                            label="数学"
                            variant="outlined"
                            size="small"
                            value={formValues.Q ?? ""}
                            onChange={(event) => {
                                handleChange(event);
                                if (event.target.value) {
                                    setGREStatus(true);
                                } else {
                                    setGREStatus(false);
                                }
                            }}
                            type="number"
                            sx={disableNumberUpDown}
                            required={isGREQRequired}
                        />
                    </Grid2>
                    <Grid2 xs={12} md={4}>
                        <TextField
                            fullWidth
                            name="AW"
                            label="写作"
                            variant="outlined"
                            size="small"
                            value={formValues.AW || ""}
                            onChange={(event) => {
                                handleChange(event);
                                if (event.target.value) {
                                    setGREStatus(true);
                                } else {
                                    setGREStatus(false);
                                }
                            }}
                            type="number"
                            sx={disableNumberUpDown}
                            required={isGREAWRequired}
                        />
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>最终去向</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12}>
                        <Autocomplete
                            renderInput={(params) =>
                                <TextField
                                    {...params}
                                    size="small"
                                    name="Final"
                                    label="最终去向"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {params.InputProps.endAdornment}
                                                <Tooltip
                                                    title='选项只包含申请结果为Admit或Defer的项目'
                                                    arrow
                                                >
                                                    <HelpOutline/>
                                                </Tooltip>
                                            </>
                                        ),
                                    }}
                                    disabled={!formValues.Programs}
                                />
                            }
                            options={finalOptions}
                            value={formValues.Final ? finalOptions.find((option) => {
                                return option.value === formValues.Final;
                            }) : null}
                            onChange={(event, newInputValue) => {
                                    handleChange(event, newInputValue?.value, "Final")
                                }}
                        />
                    </Grid2>
                </Grid2>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", margin: 3 }}>
                <Button
                    sx={{ mr: 1 }}
                    variant='contained'
                    onClick={() => navigate(-1)}
                >
                    取消
                </Button>
                <Button
                    sx={{ mr: 2 }}
                    variant='contained'
                    onClick={handleNext}
                    disabled={isError()}
                >
                    下一步
                </Button>
            </Box>
        </Paper>
    )
}

export default BasicInfo