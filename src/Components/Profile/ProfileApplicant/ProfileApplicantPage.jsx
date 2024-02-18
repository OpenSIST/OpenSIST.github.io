import {getRecordByApplicant} from "../../../Data/RecordData";
import {Form, redirect, useLoaderData, useParams} from "react-router-dom";
import {
    Avatar, Badge,
    Box, Button,
    Card,
    CardActionArea, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Divider, IconButton,
    InputLabel, List, ListItem, ListItemIcon, ListItemText,
    OutlinedInput, Paper, Slider, styled,
    Tooltip,
    Typography, useTheme
} from "@mui/material";
import {Add, Delete, Edit} from "@mui/icons-material";
import "./ProfileApplicantPage.css";
import {Link} from 'react-router-dom';
import {getApplicant, getApplicantIDByUserID, isAuthApplicant, removeApplicant} from "../../../Data/ApplicantData";
import Grid2 from "@mui/material/Unstable_Grid2";
import HelpIcon from '@mui/icons-material/Help';
import {
    currentDegreeMapping,
    currentDegreeOptions,
    EnglishExamMapping, exchangeDurationMapping, genderOptions,
    PublicationAuthorOrderChipColor,
    PublicationStateChipColor,
    PublicationTypeChipColor, rankPercentOptions, rankPercentSliderValueMapping, SliderValueRankStringMapping
} from "../../../Data/Schemas";
import {Fragment, useEffect, useState} from "react";
import localforage from "localforage";

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';
import SchoolIcon from '@mui/icons-material/School';


const ContentCenteredGrid = styled(Grid2)(({theme}) => ({
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    padding: "0.5rem"
}));


export async function loader({params}) {
    const applicantId = params.applicantId;
    const isAuth = await isAuthApplicant(applicantId);
    if (!isAuth) {
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
        <Grid2 key={applicant.ApplicantID} container xs={12}
            // sx={{display: 'flex', justifyContent: 'center'}}
        >
            <BasicInfoBlock applicant={applicant}/>
            <ExchangeBlock Exchanges={applicant?.Exchange}/>
        </Grid2>
    )
}

function GenderIcon({gender}) {
    switch (gender) {
        case 'Male':
            return <MaleIcon fontSize="small"/>;
        case 'Female':
            return <FemaleIcon fontSize="small"/>;
        case 'Others':
            return <TransgenderIcon fontSize="small"/>;
        default:
            return null;
    }
}

function EditDeleteButtonGroup({applicantId}) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    }
    const handleClose = () => {
        setOpen(false);
    }
    return (
        <>
            <IconButton component={Link} to={`/profile/${applicantId}/edit`}>
                <Edit/>
            </IconButton>
            <IconButton onClick={handleOpen}>
                <Delete/>
            </IconButton>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>是否要删除{applicantId}？</DialogTitle>
                <DialogContent>
                    <DialogContentText color='error'>
                        您正在进行危险操作！此操作不可逆，删除后无法恢复！
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Form method='post'>
                        <Button color='error' type='submit' onClick={handleClose}>
                            确认
                        </Button>
                    </Form>
                </DialogActions>
            </Dialog>
        </>
    )

}

function BasicInfoBlock({applicant}) {
    const [isAuth, setIsAuth] = useState(false);
    useEffect(() => {
        isAuthApplicant(applicant.ApplicantID).then(setIsAuth);
    }, [applicant.ApplicantID]);
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
        <Grid2 component={Paper} className="BasicInfoBlock" container xs={12} sx={{mb: '1rem'}}>
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
                        {isAuth ?
                            <EditDeleteButtonGroup applicantId={applicant.ApplicantID}/> : null}
                    </ContentCenteredGrid>
                </Grid2>
                <ContentCenteredGrid xs={12} sx={{mb: '0.5rem'}}>
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
    if (!Exchanges || Exchanges.length === 0) {
        Exchanges = [
            {
                "University": "暂无",
                "Duration": "暂无",
                "Detail": "暂无"
            }
        ]
    }
    return (
        <Grid2 component={Paper} className="ExchangeBlock" container xs={12} md={4}>
            <ContentCenteredGrid component={Typography} variant='h6' xs={12}
                                 sx={{justifyContent: 'flex-start', fontWeight: 'bold'}}>
                交换经历
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Exchanges.map((exchange, index) => {
                    return (
                        <Fragment key={index}>
                            <ListItem alignItems="flex-start">
                                <ListItemIcon>
                                    <SchoolIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant='h5'
                                                    sx={{fontWeight: 'bold'}}>{exchange.University}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box component='span' sx={{display: 'flex', flexDirection: 'column'}}>
                                            <Typography component='span'>交换时长：{exchangeDurationMapping[exchange.Duration] ?? "暂无"}</Typography>
                                            <Typography component='span'>具体描述：{exchange.Detail === '' ? '暂无': exchange.Detail}</Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index !== Exchanges.length - 1 ? <Divider/> :  null}
                        </Fragment>
                    )
                })}
            </List>
        </Grid2>
    )
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
    "ApplicantID": "libn@2016",
    "Gender": "Male",
    "CurrentDegree": "Master",
    "ApplicationYear": 2016,
    "Major": "EE",
    "GPA": 3.91,
    "Ranking": "1",
    "GRE": {
        "Total": 340,
        "V": 170,
        "Q": 170,
        "AW": 5
    },
    "EnglishProficiency": {},
    "Exchange": [
        {
            "University": "UCB",
            "Duration": "Semester",
            "Detail": ""
        },
        {
            "University": "MIT",
            "Duration": "Year",
            "Detail": ""
        }
    ],
    "Publication": [
        {
            "Type": "Journal",
            "Name": "CVPR",
            "AuthorOrder": "First",
            "Status": "Accepted",
            "Detail": "This is a test paragraph This is a test paragraph "
        },
        {
            "Type": "Conference",
            "Name": "IJCV",
            "AuthorOrder": "Co-first",
            "Status": "Accepted",
            "Detail": "This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph "
        }
    ],
    "Research": {
        "Focus": "Computer Vision and Computer Graphis",
        "Domestic": {
            "Num": 2,
            "Detail": "This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph "
        },
        "International": {
            "Num": 1,
            "Detail": "This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph "
        }
    },
    "Internship": {
        "Domestic": {
            "Num": 2,
            "Detail": "This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph "
        },
        "International": {
            "Num": 3,
            "Detail": "This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph "
        }
    },
    "Recommendation": [
        {
            "Type": [
                "Research",
                "TA"
            ],
            "Detail": "This is a test paragraph "
        },
        {
            "Type": [
                "Course",
                "TA"
            ],
            "Detail": "This is a This is a test paragraph paragraph "
        },
        {
            "Type": [
                "Course"
            ],
            "Detail": "This is a test paragraph "
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
    "Competition": "This is a test paragraph  This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph This is a test paragraph ",
    "Programs": {}
}

