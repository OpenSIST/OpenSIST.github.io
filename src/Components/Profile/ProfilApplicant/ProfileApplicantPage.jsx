import {getRecordByApplicant} from "../../../Data/RecordData";
import {useLoaderData} from "react-router-dom";
import {
    Box,
    Card,
    CardActionArea,
    Divider, IconButton,
    InputLabel,
    OutlinedInput,
    Tooltip,
    Typography
} from "@mui/material";
import {Add} from "@mui/icons-material";
import "./ProfileApplicantPage.css";
import {Link} from 'react-router-dom';
import {getApplicant} from "../../../Data/ApplicantData";
import Grid2 from "@mui/material/Unstable_Grid2";
import HelpIcon from '@mui/icons-material/Help';
import {EnglishExamMapping} from "../../../Data/Schemas";

export async function loader({params}) {
    const applicantId = params.applicantId;
    const applicant = await getApplicant(applicantId);
    const records = await getRecordByApplicant(applicantId);
    return {applicantId, applicant, records};
}

export default function ProfileApplicantPage() {
    const {applicantId, applicant, records} = useLoaderData();
    return (
        <>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant='h3' sx={{alignSelf: 'center'}}> 申请人信息 </Typography>
                <ApplicantInfo applicant={applicant}/>
                <Typography variant='h3'> 申请结果 </Typography>
                {records.map(record => (
                    <Card className="RecordCard">
                        <Typography>record.ProgramID</Typography>
                    </Card>
                ))}
                <Card className="RecordCard">
                    <CardActionArea component={Link} to={`/profile/${applicantId}/new-program`}>
                        <Add sx={{fontSize: '10rem'}}/>
                    </CardActionArea>
                </Card>
            </Box>
        </>
    )
}

export function ApplicantInfo({applicant}) {
    const xs_standard_grades = 12 / (
        1 +
        ('GRE' in applicant) +
        ('TOEFL' in applicant.EnglishProficiency) +
        ('IELTS' in applicant.EnglishProficiency)
    )
    return (
        <>
            <Divider><Typography variant='h4'>基本信息</Typography></Divider>
            <Grid2 container rowSpacing={1} columnSpacing={5}>
                <ApplicantInfoItem itemLabel="申请人ID" itemValue={applicant.ApplicantID}/>
                <ApplicantInfoItem itemLabel="申请人性别" itemValue={applicant.Gender}/>
                <ApplicantInfoItem itemLabel="申请人学位" itemValue={applicant.CurrentDegree}/>
                <ApplicantInfoItem itemLabel="申请年份" itemValue={applicant.ApplicationYear}/>
                <ApplicantInfoItem itemLabel="申请人专业" itemValue={applicant.Major}/>
                <ApplicantInfoItem itemLabel="联系方式" itemValue={applicant.Contact}/>
            </Grid2>
            <Divider><Typography variant='h4'>三维</Typography></Divider>
            <Grid2 container rowSpacing={1} columnSpacing={5}>
                <Grid2 container xs={xs_standard_grades}>
                    <ApplicantInfoItem itemLabel="GPA" itemValue={applicant.GPA} xs={12}
                                       help="申请人在该申请季用于申请的最高学历的GPA"/>
                    <ApplicantInfoItem itemLabel="排名"
                                       itemValue={`${applicant.Ranking.Rank}/${applicant.Ranking.Total}`} xs={12}
                                       help="学院排名or专业排名"/>
                </Grid2>
                <EnglishProficiencyItem title="GRE" grade={applicant.GRE} xs={xs_standard_grades}/>
                <EnglishProficiencyItem title="TOEFL" grade={applicant.EnglishProficiency.TOEFL}
                                        xs={xs_standard_grades}/>
                <EnglishProficiencyItem title="IELTS" grade={applicant.EnglishProficiency.IELTS}
                                        xs={xs_standard_grades}/>

            </Grid2>
            <Divider><Typography variant='h4'>软背景</Typography></Divider>

        </>
    )
}

function ApplicantInfoItem({itemLabel, itemValue, help, xs = 4}) {
    if (!itemValue) {
        return null;
    }
    return (
        <Grid2
            xs={xs}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                m: '1rem 0',
                '& > *': {mr: '1rem'}
            }}
        >
            <InputLabel sx={{width: '6rem', display: 'flex', alignItems: 'center'}}>
                {itemLabel}
                {help && <Tooltip title={help} arrow>
                    <HelpIcon fontSize='small'/>
                </Tooltip>}
            </InputLabel>
            <OutlinedInput readOnly defaultValue={itemValue}/>
        </Grid2>
    )
}

function EnglishProficiencyItem({title, grade, xs}) {
    if (!grade) {
        return null;
    }
    return (
        <Grid2 container xs={xs}>
            {Object.entries(grade).map(([key, value]) =>
                <ApplicantInfoItem key={key} itemLabel={EnglishExamMapping[title][key]} itemValue={value} xs={12}/>
            )}
        </Grid2>
    )
}


const libn = {
    "ApplicantID": "libn@2024",
    "Gender": "Male",
    "CurrentDegree": "Undergraduate",
    "ApplicationYear": "2024",
    "Major": "CS",
    "GPA": 3.97,
    "Ranking": {
        "Rank": 1,
        "Total": 248
    },
    "GRE": {
        "Total": 330,
        "V": 160,
        "Q": 170,
        "W": 4
    },
    "EnglishProficiency": {
        "TOEFL": {
            "Total": 120,
            "S": 30,
            "R": 30,
            "L": 30,
            "W": 30
        }
    },
    "Exchange": [
        {
            "University": {
                "list": "MIT",
                "other": ""
            },
            "TimeLine": {
                "Start": "2023-02-06T00:00:00.000Z",
                "End": "2023-05-24T00:00:00.000Z"
            },
            "Detail": "交换学期内满绩"
        }
    ],
    "Publication": [
        {
            "Type": "Conference",
            "Name": "NeurIPS Workshop",
            "AuthorOrder": "Co-first",
            "Status": "Accepted",
            "Detail": ""
        },
        {
            "Type": "Conference",
            "Name": "CVPR",
            "AuthorOrder": "Co-first",
            "Status": "UnderReview",
            "Detail": ""
        }
    ],
    "Research": {
        "Focus": "Computer Vision and Medical Image Analysis",
        "Domestic": {
            "Num": 2,
            "Detail": "何旭明组大三上学期划水+大四前的暑假开始爆肝三个月"
        },
        "International": {
            "Num": 1,
            "Detail": "MIT CSAIL医学影像组爆肝六个月"
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
            "Detail": "MIT实验室大老板强推"
        },
        {
            "Type": [
                "Research"
            ],
            "Detail": "MIT实验室postdoc强推"
        },
        {
            "Type": [
                "Research"
            ],
            "Detail": "何旭明老师强推"
        }
    ],
    "Programs": {},
    "Contact": "https://www.harrychi.com"
}
