import {Form, redirect, useLoaderData} from "react-router-dom";
import {addModifyApplicant, getApplicant} from "../../../Data/ApplicantData";
import {
    Box,
    Input,
    Step,
    StepButton,
    Stepper
} from "@mui/material";
import React, {useState} from "react";
import BasicInfo from "./FormComponent/BasicInfo";
import SoftBackground from "./FormComponent/SoftBackground";
import {getDisplayName} from "../../../Data/UserData";
import {getPrograms} from "../../../Data/ProgramData";
import {blobToBase64} from "../../../Data/Common";
import {addModifyFile, getFileObject, removeFile} from "../../../Data/FileData";

export async function loader({params}) {
    let programs = await getPrograms();
    programs = Object.values(programs).flat().map(program => program.ProgramID);
    let applicant = null;
    let cvPost = null;
    let sopPost = null;
    if (params.applicantId) {
        applicant = await getApplicant(params.applicantId);
        if (applicant.Posts && applicant.Posts.length > 0) {
            for (const postId of applicant.Posts) {
                if (postId.startsWith("CV")) {
                    cvPost = await getFileObject(postId);
                } else if (postId.startsWith("SoP")) {
                    sopPost = await getFileObject(postId);
                }
            }
        }
    }
    return {programs, applicant, cvPost, sopPost};
}

export async function action({request}) {
    const removeEmptyDictInList = (list) => {
        return list.filter(item => Object.values(item).filter(value => value.length > 0).length !== 0);
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
        'Total': GRETotal ? Number(GRETotal) : 260,
        'V': V ? Number(V) : 130,
        'Q': Q ? Number(Q) : 130,
        'AW': AW ? Number(AW) : 0
    }
    const EnglishOption = formValues.EnglishOption;
    const EnglishTotal = formValues.EnglishTotal;
    const R = formValues.R;
    const W = formValues.W;
    const L = formValues.L;
    const S = formValues.S;
    const EnglishProficiency = {
        [EnglishOption === 'IELTS' ? 'IELTS' : 'TOEFL']: {
            'Total': EnglishTotal ? Number(EnglishTotal) : null,
            'R': R ? Number(R) : null,
            'W': W ? Number(W) : null,
            'L': L ? Number(L) : null,
            'S': S ? Number(S) : null,
        }
    }
    console.log(EnglishProficiency);
    console.log(((EnglishTotal && R && W && L && S) && {'EnglishProficiency': EnglishProficiency}))
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
    const Final = formValues.Final;
    const Programs = formValues.Programs;
    const Posts = ActionType === 'new' ? [] : formValues.Posts;
    const displayName = await getDisplayName();
    const ApplicantID = `${displayName}@${ApplicationYear}`;
    let requestBody = {
        'newApplicant': ActionType === 'new',
        'content': {
            'ApplicantID': ApplicantID,
            'Gender': Gender,
            'CurrentDegree': CurrentDegree,
            'ApplicationYear': ApplicationYear,
            'Major': Major,
            'GPA': GPA,
            'Ranking': Ranking,
            ...((GRE.Total !== 260 || GRE.V !== 130 || GRE.Q !== 130 || GRE.AW !== 0) && {'GRE': GRE}),
            // 'EnglishProficiency': EnglishProficiency,
            ...{'EnglishProficiency': ((EnglishTotal && R && W && L && S) ? EnglishProficiency : {})},
            ...(Exchange.length !== 0 && {'Exchange': Exchange}),
            ...(Publication.length !== 0 && {'Publication': Publication}),
            'Research': Research,
            'Internship': Internship,
            ...(Recommendation.length !== 0 && {'Recommendation': Recommendation}),
            ...(Competition !== undefined && {'Competition': Competition}),
            'Programs': ActionType === 'new' ? {} : Programs,
            'Final': Final === undefined ? "" : Final,
            'Posts': Posts
        }
    };
    await addModifyApplicant(requestBody);

    const PDFNewRequestBody = (type, content, title) => {
        return {
            'ApplicantID': ApplicantID,
            'content': {
                'type': type,
                'Title': `${title}`,
                'Content': content
            }
        }
    }

    const PDFEditRequestBody = (type, postID, content, title) => {
        return {
            'PostID': postID,
            'content': {
                'Title': `${title}`,
                'Content': content
            }
        }
    }

    async function PDFRequesting(type) {
        /*
        * App.Posts.includes(PDF) && PDF -> edit
        * App.Posts.includes(PDF) && !PDF -> remove
        * !App.Posts.includes(PDF) && PDF -> new
        * !App.Posts.includes(PDF) && !PDF -> nothing
        */
        const postID = formValues[type]?.PostID;
        const title = formValues[type]?.Title;
        const file = formData.get(type);
        /*
        * when file.name === ''
        * only three possible conditions:
        * 1. existed before, user did nothing.
        * 2. existed before, user deleted it.
        * 3. not existed before, user did nothing
        */
        let pdfContent = await blobToBase64(file);
        if (Posts.includes(postID) && title) {
            if (file.name === '') {
                return;
            }
            const requestBody = PDFEditRequestBody(type, postID, pdfContent, title);
            await addModifyFile(requestBody, 'edit');
        } else if (Posts.includes(postID) && !title) {
            await removeFile(postID, ApplicantID);
        } else if (!Posts.includes(postID) && title) {
            const requestBody = PDFNewRequestBody(type, pdfContent, title);
            await addModifyFile(requestBody, 'new');
        }
    }

    await PDFRequesting('CV');
    await PDFRequesting('SoP');

    return redirect(`/profile/${ApplicantID}`);
}

const FormContent = (activeStep, formValues, handleBack, handleNext, handleChange, type, loaderData) => {
    switch (activeStep) {
        case 0:
            return <BasicInfo formValues={formValues} handleNext={handleNext} handleChange={handleChange}
                              actionType={type} loaderData={loaderData}/>;
        case 1:
            return <SoftBackground formValues={formValues} handleBack={handleBack} handleChange={handleChange}
                                   loaderData={loaderData}/>;
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

    let applicantContent = loaderData.applicant;
    if (applicantContent) {
        applicantContent = {
            'Gender': applicantContent.Gender,
            'CurrentDegree': applicantContent.CurrentDegree,
            'ApplicationYear': applicantContent.ApplicationYear,
            'Major': applicantContent.Major,
            'GPA': applicantContent.GPA,
            'Ranking': applicantContent.Ranking,
            'V': applicantContent.GRE?.V,
            'Q': applicantContent.GRE?.Q,
            'AW': applicantContent.GRE?.AW,
            'GRETotal': applicantContent.GRE?.Total,
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
            'Recommendation': applicantContent.Recommendation,
            'Final': applicantContent.Final,
            'Posts': applicantContent.Posts,
            'CV': {
                PostID: loaderData.cvPost?.PostID,
                Title: loaderData.cvPost?.Title
            },
            'SoP': {
                PostID: loaderData.sopPost?.PostID,
                Title: loaderData.sopPost?.Title
            }
        }
    }
    const [formValues, setFormValues] = useState(applicantContent ?? {});
    const handleChange = (event, value, name) => {
        console.log(event?.target?.name, event?.target?.value, value, name)
        console.log({[event?.target.name ? event?.target.name : name]: value ? value : event?.target.value})
        setFormValues({
            ...formValues,
            [event?.target.name ? event?.target.name : name]: value ? value : event?.target.value
        });
        console.log(formValues);
        if (event?.target.value === "" || (event?.target.name === undefined && (value === "" || value === undefined || value === null || value === '[]'))) {
            if (name === "EnglishOption" || name === "R" || name === "W" || name === "L" || name === "S" || name === "EnglishTotal") {
                if (name === "EnglishOption") {
                    setFormValues({
                        ...formValues,
                        'EnglishTotal': undefined,
                        'R': undefined,
                        'W': undefined,
                        'L': undefined,
                        'S': undefined
                    });
                }
                return
            }
            const {[event?.target.name ? event?.target.name : name]: _, ...rest} = formValues;
            setFormValues(rest);
        }
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