import {useState} from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
    Input,
    Tooltip
} from "@mui/material";
import {Add, Delete, Edit} from "@mui/icons-material";
import Grid2 from "@mui/material/Grid";
import {Form, Link, useNavigate} from "react-router-dom";
import {RecordStatusPalette} from "../../../Data/Schemas";
import {BoldTypography} from "../../common";
import {BaseItemBlock, BaseListItem, ContentCenteredGrid} from "./ProfileApplicantShared";

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
                                from: `/profile/${applicantId}`
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
                        <Card elevation={3} sx={{
                            width: "100%",
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <BaseListItem
                                Icon={<Chip label={record.Status} color={RecordStatusPalette[record.Status]}/>}
                                primary={
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        overflowWrap: 'anywhere'
                                    }}>
                                        {record.ProgramID}
                                        {editable ?
                                            <ButtonGroup>
                                                <Tooltip title='编辑此记录' arrow>
                                                    <IconButton component={Link}
                                                                to={`/profile/${record.ApplicantID}/${encodeURIComponent(record.ProgramID)}/edit`}>
                                                        <Edit/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title='删除此记录' arrow>
                                                    <IconButton onClick={() => handleOpen(record.RecordID)} color='error'>
                                                        <Delete/>
                                                    </IconButton>
                                                </Tooltip>
                                            </ButtonGroup> : null}
                                    </Box>
                                }
                                secondary={{
                                    "申请季": `${record.ProgramYear ?? ""}${record.Semester ?? ""}`,
                                    "提交时间": record.TimeLine?.Submit?.split('T')[0] ?? "暂无",
                                    "面试时间": record.TimeLine?.Interview?.split('T')[0] ?? '暂无',
                                    "通知时间": record.TimeLine?.Decision?.split('T')[0] ?? '暂无',
                                    "补充说明": record.Detail || '暂无'
                                }}
                            />
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
