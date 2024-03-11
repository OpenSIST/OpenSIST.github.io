import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ProgramContent.css'
import {Form, Link, useLoaderData} from "react-router-dom";
import {getProgramContent, getProgramDesc} from "../../../Data/ProgramData";
import {Box, IconButton, Paper, Tooltip, Typography} from "@mui/material";
import {Edit, Refresh} from "@mui/icons-material";
import remarkGfm from 'remark-gfm'
import {getRecordByProgram} from "../../../Data/RecordData";
import {DataGrid} from "../../DataPoints/DataPoints";
import {useSmallPage} from "../../common";

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
    records = records.map(record => {
        record['Season'] = record.ProgramYear + " " + record.Semester;
        return record;
    });
    const smallPage = useSmallPage();
    return (
        <>
            <Box className="ProgramHeader" sx={{pb: "0.5rem"}}>
                <Typography variant={smallPage ? 'h4' : 'h3'} sx={{display: 'flex', position: 'relative'}}>
                    {programContent.ProgramID}
                </Typography>
                {editable ? <div className='ReviseRefreshButtonGroup'>
                    <Tooltip title="编辑项目简介" arrow>
                        <IconButton component={Link} to={`edit${window.location.search}`}>
                            <Edit/>
                        </IconButton>
                    </Tooltip>
                    <Form method='post' style={{display: 'flex'}}>
                        <Tooltip title="刷新项目内容" arrow>
                            <IconButton type='submit' name="ActionType" value="Refresh">
                                <Refresh/>
                            </IconButton>
                        </Tooltip>
                    </Form>
                </div> : null}
            </Box>
            <Paper sx={{p: '1.5rem', height: '100%', overflowY: 'auto'}}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className='ProgramDescription'
                >
                    {programContent.description}
                </ReactMarkdown>
            </Paper>
            <DataGrid records={records} style={{padding: '1rem 0 1rem 0', height: '100%'}} insideProgramPage={true}/>
        </>
    );
}

export default ProgramContent;