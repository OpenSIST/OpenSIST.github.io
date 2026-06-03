import {Form, redirect, useLoaderData} from "react-router-dom";
import {addModifyApplicant, getApplicant} from "../../../Data/ApplicantData";
import {Box, Input, Step, StepButton, Stepper} from "@mui/material";
import React, {useState} from "react";
import BasicInfo from "./FormComponent/BasicInfo";
import SoftBackground from "./FormComponent/SoftBackground";
import {getDisplayName} from "../../../Data/UserData";
import {getPrograms} from "../../../Data/ProgramData";
import {getFiles} from "../../../Data/FileData";
import {createApplicantRequestBody, createInitialApplicantFormValues, syncApplicantFile,} from "./applicantFormData";
import {decodePathParam, profileApplicantPath} from "../../RouteUtils";

export async function loader({params}) {
    let programs = await getPrograms();
    programs = Object.values(programs).flat().map(program => program.ProgramID);
    let applicant = null;
    let cvPost = null;
    let sopPost = null;
    if (params.applicantId) {
        applicant = await getApplicant(decodePathParam(params.applicantId));
        if (applicant.Posts && applicant.Posts.length > 0) {
            const applicantPostIds = new Set(applicant.Posts.map(String));
            const files = (await getFiles()).filter(file => applicantPostIds.has(file.PostID.toString()));
            cvPost = files.find(file => file.PostID.startsWith("CV"));
            sopPost = files.find(file => file.PostID.startsWith("SoP"));
        }
    }
    return {programs, applicant, cvPost, sopPost};
}

export async function action({request}) {
    const formData = await request.formData();
    const actionType = formData.get('ActionType');
    const formValues = JSON.parse(formData.get('formValues'));
    const ApplicationYear = formValues.ApplicationYear;
    const posts = actionType === 'new' ? [] : (formValues.Posts ?? []);
    const displayName = await getDisplayName();
    const applicantId = `${displayName}@${ApplicationYear}`;
    const requestBody = createApplicantRequestBody(formValues, actionType, applicantId);
    await addModifyApplicant(requestBody);

    await syncApplicantFile({applicantId, fileType: 'CV', formData, formValues, posts});
    await syncApplicantFile({applicantId, fileType: 'SoP', formData, formValues, posts});

    return redirect(profileApplicantPath(applicantId));
}

const FormContent = (activeStep, formValues, handleBack, handleNext, handleChange, type, loaderData) => {
    switch (activeStep) {
        case 0:
            return <BasicInfo formValues={formValues} handleNext={handleNext} handleChange={handleChange}
                              actionType={type} loaderData={loaderData}/>;
        case 1:
            return <SoftBackground formValues={formValues} handleBack={handleBack} handleChange={handleChange}/>;
        default:
            return null;
    }
}

export default function AddModifyApplicant({type}) {
    const loaderData = useLoaderData();
    const steps = [
        '基本信息',
        '软背景'
    ];
    const [activeStep, setActiveStep] = useState(0);
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const applicantContent = createInitialApplicantFormValues(loaderData.applicant, loaderData.cvPost, loaderData.sopPost);
    const [formValues, setFormValues] = useState(applicantContent ?? {});
    const handleChange = (event, value, name) => {
        const fieldName = event?.target?.name ?? name;
        const nextValue = value ?? event?.target?.value;
        const isEmpty = nextValue === '' || nextValue === null || nextValue === undefined || nextValue === '[]';
        setFormValues((currentValues) => {
            const updatedValues = {...currentValues};
            if (fieldName === 'EnglishOption' && isEmpty) {
                delete updatedValues.EnglishOption;
                delete updatedValues.EnglishTotal;
                delete updatedValues.R;
                delete updatedValues.W;
                delete updatedValues.L;
                delete updatedValues.S;
            } else if (isEmpty) {
                delete updatedValues[fieldName];
            } else {
                updatedValues[fieldName] = nextValue;
            }
            return updatedValues;
        });
    }
    return (
        <Form method='post' encType='multipart/form-data'>
            <Input type='hidden' value={type} name='ActionType'/>
            <Stepper
                nonLinear
                alternativeLabel
                activeStep={activeStep}
                sx={{mt: 10}}
            >
                {steps.map((label) => (
                    <Step key={label}>
                        <StepButton color="inherit" sx={{
                            "&.MuiButtonBase-root:hover": {
                                bgcolor: "transparent",
                                cursor: "default"
                            }
                        }}>
                            {label}
                        </StepButton>
                    </Step>
                ))}
            </Stepper>
            <Input type="hidden" value={JSON.stringify(formValues)} name="formValues"/>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center"
                }}
            >
                {FormContent(activeStep, formValues, handleBack, handleNext, handleChange, type, loaderData)}
            </Box>
        </Form>
    )
}
