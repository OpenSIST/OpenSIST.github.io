import {getRecordByApplicant} from "../../../Data/RecordData";
import {Form, redirect, useLoaderData, useParams} from "react-router-dom";
import {
    Avatar, Badge,
    Box, Button,
    Card,
    CardActionArea, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Divider, IconButton,
    InputLabel, List, ListItem, ListItemIcon, ListItemText, ListSubheader,
    OutlinedInput, Paper, Slider, styled, TextField,
    Tooltip,
    Typography, useTheme
} from "@mui/material";
import {Add, Delete, Edit} from "@mui/icons-material";
import "./ProfileApplicantPage.css";
import {Link} from 'react-router-dom';
import {
    getApplicant,
    getApplicantIDByDisplayName,
    isAuthApplicant,
    removeApplicant
} from "../../../Data/ApplicantData";
import Grid2 from "@mui/material/Unstable_Grid2";
import HelpIcon from '@mui/icons-material/Help';
import {
    authorOrderMapping,
    currentDegreeMapping,
    currentDegreeOptions,
    EnglishExamMapping,
    exchangeDurationMapping,
    exchangeUnivFullNameMapping,
    genderOptions,
    PublicationAuthorOrderChipColor,
    PublicationStateChipColor, publicationStatusMapping,
    PublicationTypeChipColor,
    publicationTypeMapping,
    rankPercentOptions,
    rankPercentSliderValueMapping, recommendationTypeMapping, RecordStatusPaltette,
    SliderValueRankStringMapping
} from "../../../Data/Schemas";
import {Fragment, useEffect, useState} from "react";
import localforage from "localforage";

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import BiotechIcon from '@mui/icons-material/Biotech';
import {useMediaQuery} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
import ShutterSpeedIcon from '@mui/icons-material/ShutterSpeed';
import LensIcon from '@mui/icons-material/Lens';
import {getAvatar, getMetaData} from "../../../Data/UserData";

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
    const metaData = await getMetaData();
    const avatarUrl = await getAvatar(metaData?.Avatar);
    return {avatarUrl, applicant, records};
}

export async function action({params}) {
    const applicantId = params.applicantId;
    await removeApplicant(applicantId);
    return redirect('/profile');
}

export function ProfileApplicantPage({editable = false}) {
    const {avatarUrl, applicant, records} = useLoaderData();
    const matches = useMediaQuery((theme) => theme.breakpoints.up('md'));
    return (
        <Grid2 key={applicant.ApplicantID} container xs={12} sx={{gap: '1rem'}}>
            <BasicInfoBlock avatarUrl={avatarUrl} applicant={applicant} editable={editable}/>
            <Grid2 container xs={12} sx={{gap: "1rem", flexWrap: matches ? 'nowrap' : "wrap"}}>
                <ExchangeBlock Exchanges={applicant?.Exchange}/>
                <ResearchBlock Researches={applicant?.Research}/>
                <InternshipBlock Internships={applicant?.Internship}/>
            </Grid2>
            <Grid2 container xs={12} sx={{gap: "1rem", flexWrap: matches ? 'nowrap' : "wrap"}}>
                <PublicationBlock Publications={applicant?.Publication}/>
                <RecommendationBlock Recommendations={applicant?.Recommendation}/>
                <CompetitionBlock Competitions={applicant?.Competition}/>
            </Grid2>
            <RecordBlock Records={records} editable={editable}/>
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
    const [confirmText, setConfirmText] = useState('');
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
                    <DialogContentText>
                        请输入您的Applicant ID: {applicantId}以确认删除。
                    </DialogContentText>
                    <TextField
                        margin="dense"
                        id="applicantId"
                        label="Applicant ID"
                        type="text"
                        size='small'
                        fullWidth
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Form method='post'>
                        <Button color='error' type='submit' onClick={handleClose}
                                disabled={confirmText !== applicantId}>
                            确认
                        </Button>
                    </Form>
                </DialogActions>
            </Dialog>
        </>
    )

}

function BasicInfoBlock({avatarUrl, applicant, editable}) {
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
        <Grid2 component={Paper} className="BasicInfoBlock" container xs={12}>
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
                        <Avatar src={avatarUrl} sx={{width: 100, height: 100}}/>
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
                        {editable && isAuth ?
                            <EditDeleteButtonGroup applicantId={applicant.ApplicantID}/> : null}
                    </ContentCenteredGrid>
                </Grid2>
                <ContentCenteredGrid xs={12} sx={{mb: '0.5rem'}}>
                    <Typography variant="subtitle1">申请时最高学位GPA以及对应学院/专业排名：</Typography>
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
            <EnglishExamBlock EnglishProficiency={applicant?.EnglishProficiency}/>
            <GREBlock GRE={applicant?.GRE}/>
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
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>交换经历</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Exchanges.map((exchange, index) => {
                    return (
                        <Fragment key={index}>
                            <ExperienceListItem
                                experience={exchange}
                                Icon={<SchoolIcon/>}
                                primary={exchangeUnivFullNameMapping[exchange.University] ?? "暂无"}
                                secondary={{
                                    "交换时长": exchangeDurationMapping[exchange.Duration] ?? "暂无",
                                    "具体描述": exchange.Detail === '' ? '暂无' : exchange.Detail
                                }}
                            />
                            {index !== Exchanges.length - 1 ? <Divider/> : null}
                        </Fragment>
                    )
                })}
            </List>
        </Grid2>
    )
}

function ResearchBlock({Researches}) {
    return (
        <Grid2 component={Paper} className="ResearchBlock" container xs={12} md={4}>
            <ContentCenteredGrid
                xs={12}
                sx={{flexDirection: 'column', alignItems: 'flex-start'}}
            >
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>科研经历</Typography>
                <Typography variant="subtitle1">{Researches.Focus}</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <ExperienceListItem
                    experience={Researches.Domestic}
                    Icon={<BiotechIcon/>}
                    primary={`国内${Researches.Domestic.Num}段研究经历`}
                    secondary={Researches.Domestic.Detail === '' ? '具体描述:暂无' : Researches.Domestic.Detail}
                />
                <Divider/>
                <ExperienceListItem
                    experience={Researches.International}
                    Icon={<BiotechIcon/>}
                    primary={`国外${Researches.International.Num}段研究经历`}
                    secondary={Researches.International.Detail === '' ? '具体描述:暂无' : Researches.International.Detail}
                />
            </List>
        </Grid2>
    )
}

function InternshipBlock({Internships}) {
    return (
        <Grid2 component={Paper} className="InternshipBlock" container xs={12} md={4}>
            <ContentCenteredGrid
                xs={12}
                sx={{flexDirection: 'column', alignItems: 'flex-start'}}
            >
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>实习经历</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <ExperienceListItem
                    experience={Internships.Domestic}
                    Icon={<WorkIcon/>}
                    primary={`国内${Internships.Domestic.Num}段实习经历`}
                    secondary={Internships.Domestic.Detail === '' ? '具体描述:暂无' : Internships.Domestic.Detail}
                />
                <Divider/>
                <ExperienceListItem
                    experience={Internships.International}
                    Icon={<WorkIcon/>}
                    primary={`国外${Internships.International.Num}段实习经历`}
                    secondary={Internships.International.Detail === '' ? '具体描述:暂无' : Internships.International.Detail}
                />
            </List>
        </Grid2>
    )
}

function PublicationBlock({Publications}) {
    if (!Publications) {
        Publications = [
            {
                "Type": "暂无",
                "Name": "暂无",
                "AuthorOrder": "暂无",
                "Status": "暂无",
                "Detail": "暂无"
            }
        ]
    }
    return (
        <Grid2 component={Paper} className="PublicationBlock" container xs={12} md={4}>
            <ContentCenteredGrid
                xs={12}
                sx={{flexDirection: 'column', alignItems: 'flex-start'}}
            >
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>发表论文</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Publications.map((publication, index) => {
                    return (
                        <Fragment key={index}>
                            <ExperienceListItem
                                experience={publication}
                                Icon={<ArticleIcon/>}
                                primary={`${publication.Name} ${publicationTypeMapping[publication.Type] ?? ""}`}
                                secondary={{
                                    "作者顺序": authorOrderMapping[publication.AuthorOrder] ?? "暂无",
                                    "状态": publicationStatusMapping[publication.Status] ?? "暂无",
                                    "具体描述": publication.Detail === '' ? '暂无' : publication.Detail
                                }}
                            />
                            {index !== Publications.length - 1 ? <Divider/> : null}
                        </Fragment>
                    )
                })}
            </List>
        </Grid2>
    )
}

function RecommendationBlock({Recommendations}) {
    if (!Recommendations) {
        Recommendations = [
            {
                "Type": ["暂无"],
                "Detail": "暂无"
            }
        ]
    }
    return (
        <Grid2 component={Paper} className="RecommendationBlock" container xs={12} md={4}>
            <ContentCenteredGrid
                xs={12}
                sx={{flexDirection: 'column', alignItems: 'flex-start'}}
            >
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>推荐信</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Recommendations.map((recommendation, index) => {
                    let primary = recommendation.Type.map((type) => recommendationTypeMapping[type]).join('+');
                    primary = primary === '' ? '暂无' : primary;
                    return (
                        <Fragment key={index}>
                            <ExperienceListItem
                                experience={recommendation}
                                Icon={<EmailIcon/>}
                                primary={primary}
                                secondary={recommendation.Detail === '' ? '具体描述:暂无' : recommendation.Detail}
                            />
                            {index !== Recommendations.length - 1 ? <Divider/> : null}
                        </Fragment>
                    )
                })}
            </List>
        </Grid2>
    )
}

function CompetitionBlock({Competitions}) {
    if (!Competitions) {
        Competitions = "暂无";
    }
    return (
        <Grid2 component={Paper} className="CompetitionBlock" container xs={12} md={4}>
            <ContentCenteredGrid
                xs={12}
                sx={{flexDirection: 'column', alignItems: 'flex-start'}}
            >
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>竞赛</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <ExperienceListItem
                    experience={Competitions}
                    Icon={<ShutterSpeedIcon/>}
                    primary="竞赛经历"
                    secondary={Competitions === '' ? '具体描述:暂无' : Competitions}
                />
            </List>
        </Grid2>
    )
}

function RecordBlock({Records, editable}) {
    return (
        <Grid2 component={Paper} className="RecordBlock" container xs={12}>
            <ContentCenteredGrid
                xs={12}
                sx={{flexDirection: 'column', alignItems: 'flex-start'}}
            >
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>申请记录</Typography>
            </ContentCenteredGrid>
            <Grid2 container component={List} xs={12} sx={{width: '100%'}}>
                {Records.map((record, index) => {
                    return (
                        <Grid2 component={Card} xs={12} md={4} key={index}>
                            <ExperienceListItem
                                experience={record}
                                Icon={<Chip label={record.Status} color={RecordStatusPaltette[record.Status]}/>}
                                primary={record.ProgramID}
                                secondary={{
                                    "申请季": record.ProgramYear + record.Semester,
                                    "提交时间": record.TimeLine?.Submit?.split('T')[0] ?? "暂无",
                                    "面试时间": record.TimeLine?.Interview?.split('T')[0] ?? '暂无',
                                    "通知时间": record.TimeLine?.Decision?.split('T')[0] ?? '暂无',
                                    "补充说明": record.Detail === '' ? '暂无' : record.Detail
                                }}
                            />
                            <Button component={Link} to={`/profile/${record.ApplicantID}/${record.ProgramID}/edit`}><Edit/></Button>
                            {/*{index !== Records.length - 1 ? <Divider/> : null}*/}
                        </Grid2>
                    )
                })}
            </Grid2>
        </Grid2>
    )
}

function ExperienceListItem({Icon, primary, secondary}) {
    return (
        <ListItem alignItems="flex-start">
            <ListItemIcon>
                {Icon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Typography variant='h5' sx={{fontWeight: 'bold'}}>
                        {primary}
                    </Typography>
                }
                secondary={
                    <Box component='span' sx={{display: 'flex', flexDirection: 'column'}}>
                        {typeof secondary === 'string' ?
                            <Typography component='span'>
                                {secondary}
                            </Typography> :
                            Object.entries(secondary).map(([key, value]) => {
                                return (
                                    <Typography component='span' key={key}>
                                        {key}: {value}
                                    </Typography>
                                )
                            })

                        }
                    </Box>
                }
            />
        </ListItem>
    )
}

const RecordsExample = [
    {
        "RecordID": "libn@2021|CS75@UCSD",
        "ApplicantID": "libn@2021",
        "ProgramID": "CS75@UCSD",
        "ProgramYear": 2024,
        "Semester": "Fall",
        "Status": "Admit",
        "TimeLine": {
            "Submit": "2023-12-16T00:00:00.000Z",
            "Interview": null,
            "Decision": "2024-02-16T00:00:00.000Z"
        },
        "Detail": ""
    },
    {
        "RecordID": "libn@2021|CS General@NEU",
        "ApplicantID": "libn@2021",
        "ProgramID": "CS General@NEU",
        "ProgramYear": 2024,
        "Semester": "Fall",
        "Status": "Admit",
        "TimeLine": {
            "Submit": "2023-12-06T00:00:00.000Z",
            "Interview": null,
            "Decision": "2024-01-12T00:00:00.000Z"
        },
        "Detail": "Vancouver 校区"
    }
]
