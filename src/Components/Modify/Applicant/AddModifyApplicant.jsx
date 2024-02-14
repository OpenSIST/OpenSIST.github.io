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
    const Ranking = formValues.Ranking;
    const V = formValues.V;
    const Q = formValues.Q;
    const AW = formValues.AW;
    const GRETotal = formValues.GRETotal;
    const GRE = {
        'Total': GRETotal ? Number(GRETotal) : 0,
        'V': V ? Number(V) : 0,
        'Q': Q ? Number(Q) : 0,
        'AW': AW ? Number(AW) : 0
    }
    const EnglishOption = formValues.EnglishOption;
    let EnglishProficiency = {};
    if (EnglishOption !== undefined) {
        const EnglishTotal = formValues.EnglishTotal;
        const R = formValues.R;
        const W = formValues.W;
        const L = formValues.L;
        const S = formValues.S;
        if (EnglishOption === 'TOEFL') {
            EnglishProficiency = {
                "TOEFL" : {
                    'Total': EnglishTotal ? Number(EnglishTotal) : 0,
                    'R': R ? Number(R) : 0,
                    'W': W ? Number(W) : 0,
                    'L': L ? Number(L) : 0,
                    'S': S ? Number(S) : 0,
                }
            }
        } else if (EnglishOption === 'IELTS'){
            EnglishProficiency = {
                "IELTS" : {
                    'Total': EnglishTotal ? Number(EnglishTotal) : 0,
                    'R': R ? Number(R) : 0,
                    'W': W ? Number(W) : 0,
                    'L': L ? Number(L) : 0,
                    'S': S ? Number(S) : 0,
                }
            }
        }
    }
    const Exchange = formValues.Exchange ? removeEmptyDictInList(formValues.Exchange) : [];
    const Publication = formValues.Publication ? removeEmptyDictInList(formValues.Publication) : [];
    const Recommendation = formValues.Recommendation ? removeEmptyDictInList(formValues.Recommendation) : [];
    const ResearchFocus = formValues.ResearchFocus;
    const DomesticResearchNum = formValues.DomesticResearchNum;
    const DomesticResearchDetail = formValues.DomesticResearchDetail;
    const InternationalResearchNum = formValues.InternationalResearchNum;
    const InternationalResearchDetail = formValues.InternationalResearchDetail;
    const Research = {
        'Focus': ResearchFocus ?? "",
        'Domestic': {
            'Num': DomesticResearchNum ? Number(DomesticResearchNum) : 0,
            'Detail': DomesticResearchDetail ?? ""
        },
        'International': {
            'Num': InternationalResearchNum ? Number(InternationalResearchNum) : 0,
            'Detail': InternationalResearchDetail ?? ""
        }
    }
    const DomesticInternNum = formValues.DomesticInternNum;
    const DomesticInternDetail = formValues.DomesticInternDetail;
    const InternationalInternNum = formValues.InternationalInternNum;
    const InternationalInternDetail = formValues.InternationalInternDetail;
    const Internship = {
        'Domestic': {
            'Num': DomesticInternNum ? Number(DomesticInternNum) : 0,
            'Detail': DomesticInternDetail ?? ""
        },
        'International': {
            'Num': InternationalInternNum ? Number(InternationalInternNum) : 0,
            'Detail': InternationalInternDetail ?? ""
        }
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
            ...(Ranking !== undefined && { 'Ranking': Ranking }),
            ...(Object.values(GRE).some(value => value !== 0) && { 'GRE': GRE }),
            ...(Object.keys(EnglishProficiency).length !== 0 && { 'EnglishProficiency': EnglishProficiency }),
            ...(Exchange.length !== 0 && { 'Exchange': Exchange }),
            ...(Publication.length !== 0 && { 'Publication': Publication }),
            'Research': Research,
            'Internship': Internship,
            ...(Recommendation.length !== 0 && { 'Recommendation': Recommendation }),
            ...(Competition !== undefined && { 'Competition': Competition }),
            'Programs': ActionType === 'new' ? {} : Programs
        }
    };
    // console.log(requestBody)
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

    let applicantContent = useLoaderData()?.applicant;
    if (applicantContent) {
        applicantContent = {
            'Gender': applicantContent.Gender,
            'CurrentDegree': applicantContent.CurrentDegree,
            'ApplicationYear': applicantContent.ApplicationYear,
            'Major': applicantContent.Major,
            'GPA': applicantContent.GPA,
            ...(applicantContent.Ranking && {
                'Ranking': applicantContent.Ranking
            }),
            'V': applicantContent.GRE?.V,
            'Q': applicantContent.GRE?.Q,
            'AW': applicantContent.GRE?.AW,
            'GRETotal': applicantContent.GRE?.GRETotal,
            ...(applicantContent.EnglishProficiency?.TOEFL && {
                'EnglishOption': 'TOEFL',
                'EnglishTotal': applicantContent.EnglishProficiency.TOEFL.Total,
                'R': applicantContent.EnglishProficiency.TOEFL.R,
                'W': applicantContent.EnglishProficiency.TOEFL.W,
                'L': applicantContent.EnglishProficiency.TOEFL.L,
                'S': applicantContent.EnglishProficiency.TOEFL.S
            }),
            ...(applicantContent.EnglishProficiency?.IELTS && {
                'EnglishOption': 'IELTS',
                'EnglishTotal': applicantContent.EnglishProficiency.IELTS.Total,
                'R': applicantContent.EnglishProficiency.IELTS.R,
                'W': applicantContent.EnglishProficiency.IELTS.W,
                'L': applicantContent.EnglishProficiency.IELTS.L,
                'S': applicantContent.EnglishProficiency.IELTS.S
            }),
            'ResearchFocus': applicantContent.Research?.Focus,
            'DomesticResearchNum': applicantContent.Research?.Domestic?.Num,
            'DomesticResearchDetail': applicantContent.Research?.Domestic?.Detail,
            'InternationalResearchNum': applicantContent.Research?.International?.Num,
            'InternationalResearchDetail': applicantContent.Research?.International?.Detail,
            'DomesticInternNum': applicantContent.Internship?.Domestic?.Num,
            'DomesticInternDetail': applicantContent.Internship?.Domestic?.Detail,
            'InternationalInternNum': applicantContent.Internship?.International?.Num,
            'InternationalInternDetail': applicantContent.Internship?.International?.Detail,
            'Competition': applicantContent.Competition,
            'Programs': applicantContent.Programs,
            'Exchange': applicantContent.Exchange,
            'Publication': applicantContent.Publication,
            'Recommendation': applicantContent.Recommendation
        }
    }
    const [formValues, setFormValues] = useState(applicantContent ?? {});
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