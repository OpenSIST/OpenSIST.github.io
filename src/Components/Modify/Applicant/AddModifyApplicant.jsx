import {Form, redirect, useLoaderData} from "react-router-dom";
import {addModifyApplicant} from "../../../Data/ApplicantData";
import {
    Box,
    Button,
    Divider, FormControl, Grid, Input, InputLabel, MenuItem, Paper,
    Step,
    StepButton,
    Stepper, TextField
} from "@mui/material";
import React, {useState} from "react";
import localforage from "localforage";
import BasicInfo from "./BasicInfo";
import Grades from "./Grades";
import SoftBackground from "./SoftBackground";
import {Add, Remove} from "@mui/icons-material";
import Select from "@mui/material/Select";
import {
    authorOrderOptions,
    exchangeDurationOptions,
    publicationStatusOptions,
    publicationTypeOptions, recommendationTypeOptions
} from "../../../Data/Schemas";

export async function action({request}) {
    const removeEmptyDictInList = (list) => {
        return list.filter(item => Object.values(item).filter(value => value !== [] && value !== "").length !== 0);
    }
    const formData = await request.formData();
    const ActionType = formData.get('ActionType');
    const formValues = JSON.parse(formData.get('formValues'));
    const Gender = formValues.Gender;
    const CurrentDegree = formValues.CurrentDegree;
    const ApplicationYear = formValues.ApplicationYear;
    const Major = formValues.Major;
    const GPA = Number(formValues.GPA);
    const Rank = Number(formValues.Rank);
    const RankTotal = Number(formValues.RankTotal);
    const Ranking = {
        ...(!isNaN(Rank) && { 'Rank': Rank }),
        ...(!isNaN(RankTotal) && { 'RankTotal': RankTotal })
    }
    const V = Number(formValues.V);
    const Q = Number(formValues.Q);
    const AW = Number(formValues.AW);
    const GRE = {
        ...(!isNaN(V) && { 'V': V }),
        ...(!isNaN(Q) && { 'Q': Q }),
        ...(!isNaN(AW) && { 'AW': AW }),
        ...(!isNaN(V) && !isNaN(Q) && { 'Total': V + Q })
    }
    const EnglishOption = formValues.EnglishOption;
    let EnglishProficiency = {};
    if (EnglishOption !== undefined) {
        const R = Number(formValues.R);
        const W = Number(formValues.W);
        const L = Number(formValues.L);
        const S = Number(formValues.S);
        if (EnglishOption === 'TOEFL') {
            EnglishProficiency = {
                "TOEFL" : {
                    ...(!isNaN(R) && { 'R': R }),
                    ...(!isNaN(W) && { 'W': W }),
                    ...(!isNaN(L) && { 'L': L }),
                    ...(!isNaN(S) && { 'S': S }),
                    ...(!isNaN(R) && !isNaN(W) && !isNaN(L) && !isNaN(S) && { 'Total': R + W + L + S })
                }
            }
        } else if (EnglishOption === 'IELTS'){
            EnglishProficiency = {
                "IELTS" : {
                    ...(!isNaN(R) && { 'R': R }),
                    ...(!isNaN(W) && { 'W': W }),
                    ...(!isNaN(L) && { 'L': L }),
                    ...(!isNaN(S) && { 'S': S }),
                    ...(!isNaN(R) && !isNaN(W) && !isNaN(L) && !isNaN(S) && { 'Total': Math.round((R + W + L + S) / 4 * 2) / 2 })
                }
            }
        }
    }
    const Exchange = formValues.Exchange ? removeEmptyDictInList(JSON.parse(formValues.Exchange)) : [];
    const Publication = formValues.Publication ? removeEmptyDictInList(JSON.parse(formValues.Publication)) : [];
    const Recommendation = formValues.Recommendation ? removeEmptyDictInList(JSON.parse(formValues.Recommendation)) : [];
    const ResearchFocus = formValues.ResearchFocus;
    const DomesticResearchNum = formValues.DomesticResearchNum;
    const DomesticResearchDetail = formValues.DomesticResearchDetail;
    const InternationalResearchNum = formValues.InternationalResearchNum;
    const InternationalResearchDetail = formValues.InternationalResearchDetail;
    const Research = {
        ...(ResearchFocus !== undefined && { 'Focus': ResearchFocus }),
        ...((DomesticResearchNum !== undefined || DomesticResearchDetail !== undefined) && { 'Domestic': {
                ...(DomesticResearchNum !== undefined && { 'Num': Number(DomesticResearchNum) }),
                ...(DomesticResearchDetail !== undefined && { 'Detail': DomesticResearchDetail })
            }
        }),
        ...((InternationalResearchNum !== undefined || InternationalResearchDetail !== undefined) && { 'International': {
                ...(InternationalResearchNum !== undefined && { 'Num': Number(InternationalResearchNum) }),
                ...(InternationalResearchDetail !== undefined && { 'Detail': InternationalResearchDetail })
            }
        })
    }
    const DomesticInternNum = formValues.DomesticInternNum;
    const DomesticInternDetail = formValues.DomesticInternDetail;
    const InternationalInternNum = formValues.InternationalInternNum;
    const InternationalInternDetail = formValues.InternationalInternDetail;
    const Internship = {
        ...((DomesticInternNum !== undefined || DomesticInternDetail !== undefined) && { 'Domestic': {
                ...(DomesticInternNum !== undefined && { 'Num': Number(DomesticInternNum) }),
                ...(DomesticInternDetail !== undefined && { 'Detail': DomesticInternDetail })
            }
        }),
        ...((InternationalInternNum !== undefined || InternationalInternDetail !== undefined) && { 'International': {
                ...(InternationalInternNum !== undefined && { 'Num': Number(InternationalInternNum) }),
                ...(InternationalInternDetail !== undefined && { 'Detail': InternationalInternDetail })
            }
        })
    }
    const Competition = formValues.Competition;
    const Programs = formValues.Programs;
    const userName = await localforage.getItem('user');
    const ApplicantID = `${userName}@${ApplicationYear}`;
    const requestBody = {
        'newApplicant': ActionType === 'new',
        'content': {
            'ApplicantID': ApplicantID,
            'Gender': Gender,
            'CurrentDegree': CurrentDegree,
            'ApplicationYear': ApplicationYear,
            'Major': Major,
            'GPA': GPA,
            ...(Object.keys(Ranking).length !== 0 && { 'Ranking': Ranking }),
            ...(Object.keys(GRE).length !== 0 && { 'GRE': GRE }),
            ...(Object.keys(EnglishProficiency).length !== 0 && { 'EnglishProficiency': EnglishProficiency }),
            ...(Exchange.length !== 0 && { 'Exchange': Exchange }),
            ...(Publication.length !== 0 && { 'Publication': Publication }),
            ...(Object.keys(Research).length !== 0 && { 'Research': Research }),
            ...(Object.keys(Internship).length !== 0 && { 'Internship': Internship }),
            ...(Recommendation.length !== 0 && { 'Recommendation': Recommendation }),
            ...(Competition !== undefined && { 'Competition': Competition }),
            'Programs': ActionType === 'new' ? {} : Programs
        }
    };
    console.log(requestBody)
    await addModifyApplicant(requestBody);
    return redirect(`/profile/${ApplicantID}`);
}

const FormContent = (activeStep, formValues, handleBack, handleNext, handleChange) => {
    {switch (activeStep) {
        case 0:
            return <BasicInfo formValues={formValues} handleNext={handleNext} handleChange={handleChange}/>;
        case 1:
            return <Grades formValues={formValues} handleBack={handleBack} handleNext={handleNext} handleChange={handleChange}/>;
        case 2:
            return <SoftBackground formValues={formValues} handleBack={handleBack} handleChange={handleChange}/>;
        default:
            return null;
    }}
}

export default function AddModifyApplicant({type}) {
    const steps = [
        '基本信息',
        '三维',
        '软背景'
    ];
    const [activeStep, setActiveStep] = useState(0);
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    const handleStep = (step) => () => {
        setActiveStep(step);
    };

    const loaderData = useLoaderData();
    const [formValues, setFormValues] = useState({});
    const handleChange = (event, value, name) => {
        setFormValues({...formValues, [event?.target.name ?? name]: value ?? event.target.value});
        if (event?.target.value === "" || (event?.target.name === undefined && (value === "" || value === undefined || value === null || value === '[]'))) {
            const {[event?.target.name ?? name]: _, ...rest} = formValues;
            setFormValues(rest);
        }
    }
    // console.log(formValues)

    return (
        <Form method='post'>
            <Input type='hidden' value={type} name='ActionType'></Input>
            <Stepper
                nonLinear
                alternativeLabel
                activeStep={activeStep}
                sx={{ mt: 10 }}
            >
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepButton color="inherit" sx={{"&.MuiButtonBase-root:hover": {
                                bgcolor: "transparent",
                                cursor: "default"
                            }}}>
                            {label}
                        </StepButton>
                    </Step>
                ))}
            </Stepper>
            <Input type="hidden" value={JSON.stringify(formValues)} name="formValues"/>
            {FormContent(activeStep, formValues, handleBack, handleNext, handleChange)}
        </Form>
    )
}