import React from "react";
import {
    Box,
    Button,
    Grid,
    IconButton,
    Paper,
    TextField,
    Tooltip
} from "@mui/material";
import {HelpOutline} from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import {
    applicationYearOptions,
    currentDegreeOptions,
    genderOptions,
    majorOptions,
} from "../../../Data/Schemas";

function BasicInfo({formValues, handleNext, handleChange}) {
    const addEndAdornment = (endAdornment) => {
        const children = React.Children.toArray(endAdornment.props.children);
        children.push(
            <Tooltip
                title='例：若申请2024Fall或2024Spring，则统一填2024'
                arrow
                key="hint"
            >
                <IconButton size="small">
                    <HelpOutline/>
                </IconButton>
            </Tooltip>
        );
        return React.cloneElement(endAdornment, {...endAdornment.props}, children);
    }

    const isError = () => {
        return !formValues.Gender || !formValues.CurrentDegree || !formValues.ApplicationYear || !formValues.Major;
    }

    return (
        <Paper variant='outlined' sx={{width: '60%', margin: '10px'}}>
            <Grid
                container
                spacing={2}
                sx={{width: '70%', justifyContent: 'center', margin: 0}}
            >
                <Grid item xs={12} md={6}>
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
                </Grid>
                <Grid item xs={12} md={6}>
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
                </Grid>
                <Grid item xs={12} md={6}>
                    <Autocomplete
                        fullWidth
                        options={applicationYearOptions}
                        renderInput={
                            (params) =>
                                <TextField
                                    {...params}
                                    label="申请年份"
                                    size="small"
                                    variant="outlined"
                                    name="ApplicationYear"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: addEndAdornment(params.InputProps.endAdornment),
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
                </Grid>
                <Grid item xs={12} md={6}>
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
                </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-end", margin: 3 }}>
                <Button
                    sx={{ mr: 1 }}
                    variant='contained'
                    onClick={handleNext}
                    // disabled={isError()}
                >
                    下一步
                </Button>
            </Box>
        </Paper>
    )
}

export default BasicInfo