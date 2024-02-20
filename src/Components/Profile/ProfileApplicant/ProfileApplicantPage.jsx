import {getRecordByApplicant} from "../../../Data/RecordData";
import {Form, redirect, useLoaderData} from "react-router-dom";
import {
    Avatar, Badge, Box, Button, Card, Chip, IconButton,
    Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, List, ListItem,
    ListItemIcon, ListItemText, TextField,
    Paper, Slider, styled, Typography, Divider
} from "@mui/material";
import {Add, Delete, Edit} from "@mui/icons-material";
import "./ProfileApplicantPage.css";
import {Link} from 'react-router-dom';
import {
    getApplicant,
    isAuthApplicant,
    removeApplicant
} from "../../../Data/ApplicantData";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
    authorOrderMapping,
    currentDegreeMapping,
    EnglishExamMapping,
    exchangeDurationMapping,
    exchangeUnivFullNameMapping,
    publicationStatusMapping,
    publicationTypeMapping,
    rankPercentSliderValueMapping,
    recommendationTypeMapping,
    RecordStatusPaltette,
    SliderValueRankStringMapping
} from "../../../Data/Schemas";
import {Fragment, useEffect, useState} from "react";

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import BiotechIcon from '@mui/icons-material/Biotech';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
import ShutterSpeedIcon from '@mui/icons-material/ShutterSpeed';
import {getAvatar, getMetaData} from "../../../Data/UserData";
import {grey} from "@mui/material/colors";

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

const ContentCenteredGrid = styled(Grid2)(({theme}) => ({
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    // padding: "0.5rem"
}));

function BaseItemBlock({children, className, checkpointProps, spacing = 0, elevation = 2}) {
    return (
        <Grid2 sx={{display: "flex"}} {...checkpointProps}>
            <Paper className={className} elevation={elevation}>
                <Grid2 container spacing={spacing}>
                    {children}
                </Grid2>
            </Paper>
        </Grid2>
    )
}

function BaseListItem({Icon, primary, secondary}) {
    return (
        <ListItem alignItems="flex-start" sx={{gap: '1rem'}}>
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

export function ProfileApplicantPage({editable = false}) {
    const {avatarUrl, applicant, records} = useLoaderData();
    return (
        <Grid2
            component={Paper}
            key={applicant.ApplicantID}
            container
            spacing={2}
            sx={{
                boxShadow: "none",
                bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[900] : grey[50],
            }}
        >
            <BasicInfoBlock avatarUrl={avatarUrl} applicant={applicant} editable={editable}/>
            <ExchangeBlock Exchanges={applicant?.Exchange}/>
            <ResearchBlock Researches={applicant?.Research}/>
            <InternshipBlock Internships={applicant?.Internship}/>
            <PublicationBlock Publications={applicant?.Publication}/>
            <RecommendationBlock Recommendations={applicant?.Recommendation}/>
            <CompetitionBlock Competitions={applicant?.Competition}/>
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
        <BaseItemBlock className="BasicInfoBlock" checkpointProps={{xs: 12}} spacing={2}>
            <Grid2 container xs={12} lg={4}>
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
        </BaseItemBlock>
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
        <Grid2 container xs={12} lg={4}>
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
                    <Grid2 container xs={12} lg={4} key={examType}>
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
        <BaseItemBlock className="ExchangeBlock" checkpointProps={{xs: 12, lg: 6, xl: 4}}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>交换经历</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Exchanges.map((exchange, index) => {
                    return (
                        <Fragment key={index}>
                            <BaseListItem
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
        </BaseItemBlock>
    )
}

function ResearchBlock({Researches}) {
    return (
        <BaseItemBlock className="ResearchBlock" checkpointProps={{xs: 12, lg: 6, xl: 4}}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>科研经历</Typography>
                <Typography variant="subtitle1">{Researches.Focus}</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    experience={Researches.Domestic}
                    Icon={<BiotechIcon/>}
                    primary={`国内${Researches.Domestic.Num}段研究经历`}
                    secondary={Researches.Domestic.Detail === '' ? '具体描述:暂无' : Researches.Domestic.Detail}
                />
                <Divider/>
                <BaseListItem
                    experience={Researches.International}
                    Icon={<BiotechIcon/>}
                    primary={`国外${Researches.International.Num}段研究经历`}
                    secondary={Researches.International.Detail === '' ? '具体描述:暂无' : Researches.International.Detail}
                />
            </List>
        </BaseItemBlock>
    )
}

function InternshipBlock({Internships}) {
    return (
        <BaseItemBlock className="InternshipBlock" checkpointProps={{xs: 12, lg: 6, xl: 4}}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>实习经历</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    experience={Internships.Domestic}
                    Icon={<WorkIcon/>}
                    primary={`国内${Internships.Domestic.Num}段实习经历`}
                    secondary={Internships.Domestic.Detail === '' ? '具体描述:暂无' : Internships.Domestic.Detail}
                />
                <Divider/>
                <BaseListItem
                    experience={Internships.International}
                    Icon={<WorkIcon/>}
                    primary={`国外${Internships.International.Num}段实习经历`}
                    secondary={Internships.International.Detail === '' ? '具体描述:暂无' : Internships.International.Detail}
                />
            </List>
        </BaseItemBlock>
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
        <BaseItemBlock className="PublicationBlock" checkpointProps={{xs: 12, lg: 6, xl: 4}}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>发表论文</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Publications.map((publication, index) => {
                    return (
                        <Fragment key={index}>
                            <BaseListItem
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
        </BaseItemBlock>
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
        <BaseItemBlock className="RecommendationBlock" checkpointProps={{xs: 12, lg: 6, xl: 4}}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>推荐信</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Recommendations.map((recommendation, index) => {
                    let primary = recommendation.Type.map((type) => recommendationTypeMapping[type]).join('+');
                    primary = primary === '' ? '暂无' : primary;
                    return (
                        <Fragment key={index}>
                            <BaseListItem
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
        </BaseItemBlock>
    )
}

function CompetitionBlock({Competitions}) {
    if (!Competitions) {
        Competitions = "暂无";
    }
    return (
        <BaseItemBlock className="CompetitionBlock" checkpointProps={{xs: 12, lg: 6, xl: 4}}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>竞赛</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    experience={Competitions}
                    Icon={<ShutterSpeedIcon/>}
                    primary="竞赛经历"
                    secondary={Competitions === '' ? '具体描述:暂无' : Competitions}
                />
            </List>
        </BaseItemBlock>
    )
}

function RecordBlock({Records, editable}) {
    return (
        <BaseItemBlock className="RecordBlock" checkpointProps={{xs: 12}} spacing={2}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <Typography variant='h6' sx={{fontWeight: 'bold'}}>申请记录</Typography>
            </ContentCenteredGrid>
            {Records.map((record, index) => {
                return (
                    <Grid2 sx={{display: 'flex'}} xs={12} md={6} xl={4} key={index}>
                        <Card elevation={3} sx={{width: "100%"}}>
                            <BaseListItem
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
                            <Button component={Link} to={`/profile/${record.ApplicantID}/${record.ProgramID}/edit`}>
                                <Edit/>
                            </Button>
                        </Card>
                    </Grid2>
                )
            })}
        </BaseItemBlock>
    )
}



