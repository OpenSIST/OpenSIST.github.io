import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ProgramContent.css'
import {Form, Link, useLoaderData, useNavigate} from "react-router-dom";
import {getProgramContent, getProgramDesc} from "../../../Data/ProgramData";
import {Box, IconButton, Paper, Tooltip, Typography} from "@mui/material";
import {Add, Edit, Refresh} from "@mui/icons-material";
import remarkGfm from 'remark-gfm'
import {getRecordByProgram} from "../../../Data/RecordData";
import {DataGrid} from "../../DataPoints/DataPoints";
import {DraggableFAB} from "../../common";

export async function loader({params}) {
    const programId = params.programId;
    let records = await getRecordByProgram(programId);
    records = Object.values(records);
    try {
        const programContent = await getProgramContent(programId);
        return {programContent, records};
    } catch (e) {
        throw e;
    }
}

export async function action({params, request}) {
    const formData = await request.formData();
    const ActionType = formData.get("ActionType");
    const programId = params.programId;
    if (ActionType === "Refresh") {
        await getProgramDesc(programId, true);
        return await getRecordByProgram(programId, true);
    }

}

function ProgramContent({editable = true}) {
    let {programContent, records} = useLoaderData();
    const naviagte = useNavigate();
    records = records.map(record => {
        record['Season'] = record.ProgramYear + " " + record.Semester;
        return record;
    });
    return (
        <>
            <Box className="ProgramHeader" sx={{pb: "0.5rem"}}>
                <Typography variant='h4' sx={{display: 'flex', position: 'relative'}}>
                    {programContent.ProgramID}
                </Typography>
                <div className='ReviseRefreshButtonGroup'>
                    {editable ?
                        <Tooltip title="编辑项目简介" arrow>
                            <IconButton component={Link} to={`edit${window.location.search}`}>
                                <Edit/>
                            </IconButton>
                        </Tooltip> : null}
                    <Form method='post' style={{display: 'flex'}}>
                        <Tooltip title="刷新项目内容" arrow>
                            <IconButton type='submit' name="ActionType" value="Refresh">
                                <Refresh/>
                            </IconButton>
                        </Tooltip>
                    </Form>
                </div>
            </Box>
            <Paper sx={{p: '1.5rem', height: '100%', overflowY: 'auto'}}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className='ProgramDescription'
                >
                    {programContent.description}
                </ReactMarkdown>
            </Paper>
            {editable ? <>
                <DataGrid records={records} style={{padding: '1rem 0 1rem 0', height: '100%'}}
                          insideProgramPage={true}/>
                <DraggableFAB
                    Icon={<Add/>}
                    ActionType="AddRecord"
                    ButtonClassName="HiddenAddButton"
                    color="primary"
                    onClick={() => {
                        naviagte(`/profile/new-record`, {
                            state: {
                                programID: programContent.ProgramID,
                                from: window.location.pathname
                            }
                        });
                    }}
                    style={{position: 'absolute', bottom: '20%', right: '1rem'}}
                    tooltipTitle="添加记录"
                />
            </> : null}
        </>
    );
}

export default ProgramContent;