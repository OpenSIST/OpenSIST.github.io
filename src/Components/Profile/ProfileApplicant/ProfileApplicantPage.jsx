import {getRecordByApplicant} from "../../../Data/RecordData";
import {Form, redirect, useLoaderData, useParams} from "react-router-dom";
import {
    Avatar, Badge,
    Box,
    Card,
    CardActionArea, Chip,
    Divider, IconButton,
    InputLabel,
    OutlinedInput, Paper, Slider, styled,
    Tooltip,
    Typography, useTheme
} from "@mui/material";
import {Add, Delete, Edit} from "@mui/icons-material";
import "./ProfileApplicantPage.css";
import {Link} from 'react-router-dom';
import {getApplicant, getApplicantIDByUserID, removeApplicant} from "../../../Data/ApplicantData";
import Grid2 from "@mui/material/Unstable_Grid2";
import HelpIcon from '@mui/icons-material/Help';
import {
    currentDegreeMapping,
    currentDegreeOptions,
    EnglishExamMapping, genderOptions,
    PublicationAuthorOrderChipColor,
    PublicationStateChipColor,
    PublicationTypeChipColor, rankPercentOptions, rankPercentSliderValueMapping, SliderValueRankStringMapping
} from "../../../Data/Schemas";
import {Fragment} from "react";
import localforage from "localforage";

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';

const ContentCenteredGrid = styled(Grid2)(({theme}) => ({
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    // margin: '0 1rem',
}));

const ItemBox = styled(Box)(({theme}) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
}))


export async function loader({params}) {
    const applicantId = params.applicantId;
    const user = await localforage.getItem('user');
    const valid_applicant_list = await getApplicantIDByUserID(user);
    if (!valid_applicant_list.includes(applicantId)) {
        throw new Error('Unauthorized');
    }
    const applicant = await getApplicant(applicantId);
    const records = await getRecordByApplicant(applicantId);
    return {applicantId, applicant, records};
}

export async function action({params}) {
    const applicantId = params.applicantId;
    await removeApplicant(applicantId);
    return redirect('/profile');
}

export function ProfileApplicantPage() {
    const {applicantId, applicant, records} = useLoaderData();
    return (
        <Fragment key={applicant.ApplicantID}>
            <Grid2 container xs={12}>
                <BasicInfoBlock applicant={applicant}/>
            </Grid2>
        </Fragment>
    )
}

function GenderIcon({gender}) {
    switch (gender) {
        case 'Male':
            return <MaleIcon/>;
        case 'Female':
            return <FemaleIcon/>;
        case 'Others':
            return <TransgenderIcon/>;
        default:
            return null;
    }
}

function BasicInfoBlock({applicant}) {
    const valuetext = (value) => {
        return SliderValueRankStringMapping[value];
    }
    const sliderValue = rankPercentSliderValueMapping[applicant.Ranking];
    const marks = [
        {
            value: 2,
            label: '1.7',
        },
        {
            value: sliderValue,
            label: applicant.GPA,
        },
    ]
    if (sliderValue !== 95) {
        marks.push({
            value: 98,
            label: '4.0',
        })
    }
    return (
        <Grid2 component={Paper} className="BasicInfoBlock" container spacing={4} xs={12}>
            <Grid2 container xs={12} md={4}>
                <ContentCenteredGrid>
                    <Badge
                        badgeContent={<GenderIcon gender={applicant.Gender}/>}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        overlap='circular'
                        color="primary"
                    >
                        <Avatar sx={{width: 100, height: 100}}/>
                    </Badge>
                </ContentCenteredGrid>
                <Grid2 container spacing={0} xs>
                    <ContentCenteredGrid xs={12}>
                        <Typography
                            variant="h4"
                            color="primary"
                            sx={{fontWeight: 'bold'}}
                        >
                            {applicant.ApplicantID}
                        </Typography>
                    </ContentCenteredGrid>
                    <ContentCenteredGrid xs={12}>
                        <Typography variant="subtitle1">
                            {`${applicant.Major} ${currentDegreeMapping[applicant.CurrentDegree]}`}
                        </Typography>
                    </ContentCenteredGrid>
                </Grid2>
                <ContentCenteredGrid xs={12}>
                    <Typography variant="subtitle1">申请时最高学位GPA以及对应专业排名：</Typography>
                </ContentCenteredGrid>
                <ContentCenteredGrid xs={12}>
                    <Slider
                        defaultValue={sliderValue}
                        getAriaValueText={valuetext}
                        valueLabelFormat={valuetext}
                        valueLabelDisplay="on"
                        marks={marks}
                        className='RankingSlider'
                    />
                </ContentCenteredGrid>
            </Grid2>
            <GREBlock GRE={applicant?.GRE}/>
            <EnglishExamBlock EnglishProficiency={applicant?.EnglishProficiency}/>
        </Grid2>
    )
}

function GREBlock({GRE}) {
    if (!GRE) {
        GRE = {
            "Total": "-",
            "V": "-",
            "Q": "-",
            "AW": "-"
        }
    }
    return (
        <Grid2 container xs={12} md={4}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', justifyContent: 'center'}}>
                <Typography variant="h6" sx={{fontWeight: 'bold'}}>GRE</Typography>
                <Typography>{GRE.Total}</Typography>
            </ContentCenteredGrid>
            {Object.entries(GRE).map(([key, value]) => {
                return (
                    <ContentCenteredGrid xs={6} key={key} sx={{flexDirection: 'column', justifyContent: 'center'}}>
                        <Typography variant="subtitle1"
                                    sx={{fontWeight: 'bold'}}>{EnglishExamMapping["GRE"][key]}</Typography>
                        <Typography>{value}</Typography>
                    </ContentCenteredGrid>
                )
            })}

        </Grid2>
    )
}

function EnglishExamBlock({EnglishProficiency}) {
    if (!EnglishProficiency || Object.keys(EnglishProficiency).length === 0) {
        EnglishProficiency = {
            "EnglishProficiency": {
                "Total": "-",
                "S": "-",
                "R": "-",
                "L": "-",
                "W": "-"
            }
        }
    }
    return (
        <>
            {Object.entries(EnglishProficiency).map(([examType, grade]) => {
                return (
                    <Grid2 container xs={12} md={4} key={examType}>
                        <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', justifyContent: 'center'}}>
                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>{examType}</Typography>
                            <Typography>{grade.Total}</Typography>
                        </ContentCenteredGrid>
                        {Object.entries(grade).map(([key, value]) => {
                            if (key === 'Total') {
                                return null;
                            }
                            return (
                                <ContentCenteredGrid xs={6} key={key}
                                                     sx={{flexDirection: 'column', justifyContent: 'center'}}>
                                    <Typography variant="subtitle1"
                                                sx={{fontWeight: 'bold'}}>{EnglishExamMapping[examType][key]}</Typography>
                                    <Typography>{value}</Typography>
                                </ContentCenteredGrid>
                            )
                        })}
                    </Grid2>
                )
            })}
        </>
    )

}

function ExchangeBlock({Exchanges}) {

}

function ResearchBlock({Researches}) {

}

function InternshipBlock({Internships}) {

}

function PublicationBlock({Publications}) {

}

function RecommendationBlock({Recommendations}) {

}

function CompetitionBlock({Competitions}) {

}

const libn = {
    "ApplicantID": "libn@2024",
    "Gender": "Male",
    "CurrentDegree": "Undergraduate",
    "ApplicationYear": 2024,
    "Major": "CS",
    "GPA": 3.89,
    "Ranking": "3",
    "EnglishProficiency": {
        "TOEFL": {
            "Total": 110,
            "S": 25,
            "R": 30,
            "L": 29,
            "W": 26
        }
    },
    "Publication": [
        {
            "Type": "Conference",
            "Name": "ML4H",
            "AuthorOrder": "First",
            "Status": "Accepted",
            "Detail": ""
        }
    ],
    "Research": {
        "Focus": "Computer Vision and Medical Image Analysis",
        "Domestic": {
            "Num": 1,
            "Detail": ""
        },
        "International": {
            "Num": 0,
            "Detail": ""
        }
    },
    "Internship": {
        "Domestic": {
            "Num": 0,
            "Detail": ""
        },
        "International": {
            "Num": 0,
            "Detail": ""
        }
    },
    "Recommendation": [
        {
            "Type": [
                "Research"
            ],
            "Detail": ""
        },
        {
            "Type": [
                "TA"
            ],
            "Detail": ""
        },
        {
            "Type": [
                "Course"
            ],
            "Detail": ""
        },
        {
            "Type": [
                "Course"
            ],
            "Detail": ""
        },
        {
            "Type": [
                "Course"
            ],
            "Detail": ""
        }
    ],
    "Programs": {}
}

