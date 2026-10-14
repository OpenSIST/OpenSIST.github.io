import {useEffect, useState} from "react";
import {
    Avatar,
    Badge,
    Box,
    Button,
    ButtonGroup,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Slider,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {
    Delete,
    Download,
    Edit,
    HomeRounded,
    LinkedIn,
    Link as LinkIcon,
    Mail,
    Refresh
} from "@mui/icons-material";
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import TransgenderIcon from '@mui/icons-material/Transgender';
import {faQq, faWeixin} from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Grid2 from "@mui/material/Grid";
import {Form, Link} from "react-router-dom";
import {isAuthApplicant} from "../../../Data/ApplicantData";
import {getFileContent} from "../../../Data/FileData";
import {
    currentDegreeMapping,
    EnglishExamMapping,
    rankPercentSliderValueMapping,
    SliderValueRankStringMapping
} from "../../../Data/Schemas";
import {BoldTypography} from "../../common";
import {profileApplicantEditPath} from "../../RouteUtils";
import {BaseItemBlock, ContentCenteredGrid} from "./ProfileApplicantShared";

const contactIcons = {
    "QQ": <FontAwesomeIcon icon={faQq} fontSize='large'/>,
    "WeChat": <FontAwesomeIcon icon={faWeixin} fontSize='large'/>,
    "LinkedIn": <LinkedIn/>,
    "HomePage": <HomeRounded/>,
    "OtherLink": <LinkIcon/>,
    "Email": <Mail/>
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

function ControlButtonGroup({applicantId, records = {}, postLength = 0, editable}) {
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const hasDependencies = Object.keys(records).length + postLength > 0;

    return (
        <>
            <Form method='post'>
                <Tooltip title='刷新申请人信息' arrow>
                    <IconButton type='submit' name='ActionType' value='Refresh'>
                        <Refresh/>
                    </IconButton>
                </Tooltip>
            </Form>
            {editable ? <>
                <Tooltip title='更改申请人信息' arrow>
                    <IconButton component={Link} to={profileApplicantEditPath(applicantId)}>
                        <Edit/>
                    </IconButton>
                </Tooltip>
                <Tooltip title='删除申请人' arrow>
                    <IconButton onClick={() => setOpen(true)} color='error'>
                        <Delete/>
                    </IconButton>
                </Tooltip>
            </> : null}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>是否要删除{applicantId}？</DialogTitle>
                <DialogContent>
                    <DialogContentText color='error'>
                        {hasDependencies ? '请确保您已经删除了所有申请记录，CV/SOP，以及撰写的分享贴！' : '此操作会将申请人信息全部删除，且无法恢复，请谨慎！'}
                    </DialogContentText>
                    {!hasDependencies ?
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
                                onChange={(event) => setConfirmText(event.target.value)}
                            />
                        </> : null}
                </DialogContent>
                {!hasDependencies ?
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>取消</Button>
                        <Form method='post'>
                            <Button color='error' type='submit' name='ActionType' value='DeleteApplicant'
                                    onClick={() => setOpen(false)}
                                    disabled={confirmText !== applicantId}>
                                确认
                            </Button>
                        </Form>
                    </DialogActions> : null}
            </Dialog>
        </>
    )
}

export function BasicInfoBlock({avatarUrl, contact = {}, applicant, records, editable}) {
    const [isAuth, setIsAuth] = useState(false);
    useEffect(() => {
        let mounted = true;
        isAuthApplicant(applicant.ApplicantID).then((authorized) => {
            if (mounted) {
                setIsAuth(authorized);
            }
        });
        return () => {
            mounted = false;
        };
    }, [applicant.ApplicantID]);

    async function onDownload(postId) {
        if (!postId) {
            return;
        }
        const fileType = postId.startsWith('CV') ? "CV" : "SoP";
        const link = document.createElement("a");
        link.download = `${applicant.ApplicantID}_${fileType}.pdf`;
        link.href = await getFileContent(postId);
        link.click();
    }

    const contactEntries = Object.entries(contact);
    const cvPostId = applicant?.Posts?.find(post => post.startsWith('CV'));
    const sopPostId = applicant?.Posts?.find(post => post.startsWith('SoP'));

    return (
        <BaseItemBlock className="BasicInfoBlock" checkpointProps={{xs: 12}} spacing={2}>
            <Grid2
                container
                size={{
                    xs: 12,
                    sm: 5,
                    md: 6,
                    lg: 5,
                    xl: 4
                }}>
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
                <Grid2 container spacing={0} size="grow">
                    <ContentCenteredGrid size={12}>
                        <BoldTypography variant="h5" color="primary" sx={{pl: '8px'}}>
                            {applicant.ApplicantID.replace("@", " ")}
                        </BoldTypography>
                    </ContentCenteredGrid>
                    <ContentCenteredGrid size={12}>
                        <Typography variant="subtitle1" sx={{pt: '8px', pl: '8px'}}>
                            {`${applicant.Major} ${currentDegreeMapping[applicant.CurrentDegree] ?? applicant.CurrentDegree}`}
                        </Typography>
                    </ContentCenteredGrid>
                    <ContentCenteredGrid size={12}>
                        <ControlButtonGroup applicantId={applicant.ApplicantID}
                                            records={records}
                                            postLength={applicant?.Posts?.length ?? 0}
                                            editable={editable && isAuth}/>
                    </ContentCenteredGrid>
                </Grid2>
                <ContentCenteredGrid size={12} sx={{gap: contactEntries.length ? '0.4rem' : '1rem'}}>
                    <BoldTypography variant="subtitle1"> 联系方式: </BoldTypography>
                    {contactEntries.length ?
                        <ButtonGroup>
                            {contactEntries.map(([key, value]) => {
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
                <ContentCenteredGrid size={12} sx={{gap: '1rem'}}>
                    <BoldTypography variant="subtitle1"> 申请材料: </BoldTypography>
                    <ButtonGroup>
                        <Button
                            endIcon={<Download/>}
                            onClick={() => onDownload(cvPostId)}
                            disabled={!cvPostId}
                            size='small'
                        >
                            CV
                        </Button>
                        <Button
                            endIcon={<Download/>}
                            onClick={() => onDownload(sopPostId)}
                            disabled={!sopPostId}
                            size='small'
                        >
                            SoP/PS
                        </Button>
                    </ButtonGroup>
                </ContentCenteredGrid>
                <ContentCenteredGrid size={12} sx={{gap: '1rem'}}>
                    <BoldTypography variant="subtitle1"> 最终去向: </BoldTypography>
                    <Chip color="neutral" label={applicant.Final === "" ? "暂无/未知" : applicant.Final}/>
                </ContentCenteredGrid>
            </Grid2>
            <Grid2
                container
                size={{
                    xs: 12,
                    sm: 7,
                    md: 6,
                    lg: 7,
                    xl: 8
                }}>
                <EnglishExamBlock englishProficiency={applicant?.EnglishProficiency}/>
                <GREBlock gre={applicant?.GRE}/>
            </Grid2>
            <Grid2 size={12}>
                <GradeBar gpa={applicant.GPA} ranking={applicant.Ranking}/>
            </Grid2>
        </BaseItemBlock>
    );
}

function GradeBar({ranking, gpa}) {
    const sliderValue = rankPercentSliderValueMapping[ranking] ?? 30;
    const marks = [
        {
            value: 2,
            label: '1.7',
        }, {
            value: sliderValue,
            label: gpa,
        },
    ]
    if (sliderValue !== 95) {
        marks.push({
            value: 98,
            label: '4.0',
        })
    }
    return (
        <Grid2 container spacing={2} size={12}>
            <ContentCenteredGrid size={12} sx={{mb: '0.5rem'}}>
                <BoldTypography variant="subtitle1">申请时最高学位GPA以及对应学院/专业排名：</BoldTypography>
            </ContentCenteredGrid>
            <ContentCenteredGrid size={12}>
                <Slider
                    defaultValue={sliderValue}
                    getAriaValueText={(value) => SliderValueRankStringMapping[value]}
                    valueLabelFormat={(value) => SliderValueRankStringMapping[value]}
                    valueLabelDisplay="on"
                    marks={marks}
                    className='RankingSlider'
                />
            </ContentCenteredGrid>
        </Grid2>
    );
}

function ScoreStat({label, value, emphasize}) {
    return (
        <Box sx={{flex: 1, minWidth: 44, textAlign: "center"}}>
            <Typography sx={{fontSize: 12, color: "text.secondary", mb: 0.25, whiteSpace: "nowrap"}}>{label}</Typography>
            <Typography sx={{
                fontWeight: 600,
                fontSize: emphasize ? 20 : 16,
                lineHeight: 1.2,
                color: emphasize ? "primary.main" : "text.primary",
            }}>
                {value ?? "-"}
            </Typography>
        </Box>
    );
}

function ScoreRow({examType, grade}) {
    return (
        <Box sx={{display: "flex", alignItems: "flex-end", gap: 1, width: "100%"}}>
            <ScoreStat label={examType} value={grade.Total} emphasize/>
            {Object.entries(grade).map(([key, value]) => (
                key === "Total" ? null :
                    <ScoreStat key={key} label={EnglishExamMapping[examType]?.[key] ?? key} value={value}/>
            ))}
        </Box>
    );
}

function GREBlock({gre}) {
    const displayGre = gre ?? {"Total": "-", "V": "-", "Q": "-", "AW": "-"};
    return (
        <Grid2 size={12}>
            <ScoreRow
                examType="GRE"
                grade={{...displayGre}}
            />
        </Grid2>
    );
}

function EnglishExamBlock({englishProficiency}) {
    const displayEnglishProficiency = englishProficiency && Object.keys(englishProficiency).length > 0
        ? englishProficiency
        : {"语言成绩": {"Total": "-", "S": "-", "R": "-", "L": "-", "W": "-"}};

    return (
        <Grid2 size={12} container spacing={1.5}>
            {Object.entries(displayEnglishProficiency).map(([examType, grade]) => (
                <Grid2 size={12} key={examType}>
                    <ScoreRow examType={examType} grade={grade}/>
                </Grid2>
            ))}
        </Grid2>
    );
}
