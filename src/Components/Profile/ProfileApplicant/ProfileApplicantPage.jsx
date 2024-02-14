import {getRecordByApplicant} from "../../../Data/RecordData";
import {useLoaderData} from "react-router-dom";
import {
    Box, Button,
    Card,
    CardActionArea, Chip,
    Divider,
    InputLabel,
    OutlinedInput, styled,
    Tooltip,
    Typography, useTheme
} from "@mui/material";
import {Add, Edit, Label} from "@mui/icons-material";
import "./ProfileApplicantPage.css";
import {Link} from 'react-router-dom';
import {getApplicant} from "../../../Data/ApplicantData";
import Grid2 from "@mui/material/Unstable_Grid2";
import HelpIcon from '@mui/icons-material/Help';
import {
    currentDegreeOptions,
    EnglishExamMapping, genderOptions,
    PublicationAuthorOrderChipColor,
    PublicationStateChipColor,
    PublicationTypeChipColor, rankPercentOptions
} from "../../../Data/Schemas";
import {Fragment} from "react";

const ContentCenteredGrid = styled(Grid2)(({theme}) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    margin: '1rem 0',
}));

const ItemBox = styled(Box)(({theme}) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
}))

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
                <ApplicantInfoItem itemLabel="申请人性别" itemValue={genderOptions.find((option) => option.value === applicant.Gender)?.label ?? null}/>
                <ApplicantInfoItem itemLabel="申请人学位" itemValue={currentDegreeOptions.find((option) => option.value === applicant.CurrentDegree)?.label ?? null}/>
                <ApplicantInfoItem itemLabel="申请年份" itemValue={applicant.ApplicationYear}/>
                <ApplicantInfoItem itemLabel="申请人专业" itemValue={applicant.Major}/>
                {/*<ApplicantInfoItem itemLabel="联系方式" itemValue={applicant.Contact}/>*/}
            </Grid2>
            <Divider><Typography variant='h4'>三维</Typography></Divider>
            <Grid2 container rowSpacing={1} columnSpacing={5}>
                <Grid2 container xs={xs_standard_grades}>
                    <ApplicantInfoItem itemLabel="GPA" itemValue={applicant.GPA} xs={12}
                                       help="申请人在该申请季用于申请的最高学历的GPA"/>
                    <ApplicantInfoItem itemLabel="排名"
                                       itemValue={rankPercentOptions.find((option) => option.value === applicant.Ranking)?.label ?? null}
                                       xs={12}
                                       help="学院排名or专业排名"/>
                </Grid2>
                <EnglishProficiencyItem title="GRE" grade={applicant.GRE} xs={xs_standard_grades}/>
                <EnglishProficiencyItem title="TOEFL" grade={applicant.EnglishProficiency.TOEFL}
                                        xs={xs_standard_grades}/>
                <EnglishProficiencyItem title="IELTS" grade={applicant.EnglishProficiency.IELTS}
                                        xs={xs_standard_grades}/>
            </Grid2>
            <Divider><Typography variant='h4'>软背景</Typography></Divider>
            <Grid2 container rowSpacing={1} columnSpacing={5}>
                <PublicationItems publications={applicant.Publication} xs={4}/>
                <ResearchInternshipItems experiences={applicant.Research} title="科研经历"/>
                <ResearchInternshipItems experiences={applicant.Internship} title="实习经历"/>
            </Grid2>
        </>
    )
}

function ApplicantInfoItem({itemLabel, itemValue, help, xs = 4}) {
    if (!itemValue) {
        return null;
    }
    return (
        <ContentCenteredGrid xs={xs}>
            <InputLabel sx={{width: '6rem', display: 'flex', alignItems: 'center'}}>
                {itemLabel}
                {help && <Tooltip title={help} arrow>
                    <HelpIcon fontSize='small'/>
                </Tooltip>}
            </InputLabel>
            <OutlinedInput readOnly defaultValue={itemValue}/>
        </ContentCenteredGrid>
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

function PublicationItems({publications, xs}) {
    if (!publications || publications.length === 0) {
        return null;
    }
    return (
        <Grid2 container xs={xs}>
            <ContentCenteredGrid xs={12} sx={{alignItems: "flex-start"}}><Typography variant='h5'>论文发表</Typography></ContentCenteredGrid>
            {publications.map((publication, index) => (
                <PublicationCard key={index} publication={publication}/>
            ))}
        </Grid2>
    )
}

function PublicationCard({publication}) {
    return (
        <ContentCenteredGrid xs={12}>
            <Card className='PublicationCard' sx={{borderRadius: '20px'}}>
                <PublicationCardChipItem label="类型:" value={publication.Type} palette={PublicationTypeChipColor}/>
                <PublicationCardTextItem label="名称:" value={publication.Name}/>
                <PublicationCardChipItem label="作者顺序:" value={publication.AuthorOrder}
                                         palette={PublicationAuthorOrderChipColor}/>
                <PublicationCardChipItem label="状态:" value={publication.Status} palette={PublicationStateChipColor}/>
                <PublicationCardTextItem label="详情:" value={publication.Detail}/>
            </Card>
        </ContentCenteredGrid>
    )
}

function PublicationCardTextItem({label, value}) {
    if (!value || value === '') {
        return null;
    }
    return (
        <ItemBox>
            <InputLabel>
                {label}
            </InputLabel>
            <Typography>{value}</Typography>
        </ItemBox>
    )
}

function PublicationCardChipItem({label, value, palette}) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    if (!value || value === '') {
        return null;
    }
    return (
        <ItemBox>
            <InputLabel>
                {label}
            </InputLabel>
            <Chip label={value} sx={{bgcolor: palette(darkMode, value)}}/>
        </ItemBox>
    )
}

function ResearchInternshipItems({experiences, title}) {
    if (!experiences || (experiences.Domestic.Num + experiences.International.Num) === 0) {
        return null;
    }
    return (
        <Grid2 container xs={4}>
            <ContentCenteredGrid xs={12} sx={{alignSelf: 'flex-start', flexDirection: 'column', gap: '0'}}>
                <Typography variant='h5'>
                    {title}
                </Typography>
                <Typography variant='subtitle1'>{experiences?.Focus}</Typography>
            </ContentCenteredGrid>
            <ResearchInternshipCard num={experiences?.Domestic?.Num} detail={experiences?.Domestic?.Detail}/>
            <ResearchInternshipCard num={experiences?.International?.Num} detail={experiences?.International?.Detail}/>
        </Grid2>
    )
}

function ResearchInternshipCard({num, detail}) {
    return (
        <ContentCenteredGrid xs={12}>
            <Card className="ResearchInternshipCard" sx={{borderRadius: '20px'}}>
                <Typography>{`国内${num}段`}</Typography>
                <Typography>{detail}</Typography>
            </Card>
        </ContentCenteredGrid>
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
        "AW": 4
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
