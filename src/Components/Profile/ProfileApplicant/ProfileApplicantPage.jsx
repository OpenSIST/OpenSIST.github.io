import {getRecordByApplicant, removeRecord} from "../../../Data/RecordData";
import {Form, redirect, useLoaderData, useNavigate} from "react-router-dom";
import {
    Avatar, Badge, Box, Button, Card, Chip, IconButton,
    Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, List, ListItem,
    ListItemIcon, ListItemText, TextField,
    Paper, Slider, styled, Typography, Divider, Tooltip, Input, ButtonGroup,
} from "@mui/material";
import {Add, Delete, Download, Edit, Refresh} from "@mui/icons-material";
import "./ProfileApplicantPage.css";
import {Link} from 'react-router-dom';
import {
    getApplicant, getApplicants,
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
    RecordStatusPalette,
    SliderValueRankStringMapping
} from "../../../Data/Schemas";
import React, {Fragment, useEffect, useState} from "react";

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import BiotechIcon from '@mui/icons-material/Biotech';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
import ShutterSpeedIcon from '@mui/icons-material/ShutterSpeed';
import {getAvatar, getDisplayName, getMetaData} from "../../../Data/UserData";
import {grey} from "@mui/material/colors";
import {faQq, faWeixin} from "@fortawesome/free-brands-svg-icons";
import {HomeRounded, LinkedIn, Link as LinkIcon, Mail} from "@mui/icons-material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getPostContent} from "../../../Data/PostData";
import {BoldTypography} from "../../common";

const contactIcons = {
    "QQ": <FontAwesomeIcon icon={faQq} fontSize='large' width='1.5rem' height='1.5rem'/>,
    "WeChat": <FontAwesomeIcon icon={faWeixin} fontSize='large' width='1.5rem' height='1.5rem'/>,
    "LinkedIn": <LinkedIn/>,
    "HomePage": <HomeRounded/>,
    "OtherLink": <LinkIcon/>,
    "Email": <Mail/>
}

export async function loader({params}) {
    const applicantId = params.applicantId;
    const isAuth = await isAuthApplicant(applicantId);
    if (!isAuth) {
        await getApplicants(true);
        const doubleCheck = await isAuthApplicant(applicantId);
        if (!doubleCheck) {
            // We can guarantee that the user is not authorized to view the profile page.
            throw new Error(`Sorry, you are not authorized to view the profile page of ${applicantId}.`);
        }
    }
    try {
        const applicant = await getApplicant(applicantId);
        const displayName = applicant.ApplicantID.split('@')[0];
        const records = await getRecordByApplicant(applicantId);
        const metaData = await getMetaData(displayName);
        const contact = metaData.Contact;
        const avatarUrl = await getAvatar(metaData?.Avatar, displayName);
        return {avatarUrl, contact, applicant, records};
    } catch (e) {
        throw e;
    }
}

export async function DataPointsLoader({params}) {
    const applicantId = params.applicantId;
    try {
        const applicant = await getApplicant(applicantId);
        const displayName = applicant.ApplicantID.split('@')[0];
        const records = await getRecordByApplicant(applicantId);
        const metaData = await getMetaData(displayName);
        const contact = metaData?.Contact;
        const avatarUrl = await getAvatar(metaData?.Avatar, displayName);
        return {avatarUrl, contact, applicant, records};
    } catch (e) {
        throw e;
    }
}

export async function action({params, request}) {
    const formData = await request.formData();
    const actionType = formData.get('ActionType');
    const applicantId = params.applicantId;
    if (actionType === 'DeleteApplicant') {
        await removeApplicant(applicantId);
        return redirect('/profile');
    } else if (actionType === 'DeleteRecord') {
        const recordId = formData.get('RecordID');
        await removeRecord(recordId);
        return redirect(`/profile/${applicantId}`);
    } else if (actionType === 'Refresh') {
        const displayName = await getDisplayName(true);
        await getApplicant(applicantId, true);
        await getRecordByApplicant(applicantId, true);
        const metaData = await getMetaData(displayName, true);
        await getAvatar(metaData?.Avatar, displayName, true);
        return redirect(`/profile/${applicantId}`);
    }
}

export async function DataPointsAction({params, request}) {
    const formData = await request.formData();
    const actionType = formData.get('ActionType');
    const applicantId = params.applicantId;
    if (actionType === 'Refresh') {
        const displayName = applicantId.split("@")[0];
        await getApplicant(applicantId, true);
        await getRecordByApplicant(applicantId, true);
        const metaData = await getMetaData(displayName, true);
        await getAvatar(metaData?.Avatar, displayName, true);
        return redirect(`/datapoints/applicant/${applicantId}`);
    }
}

const ContentCenteredGrid = styled(Grid2)(() => ({
    display: 'flex',
    alignItems: 'center',
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
            <ListItemIcon sx={{minWidth: '2rem'}}>
                {Icon}
            </ListItemIcon>
            <ListItemText
                primary={
                    <BoldTypography variant='h6' sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? "#fff" : "#000",
                    }}>
                        {primary}
                    </BoldTypography>
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
                                        {`${key}：${value}`}
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
    const {avatarUrl, contact, applicant, records} = useLoaderData();
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
            <BasicInfoBlock avatarUrl={avatarUrl} contact={contact} applicant={applicant} records={records}
                            editable={editable}/>
            <RecordBlock Records={records} ApplicantID={applicant.ApplicantID} editable={editable}/>
            <ExchangeBlock Exchanges={applicant?.Exchange}/>
            <ResearchBlock Researches={applicant?.Research}/>
            <InternshipBlock Internships={applicant?.Internship}/>
            <PublicationBlock Publications={applicant?.Publication}/>
            <RecommendationBlock Recommendations={applicant?.Recommendation}/>
            <CompetitionBlock Competitions={applicant?.Competition}/>
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

function ControlButtonGroup({applicantId, records, postLength, editable}) {
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
            <Form method='post'>
                <Tooltip title='刷新申请人信息' arrow>
                    <IconButton type='submit' variant="outlined" name='ActionType' value='Refresh'>
                        <Refresh/>
                    </IconButton>
                </Tooltip>
            </Form>
            {editable ? <>
                <Tooltip title='更改申请人信息' arrow>
                    <IconButton component={Link} to={`/profile/${applicantId}/edit`}>
                        <Edit/>
                    </IconButton>
                </Tooltip>
                <Tooltip title='删除申请人' arrow>
                    <IconButton onClick={handleOpen} color='error'>
                        <Delete/>
                    </IconButton>
                </Tooltip>
            </> : null}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>是否要删除{applicantId}？</DialogTitle>
                <DialogContent>
                    <DialogContentText color='error'>
                        {Object.keys(records).length + postLength === 0 ? '此操作会将申请人信息全部删除，且无法恢复，请谨慎！' : '在删除之前，请确保您已经删除了所有附属的申请记录以及撰写的分享贴！'}
                    </DialogContentText>
                    {Object.keys(records).length + postLength === 0 ?
                        <>
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
                        </> : null}
                </DialogContent>
                {Object.keys(records).length === 0 ?
                    <DialogActions>
                        <Button onClick={handleClose}>取消</Button>
                        <Form method='post'>
                            <Button color='error' type='submit' name='ActionType' value='DeleteApplicant'
                                    onClick={handleClose}
                                    disabled={confirmText !== applicantId}>
                                确认
                            </Button>
                        </Form>
                    </DialogActions> : null}
            </Dialog>
        </>
    )

}

function BasicInfoBlock({avatarUrl, contact, applicant, records, editable}) {
    const [isAuth, setIsAuth] = useState(false);
    useEffect(() => {
        isAuthApplicant(applicant.ApplicantID).then(setIsAuth);
    }, [applicant.ApplicantID]);

    async function onDownload(postId) {
        const file_type = postId.startsWith('CV') ? "CV" : "SoP";
        const link = document.createElement("a");
        link.download = `${applicant.ApplicantID}_${file_type}.pdf`;
        link.href = await getPostContent(postId);
        link.click();
    }

    return (
        <BaseItemBlock className="BasicInfoBlock" checkpointProps={{xs: 12}} spacing={2}>
            <Grid2 container xs={12} sm={5} md={6} lg={5} xl={4}>
                <ContentCenteredGrid>
                    <Badge
                        badgeContent={<GenderIcon gender={applicant.Gender}/>}
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                        overlap='circular'
                        color="primary"
                    >
                        <Avatar src={avatarUrl} sx={{width: "7rem", height: "7rem"}}/>
                    </Badge>
                </ContentCenteredGrid>
                <Grid2 container xs spacing={0}>
                    <ContentCenteredGrid xs={12}>
                        <BoldTypography variant="h5" color="primary" sx={{pl: '8px'}}>
                            {applicant.ApplicantID.replace("@", " ")}
                        </BoldTypography>
                    </ContentCenteredGrid>
                    <ContentCenteredGrid xs={12}>
                        <Typography variant="subtitle1" sx={{pt: '8px', pl: '8px'}}>
                            {`${applicant.Major} ${currentDegreeMapping[applicant.CurrentDegree]}`}
                        </Typography>
                    </ContentCenteredGrid>
                    <ContentCenteredGrid xs={12}>
                        <ControlButtonGroup applicantId={applicant.ApplicantID}
                                            records={records}
                                            postLength={applicant?.Posts?.length ?? 0}
                                            editable={editable && isAuth}/>
                    </ContentCenteredGrid>
                </Grid2>
                <ContentCenteredGrid xs={12} sx={{gap: Object.entries(contact).length ? '0.4rem' : '1rem'}}>
                    <BoldTypography variant="subtitle1"> 联系方式: </BoldTypography>
                    {Object.entries(contact).length ?
                        <ButtonGroup>
                            {Object.entries(contact).map(([key, value]) => {
                                const Icon = contactIcons[key];
                                if (value === "") return null;
                                return (
                                    <Tooltip title={key} key={key} arrow>
                                        <IconButton
                                            onClick={async () => {
                                                await navigator.clipboard.writeText(value);
                                                alert(`已复制${value}到剪贴板！`);
                                            }}
                                        >
                                            {Icon}
                                        </IconButton>
                                    </Tooltip>
                                )
                            })}
                        </ButtonGroup> : "暂无"}
                </ContentCenteredGrid>
                <ContentCenteredGrid xs={12} sx={{gap: '1rem'}}>
                    <BoldTypography variant="subtitle1"> 申请材料: </BoldTypography>
                    <ButtonGroup>
                        <Button
                            endIcon={<Download/>}
                            onClick={() => onDownload(applicant?.Posts?.find(post => post.startsWith('CV')))}
                            disabled={!applicant?.Posts?.find(post => post.startsWith('CV'))}
                            size='small'
                        >
                            CV
                        </Button>
                        <Button
                            endIcon={<Download/>}
                            onClick={() => onDownload(applicant?.Posts?.find(post => post.startsWith('SoP')))}
                            disabled={!applicant?.Posts?.find(post => post.startsWith('SoP'))}
                            size='small'
                        >
                            SoP/PS
                        </Button>
                    </ButtonGroup>
                </ContentCenteredGrid>
                <ContentCenteredGrid xs={12} sx={{gap: '1rem'}}>
                    <BoldTypography variant="subtitle1"> 最终去向: </BoldTypography>
                    <Chip label={applicant.Final === "" ? "暂无/未知" : applicant.Final}/>
                </ContentCenteredGrid>
            </Grid2>
            <Grid2 container xs={12} sm={7} md={6} lg={7} xl={8}>
                <EnglishExamBlock EnglishProficiency={applicant?.EnglishProficiency}/>
                <GREBlock GRE={applicant?.GRE}/>
            </Grid2>
            <Grid2 xs={12}>
                <GradeBar GPA={applicant.GPA} ranking={applicant.Ranking}/>
            </Grid2>
        </BaseItemBlock>
    )
}

function GradeBar({ranking, GPA}) {
    const valuetext = (value) => {
        return SliderValueRankStringMapping[value];
    }
    const sliderValue = rankPercentSliderValueMapping[ranking];
    const marks = [
        {
            value: 2,
            label: '1.7',
        }, {
            value: sliderValue,
            label: GPA,
        },
    ]
    if (sliderValue !== 95) {
        marks.push({
            value: 98,
            label: '4.0',
        })
    }
    return (
        <Grid2 container xs={12} spacing={2}>
            <ContentCenteredGrid xs={12} sx={{mb: '0.5rem'}}>
                <BoldTypography variant="subtitle1">申请时最高学位GPA以及对应学院/专业排名：</BoldTypography>
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
        <Grid2 container xs={12}>
            <ContentCenteredGrid xs={12 / 5} sx={{flexDirection: 'column', justifyContent: 'center'}}>
                <BoldTypography variant="subtitle1">GRE</BoldTypography>
                <Typography>{GRE.Total}</Typography>
            </ContentCenteredGrid>
            {Object.entries(GRE).map(([key, value]) => {
                if (key === 'Total') {
                    return null;
                }
                return (
                    <ContentCenteredGrid xs={12 / 5} key={key}
                                         sx={{flexDirection: 'column', justifyContent: 'center'}}>
                        <BoldTypography variant="subtitle1">{EnglishExamMapping["GRE"][key]}</BoldTypography>
                        <Typography>{value}</Typography>
                    </ContentCenteredGrid>
                )
            })}
            <ContentCenteredGrid xs={12 / 5} sx={{flexDirection: 'column', justifyContent: 'center'}}/>

        </Grid2>
    )
}

function EnglishExamBlock({EnglishProficiency}) {
    if (!EnglishProficiency || Object.keys(EnglishProficiency).length === 0) {
        EnglishProficiency = {
            "语言成绩": {
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
                    <Grid2 container xs={12} key={examType}>
                        <ContentCenteredGrid xs={12 / 5}
                                             sx={{flexDirection: 'column', justifyContent: 'center'}}>
                            <BoldTypography variant="subtitle1">{examType}</BoldTypography>
                            <Typography>{grade.Total}</Typography>
                        </ContentCenteredGrid>
                        {Object.entries(grade).map(([key, value]) => {
                            if (key === 'Total') {
                                return null;
                            }
                            return (
                                <ContentCenteredGrid xs={12 / 5} key={key}
                                                     sx={{flexDirection: 'column', justifyContent: 'center'}}>
                                    <BoldTypography
                                        variant="subtitle1">{EnglishExamMapping[examType][key]}</BoldTypography>
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
                <BoldTypography variant='h6'>交换经历</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Exchanges.map((exchange, index) => {
                    return (
                        <Fragment key={index}>
                            <BaseListItem
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
                <BoldTypography variant='h6'>科研经历</BoldTypography>
                <Typography variant="subtitle1">{Researches.Focus}</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    Icon={<BiotechIcon/>}
                    primary={`国内${Researches.Domestic.Num}段研究经历`}
                    secondary={Researches.Domestic.Detail === '' ? '具体描述：暂无' : Researches.Domestic.Detail}
                />
                <Divider/>
                <BaseListItem
                    Icon={<BiotechIcon/>}
                    primary={`国外${Researches.International.Num}段研究经历`}
                    secondary={Researches.International.Detail === '' ? '具体描述：暂无' : Researches.International.Detail}
                />
            </List>
        </BaseItemBlock>
    )
}

function InternshipBlock({Internships}) {
    return (
        <BaseItemBlock className="InternshipBlock" checkpointProps={{xs: 12, lg: 6, xl: 4}}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>实习经历</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    Icon={<WorkIcon/>}
                    primary={`国内${Internships.Domestic.Num}段实习经历`}
                    secondary={Internships.Domestic.Detail === '' ? '具体描述：暂无' : Internships.Domestic.Detail}
                />
                <Divider/>
                <BaseListItem
                    Icon={<WorkIcon/>}
                    primary={`国外${Internships.International.Num}段实习经历`}
                    secondary={Internships.International.Detail === '' ? '具体描述：暂无' : Internships.International.Detail}
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
                <BoldTypography variant='h6'>发表论文</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Publications.map((publication, index) => {
                    return (
                        <Fragment key={index}>
                            <BaseListItem
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
                <BoldTypography variant='h6'>推荐信</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {Recommendations.map((recommendation, index) => {
                    let primary = recommendation.Type.map((type) => recommendationTypeMapping[type]).join('+');
                    primary = primary === '' ? '暂无' : primary;
                    return (
                        <Fragment key={index}>
                            <BaseListItem
                                Icon={<EmailIcon/>}
                                primary={primary}
                                secondary={recommendation.Detail === '' ? '具体描述：暂无' : recommendation.Detail}
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
        Competitions = "具体描述：暂无";
    }
    return (
        <BaseItemBlock className="CompetitionBlock" checkpointProps={{xs: 12, lg: 6, xl: 4}}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>竞赛</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    Icon={<ShutterSpeedIcon/>}
                    primary="竞赛经历"
                    secondary={Competitions === '' ? '具体描述：暂无' : Competitions}
                />
            </List>
        </BaseItemBlock>
    )
}

function RecordBlock({Records, ApplicantID, editable}) {
    const [open, setOpen] = useState(false);
    const [deleteRecordID, setDeleteRecordID] = useState('');
    const handleOpen = (recordID) => {
        setOpen(true);
        setDeleteRecordID(recordID);
    }
    const handleClose = () => {
        setOpen(false);
    }
    const navigate = useNavigate();

    return (
        <BaseItemBlock className="RecordBlock" checkpointProps={{xs: 12}} spacing={2}>
            <ContentCenteredGrid xs={12} sx={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>申请记录</BoldTypography>
                {editable ? <Tooltip title='添加记录' arrow sx={{marginLeft: '10px'}}>
                    <Button variant='outlined' onClick={() => {
                        navigate(`/profile/new-record`, {
                            state: {
                                applicantID: ApplicantID,
                                from: `/profile/${ApplicantID}`
                            }
                        });
                    }}>
                        <Add/>
                    </Button>
                </Tooltip> : null}
            </ContentCenteredGrid>
            {Object.values(Records).map((record, index) => {
                return (
                    <Grid2 sx={{display: 'flex'}} xs={12} sm={6} md={12} lg={6} xl={4} key={index}>
                        <Card elevation={3} sx={{
                            width: "100%",
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <BaseListItem
                                Icon={<Chip label={record.Status} color={RecordStatusPalette[record.Status]}/>}
                                primary={
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowWrap: 'anywhere'}}>
                                        {record.ProgramID}
                                        {
                                            editable ?
                                                <ButtonGroup>
                                                    <Tooltip title='编辑此记录' arrow>
                                                        <IconButton component={Link}
                                                                    to={`/profile/${record.ApplicantID}/${encodeURIComponent(record.ProgramID)}/edit`}>
                                                            <Edit/>
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='删除此记录' arrow>
                                                        <IconButton onClick={() => {
                                                            handleOpen(record.RecordID)
                                                        }} color='error'>
                                                            <Delete/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </ButtonGroup> : null
                                        }
                                    </Box>
                                }
                                secondary={{
                                    "申请季": record.ProgramYear + record.Semester,
                                    "提交时间": record.TimeLine?.Submit?.split('T')[0] ?? "暂无",
                                    "面试时间": record.TimeLine?.Interview?.split('T')[0] ?? '暂无',
                                    "通知时间": record.TimeLine?.Decision?.split('T')[0] ?? '暂无',
                                    "补充说明": record.Detail === '' ? '暂无' : record.Detail
                                }}
                            />
                        </Card>
                    </Grid2>
                )
            })}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>是否要删除{deleteRecordID.split('|')[1]}项目的申请记录？</DialogTitle>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Form method='post'>
                        <Input type='hidden' name='RecordID' value={deleteRecordID}/>
                        <Button color='error' type='submit'
                                name='ActionType' value='DeleteRecord'
                                onClick={handleClose}>
                            确认
                        </Button>
                    </Form>
                </DialogActions>
            </Dialog>
        </BaseItemBlock>
    )
}



