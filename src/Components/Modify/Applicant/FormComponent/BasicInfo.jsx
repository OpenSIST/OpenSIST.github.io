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
    const [isGRETotalRequired, setIsGRETotalRequired] = useState(!!(formValues.GRETotal || formValues.V || formValues.Q || formValues.AW));
    const [isGREVRequired, setIsGREVRequired] = useState(!!(formValues.GRETotal || formValues.V || formValues.Q || formValues.AW));
    const [isGREQRequired, setIsGREQRequired] = useState(!!(formValues.GRETotal || formValues.V || formValues.Q || formValues.AW));
    const [isGREAWRequired, setIsGREAWRequired] = useState(!!(formValues.GRETotal || formValues.V || formValues.Q || formValues.AW));
    const setGREStatus = (value) => {
        setIsGRETotalRequired(value);
        setIsGREVRequired(value);
        setIsGREQRequired(value);
        setIsGREAWRequired(value);
    }

    const isGPAError = formValues.GPA && (formValues.GPA < 0 || formValues.GPA > 4);
    const isEnglishTotalError = formValues.EnglishTotal && ((formValues.EnglishOption === 'TOEFL' && (formValues.EnglishTotal < 0 || formValues.EnglishTotal > 120)) || (formValues.EnglishOption === 'IELTS' && (formValues.EnglishTotal < 0 || formValues.EnglishTotal > 9)));
    const isReadingError = formValues.R && ((formValues.EnglishOption === 'TOEFL' && (formValues.R < 0 || formValues.R > 30)) || ((formValues.EnglishOption === 'IELTS' && (formValues.R < 0 || formValues.R > 9))));
    const isListeningError = formValues.L && ((formValues.EnglishOption === 'TOEFL' && (formValues.L < 0 || formValues.L > 30)) || ((formValues.EnglishOption === 'IELTS' && (formValues.L < 0 || formValues.L > 9))));
    const isSpeakingError = formValues.S && ((formValues.EnglishOption === 'TOEFL' && (formValues.S < 0 || formValues.S > 30)) || ((formValues.EnglishOption === 'IELTS' && (formValues.S < 0 || formValues.S > 9))));
    const isWritingError = formValues.W && ((formValues.EnglishOption === 'TOEFL' && (formValues.W < 0 || formValues.W > 30)) || ((formValues.EnglishOption === 'IELTS' && (formValues.W < 0 || formValues.W > 9))));
    const isGRETotalError = formValues.GRETotal && (formValues.GRETotal < 260 || formValues.GRETotal > 340);
    const isGREVError = formValues.V && (formValues.V < 130 || formValues.V > 170);
    const isGREQError = formValues.Q && (formValues.Q < 130 || formValues.Q > 170);
    const isGREAWError = formValues.AW && (formValues.AW < 0 || formValues.AW > 6);

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
        return !formValues.Gender || !formValues.CurrentDegree || !formValues.ApplicationYear || !formValues.Major || !formValues.GPA || !formValues.Ranking || !formValues.EnglishOption || !formValues.EnglishTotal || !formValues.R || !formValues.L || !formValues.S || !formValues.W || (isGRETotalRequired && !formValues.GRETotal) || (isGREVRequired && !formValues.V) || (isGREQRequired && !formValues.Q) || (isGREAWRequired && !formValues.AW) || isGPAError || isEnglishTotalError || isReadingError || isListeningError || isSpeakingError || isWritingError || isGRETotalError || isGREVError || isGREQError || isGREAWError;
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
                            error={isGPAError}
                            helperText={isGPAError ? "GPA应在0-4之间" : null}
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
                                    error={isEnglishTotalError}
                                    helperText={isEnglishTotalError ? (formValues.EnglishOption === 'TOEFL' ? "TOEFL总分应在0-120之间" : "IELTS总分应在0-9之间") : null}
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
                                    error={isReadingError}
                                    helperText={isReadingError ? (formValues.EnglishOption === 'TOEFL' ? "TOEFL阅读分应在0-30之间" : "IELTS阅读分应在0-9之间") : null}
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
                                    error={isListeningError}
                                    helperText={isListeningError ? (formValues.EnglishOption === 'TOEFL' ? "TOEFL听力分应在0-30之间" : "IELTS听力分应在0-9之间") : null}
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
                                    required
                                    error={isSpeakingError}
                                    helperText={isSpeakingError ? (formValues.EnglishOption === 'TOEFL' ? "TOEFL口语分应在0-30之间" : "IELTS口语分应在0-9之间") : null}
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
                                    error={isWritingError}
                                    helperText={isWritingError ? (formValues.EnglishOption === 'TOEFL' ? "TOEFL写作分应在0-30之间" : "IELTS写作分应在0-9之间") : null}
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
                                if (event.target.value || formValues.V || formValues.Q || formValues.AW) {
                                    setGREStatus(true);
                                } else {
                                    setGREStatus(false);
                                }
                            }}
                            type="number"
                            sx={disableNumberUpDown}
                            error={isGRETotalError}
                            helperText={isGRETotalError ? "GRE总分应在260-340之间" : null}
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
                                if (event.target.value || formValues.GRETotal || formValues.Q || formValues.AW) {
                                    setGREStatus(true);
                                } else {
                                    setGREStatus(false);
                                }
                            }}
                            type="number"
                            sx={disableNumberUpDown}
                            required={isGREVRequired}
                            error={isGREVError}
                            helperText={isGREVError ? "GRE语文分应在130-170之间" : null}
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
                                if (event.target.value || formValues.AW || formValues.V || formValues.GRETotal) {
                                    setGREStatus(true);
                                } else {
                                    setGREStatus(false);
                                }
                            }}
                            type="number"
                            sx={disableNumberUpDown}
                            required={isGREQRequired}
                            error={isGREQError}
                            helperText={isGREQError ? "GRE数学分应在130-170之间" : null}
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
                                if (event.target.value || formValues.V || formValues.Q || formValues.GRETotal) {
                                    setGREStatus(true);
                                } else {
                                    setGREStatus(false);
                                }
                            }}
                            type="number"
                            sx={disableNumberUpDown}
                            required={isGREAWRequired}
                            error={isGREAWError}
                            helperText={isGREAWError ? "GRE写作分应在0-6之间" : null}
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