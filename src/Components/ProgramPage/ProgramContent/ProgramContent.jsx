import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ProgramContent.css'
import {Form, Link, Outlet, redirect, useLoaderData, useNavigate} from "react-router-dom";
import {getProgramContent, getProgramDesc} from "../../../Data/ProgramData";
import {collectProgram, getMetadata, uncollectProgram} from '../../../Data/UserData';
import {Box, IconButton, Paper, Tooltip, Typography} from "@mui/material";
import {AddRounded, CloseRounded, EditRounded, RefreshRounded} from "@mui/icons-material";
import remarkGfm from 'remark-gfm'
import {getRecordByProgram} from "../../../Data/RecordData";
import {DataGrid} from "../../DataPoints/DataPoints";
import {DraggableFAB} from "../../common";
import StarButton from "./StarButton"

export async function loader({params}) {
    const programId = decodeURIComponent(params.programId);
    const records = Object.values(await getRecordByProgram(programId));
    const programContent = await getProgramContent(programId);
    const metadata = await getMetadata()
    return {programContent, records, metadata};
}

export async function action({params, request}) {
    const formData = await request.formData();
    const actionType = formData.get("ActionType");
    const programId = decodeURIComponent(params.programId);
    if (actionType === "Refresh") {
        await getProgramDesc(programId, true);
        return getRecordByProgram(programId, true);
    }
    if (actionType === "Star") {
        await collectProgram(programId);
        return redirect(request.url);
    }
    if (actionType === "UnStar") {
        await uncollectProgram(programId);
        return redirect(request.url);
    }
}

function ProgramContent({editable = true, inDialog = false}) {
    const {programContent, records, metadata} = useLoaderData();
    const navigate = useNavigate();
    const recordsWithSeason = records.map(record => ({
        ...record,
        Season: record.ProgramYear + " " + record.Semester,
    }));
    return (
        <>
            <Box className="ProgramHeader" sx={{pb: "0.5rem"}}>
                <Typography variant='h4' sx={{display: 'flex', position: 'relative'}}>
                    {programContent.ProgramID}
                </Typography>
                <div className='ReviseRefreshButtonGroup'>
                    {editable && <Tooltip title="编辑项目简介" arrow>
                        <IconButton component={Link} to={`edit${window.location.search}`}>
                            <EditRounded/>
                        </IconButton>
                    </Tooltip>}
                    <StarButton programID={programContent.ProgramID} metadata={metadata}/>
                    <Form method='post' style={{display: 'flex'}}>
                        <Tooltip title="刷新项目内容" arrow>
                            <IconButton type='submit' name="ActionType" value="Refresh">
                                <RefreshRounded/>
                            </IconButton>
                        </Tooltip>
                    </Form>
                    {inDialog && <IconButton onClick={() => navigate("..")}>
                        <CloseRounded/>
                    </IconButton>}
                </div>
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
            }}>
                <Paper sx={{
                    p: '1.5rem',
                    height: '48%',
                    overflowY: 'auto',
                    marginBottom: '1rem'
                }}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className='ProgramDescription'
                    >
                        {programContent.description}
                    </ReactMarkdown>
                </Paper>

                {editable &&
                    <Box sx={{
                        height: '48%',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <DataGrid
                            records={recordsWithSeason}
                            style={{
                                padding: '0',
                                flex: 1,
                                minHeight: 0,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            insideProgramPage={true}
                        />
                        <DraggableFAB
                            Icon={<AddRounded/>}
                            ActionType="AddRecord"
                            ButtonClassName="HiddenAddButton"
                            color="primary"
                            onClick={() => {
                                navigate(`/profile/new-record`, {
                                    state: {
                                        programID: programContent.ProgramID,
                                        from: window.location.pathname
                                    }
                                });
                            }}
                            style={{position: 'absolute', bottom: '20px', right: '20px'}}
                            tooltipTitle="添加记录"
                        />
                    </Box>
                }
            </Box>

            <Outlet/>
        </>
    );
}

export default ProgramContent;
