import {useState} from "react";
import {
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
    Input,
    Tooltip,
    Typography
} from "@mui/material";
import {Add, Delete, Edit} from "@mui/icons-material";
import Grid2 from "@mui/material/Grid";
import {Form, Link, useNavigate} from "react-router-dom";
import {RecordStatusPalette} from "../../../Data/Schemas";
import {BoldTypography} from "../../common";
import {profileApplicantPath, profileRecordEditPath} from "../../RouteUtils";
import {BaseItemBlock, ContentCenteredGrid} from "./ProfileApplicantShared";

function RecordDate({label, value}) {
    return (
        <Box>
            <Typography sx={{fontSize: 11, color: "text.secondary", lineHeight: 1.4}}>{label}</Typography>
            <Typography variant="body2" sx={{fontWeight: 500}}>{value || "—"}</Typography>
        </Box>
    );
}

export function RecordBlock({records = {}, applicantId, editable}) {
    const [open, setOpen] = useState(false);
    const [deleteRecordId, setDeleteRecordId] = useState('');
    const navigate = useNavigate();

    function handleOpen(recordId) {
        setOpen(true);
        setDeleteRecordId(recordId);
    }

    return (
        <BaseItemBlock className="RecordBlock" checkpointProps={{xs: 12}} spacing={2}>
            <ContentCenteredGrid size={12} sx={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>申请记录</BoldTypography>
                {editable ? <Tooltip title='添加记录' arrow sx={{marginLeft: '10px'}}>
                    <Button variant='outlined' onClick={() => {
                        navigate(`/profile/new-record`, {
                            state: {
                                applicantID: applicantId,
                                from: profileApplicantPath(applicantId)
                            }
                        });
                    }}>
                        <Add/>
                    </Button>
                </Tooltip> : null}
            </ContentCenteredGrid>
            {Object.values(records).map((record) => {
                return (
                    <Grid2
                        sx={{display: 'flex'}}
                        key={record.RecordID}
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 12,
                            lg: 6,
                            xl: 4
                        }}>
                        <Card elevation={0} sx={{
                            width: "100%",
                            bgcolor: (theme) => theme.palette.surface,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                        }}>
                            <Box sx={{p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25}}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <Chip size="small" label={record.Status} color={RecordStatusPalette[record.Status]}/>
                                    <BoldTypography sx={{flex: 1, minWidth: 0, overflowWrap: 'anywhere'}}>
                                        {record.ProgramID}
                                    </BoldTypography>
                                    {editable ?
                                        <Box sx={{display: 'flex', flexShrink: 0}}>
                                            <Tooltip title='编辑此记录' arrow>
                                                <IconButton size="small" component={Link}
                                                            to={profileRecordEditPath(record.ApplicantID, record.ProgramID)}>
                                                    <Edit fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title='删除此记录' arrow>
                                                <IconButton size="small" onClick={() => handleOpen(record.RecordID)} color='error'>
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box> : null}
                                </Box>
                                <Box>
                                    <Chip size="small" variant="outlined" label={`${record.ProgramYear ?? ""}${record.Semester ?? ""}`}/>
                                </Box>
                                <Box sx={{display: 'flex', gap: 3, flexWrap: 'wrap'}}>
                                    <RecordDate label="提交" value={record.TimeLine?.Submit?.split('T')[0]}/>
                                    <RecordDate label="面试" value={record.TimeLine?.Interview?.split('T')[0]}/>
                                    <RecordDate label="通知" value={record.TimeLine?.Decision?.split('T')[0]}/>
                                </Box>
                                {record.Detail ?
                                    <Typography variant="body2" sx={{color: 'text.secondary', whiteSpace: 'pre-wrap'}}>
                                        {record.Detail}
                                    </Typography> : null}
                            </Box>
                        </Card>
                    </Grid2>
                );
            })}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>是否要删除{deleteRecordId.split('|')[1]}项目的申请记录？</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>取消</Button>
                    <Form method='post'>
                        <Input type='hidden' name='RecordID' value={deleteRecordId}/>
                        <Button color='error' type='submit'
                                name='ActionType' value='DeleteRecord'
                                onClick={() => setOpen(false)}>
                            确认
                        </Button>
                    </Form>
                </DialogActions>
            </Dialog>
        </BaseItemBlock>
    );
}
