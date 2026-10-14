import {Box, Button, Link as MuiLink, Paper, TextField, Tooltip} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid2 from "@mui/material/Grid";
import {HelpOutline} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {applicationYearOptions, currentDegreeOptions, englishOptions, genderOptions, list2Options, majorOptions, rankPercentOptions,} from "../../../../Data/Schemas";
import {FormSection, numberInputSx, sectionGridSx} from "./ApplicantFormShared";
import "../AddModifyApplicant.css";

const englishScoreFields = [
    ['R', '阅读'],
    ['L', '听力'],
    ['S', '口语'],
    ['W', '写作'],
];

const greScoreFields = [
    ['V', '语文', 130, 170],
    ['Q', '数学', 130, 170],
    ['AW', '写作', 0, 6],
];

function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

function isOutsideRange(value, minimum, maximum) {
    return hasValue(value) && (Number(value) < minimum || Number(value) > maximum);
}

function OptionField({
                         endAdornment,
                         helperText,
                         label,
                         name,
                         onChange,
                         options,
                         readOnly = false,
                         required = false,
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
                    size="small"
                    variant="outlined"
                    name={name}
                    required={required}
                    helperText={helperText}
                    FormHelperTextProps={helperText ? {component: 'div'} : undefined}
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
            value={hasValue(value) ? options.find((option) => option.value === value) ?? null : null}
            onChange={(event, newValue) => onChange(event, newValue?.value, name)}
        />
    );
}

function NumberField({error, helperText, label, name, onChange, required = false, value, InputProps}) {
    return (
        <TextField
            fullWidth
            name={name}
            label={label}
            variant="outlined"
            size="small"
            required={required}
            value={value ?? ""}
            onChange={onChange}
            type="number"
            sx={numberInputSx}
            error={error}
            helperText={error ? helperText : null}
            InputProps={InputProps}
        />
    );
}

function BasicInfo({formValues, handleNext, handleChange, actionType, loaderData}) {
    const navigate = useNavigate();
    const finalOptions = list2Options(loaderData.programs);
    const requiredGreValues = [formValues.GRETotal, formValues.V, formValues.Q, formValues.AW];
    const isGreRequired = requiredGreValues.some(hasValue);
    const englishMaximum = formValues.EnglishOption === 'TOEFL' ? 30 : 9;
    const englishErrors = Object.fromEntries(englishScoreFields.map(([name]) => (
        [name, isOutsideRange(formValues[name], 0, englishMaximum)]
    )));
    const greErrors = Object.fromEntries(greScoreFields.map(([name, , minimum, maximum]) => (
        [name, isOutsideRange(formValues[name], minimum, maximum)]
    )));
    const isGpaError = isOutsideRange(formValues.GPA, 0, 4);
    const isEnglishTotalError = isOutsideRange(
        formValues.EnglishTotal,
        0,
        formValues.EnglishOption === 'TOEFL' ? 120 : 9
    );
    const isGreTotalError = isOutsideRange(formValues.GRETotal, 260, 340);
    const hasRequiredValue = ['Gender', 'CurrentDegree', 'ApplicationYear', 'Major', 'GPA', 'Ranking']
        .every((name) => hasValue(formValues[name]));
    const hasIncompleteGre = isGreRequired && requiredGreValues.some((value) => !hasValue(value));
    const hasError = !hasRequiredValue || hasIncompleteGre || isGpaError || isEnglishTotalError ||
        Object.values(englishErrors).some(Boolean) || isGreTotalError || Object.values(greErrors).some(Boolean);

    return (
        <Paper
            variant='elevation'
            sx={{
                width: '100%',
                bgcolor: (theme) => theme.palette.surface,
                borderRadius: 3,
                pb: 1,
            }}
            elevation={0}
        >
            <FormSection title="申请人基本信息">
                <Grid2 container spacing={2} sx={sectionGridSx}>
                    <Grid2 size={{xs: 12, md: 6}}>
                        <OptionField name="Gender" label="申请人性别" options={genderOptions}
                                     value={formValues.Gender} onChange={handleChange} required/>
                    </Grid2>
                    <Grid2 size={{xs: 12, md: 6}}>
                        <OptionField name="CurrentDegree" label="申请时身份" options={currentDegreeOptions}
                                     value={formValues.CurrentDegree} onChange={handleChange} required/>
                    </Grid2>
                    <Grid2 size={{xs: 12, md: 6}}>
                        <OptionField
                            name="ApplicationYear"
                            label={`申请年份 ${actionType === 'edit' ? ' (不可修改)' : ''}`}
                            options={applicationYearOptions}
                            value={formValues.ApplicationYear}
                            onChange={handleChange}
                            readOnly={actionType === 'edit'}
                            required
                            endAdornment={
                                <Tooltip
                                    title='例：若申请2024Fall或2024Spring，则统一填2024'
                                    enterTouchDelay={0}
                                    arrow
                                >
                                    <HelpOutline/>
                                </Tooltip>
                            }
                        />
                    </Grid2>
                    <Grid2 size={{xs: 12, md: 6}}>
                        <OptionField name="Major" label="申请人专业" options={majorOptions}
                                     value={formValues.Major} onChange={handleChange} required/>
                    </Grid2>
                </Grid2>
            </FormSection>
            <FormSection title="学业成绩">
                <Grid2 container spacing={2} sx={sectionGridSx}>
                    <Grid2 size={{xs: 12, md: 6}}>
                        <NumberField
                            name="GPA"
                            label="GPA"
                            value={formValues.GPA}
                            onChange={handleChange}
                            error={isGpaError}
                            helperText="GPA应在0-4之间"
                            required
                            InputProps={{
                                endAdornment: (
                                    <Tooltip
                                        title='填写在该申请季用于申请的最高学历的GPA'
                                        enterTouchDelay={0}
                                        arrow
                                        sx={{cursor: 'pointer'}}
                                    >
                                        <HelpOutline/>
                                    </Tooltip>
                                ),
                            }}
                        />
                    </Grid2>
                    <Grid2 size={{xs: 12, md: 6}}>
                        <OptionField name="Ranking" label="学院或专业排名" options={rankPercentOptions}
                                     value={formValues.Ranking} onChange={handleChange} required/>
                    </Grid2>
                </Grid2>
            </FormSection>
            <FormSection title="英语成绩">
                <Grid2 container spacing={2} sx={sectionGridSx}>
                    <Grid2 size={12}>
                        <OptionField name="EnglishOption" label="选择考试" options={englishOptions}
                                     value={formValues.EnglishOption} onChange={handleChange}/>
                    </Grid2>
                    {formValues.EnglishOption ? <>
                        <Grid2 size={12}>
                            <NumberField
                                name="EnglishTotal"
                                label="总分"
                                value={formValues.EnglishTotal}
                                onChange={handleChange}
                                error={isEnglishTotalError}
                                helperText={formValues.EnglishOption === 'TOEFL' ?
                                    "TOEFL总分应在0-120之间" : "IELTS总分应在0-9之间"}
                            />
                        </Grid2>
                        {englishScoreFields.map(([name, label]) => (
                            <Grid2 key={name} size={{xs: 12, md: 3}}>
                                <NumberField
                                    name={name}
                                    label={label}
                                    value={formValues[name]}
                                    onChange={handleChange}
                                    error={englishErrors[name]}
                                    helperText={formValues.EnglishOption === 'TOEFL' ?
                                        `TOEFL${label}分应在0-30之间` : `IELTS${label}分应在0-9之间`}
                                />
                            </Grid2>
                        ))}
                    </> : null}
                </Grid2>
            </FormSection>
            <FormSection title="GRE成绩">
                <Grid2 container spacing={2} sx={sectionGridSx}>
                    <Grid2 size={12}>
                        <NumberField
                            name="GRETotal"
                            label="V+Q总分"
                            value={formValues.GRETotal}
                            onChange={handleChange}
                            error={isGreTotalError}
                            helperText="GRE总分应在260-340之间"
                            required={isGreRequired}
                        />
                    </Grid2>
                    {greScoreFields.map(([name, label]) => (
                        <Grid2 key={name} size={{xs: 12, md: 4}}>
                            <NumberField
                                name={name}
                                label={label}
                                value={formValues[name]}
                                onChange={handleChange}
                                error={greErrors[name]}
                                helperText={`GRE${label}分应在${name === 'AW' ? '0-6' : '130-170'}之间`}
                                required={isGreRequired}
                            />
                        </Grid2>
                    ))}
                </Grid2>
            </FormSection>
            <FormSection title="最终去向">
                <Grid2 container spacing={2} sx={sectionGridSx}>
                    <Grid2 size={12}>
                        <OptionField
                            name="Final"
                            label="最终去向"
                            options={finalOptions}
                            value={formValues.Final}
                            onChange={handleChange}
                            helperText={
                                <MuiLink href='/programs/new'>如果未找到项目，请点此前往添加项目信息</MuiLink>
                            }
                        />
                    </Grid2>
                </Grid2>
            </FormSection>
            <Box sx={{display: "flex", justifyContent: "flex-end", margin: 3}}>
                <Button sx={{mr: 1}} variant='contained' onClick={() => navigate("..")}>
                    取消
                </Button>
                <Button sx={{mr: 2}} variant='contained' onClick={handleNext} disabled={hasError}>
                    下一步
                </Button>
            </Box>
        </Paper>
    );
}

export default BasicInfo
