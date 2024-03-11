import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ProgramContent.css'
import {Form, Link, redirect, useLoaderData} from "react-router-dom";
import {getProgramContent, getProgramDesc} from "../../../Data/ProgramData";
import {IconButton, Paper, Typography} from "@mui/material";
import {Edit, Refresh} from "@mui/icons-material";
import remarkGfm from 'remark-gfm'
import {getRecordByProgram} from "../../../Data/RecordData";
import {DataGrid} from "../../DataPoints/DataPoints";
import {useSmallPage} from "../../common";

export async function loader({params}) {
    // console.time("ProgramContentLoader")
    const programId = params.programId;
    let records = await getRecordByProgram(programId);
    records = Object.values(records);
    try {
        const programContent = await getProgramContent(programId);
        // console.timeEnd("ProgramContentLoader")
        return {programContent, records};
    } catch (e) {
        throw e;
    }
}

export async function action({params}) {
    const programId = params.programId;
    await getProgramDesc(programId, true);
    return await getRecordByProgram(programId, true);
}

function ProgramContent({editable = true}) {
    const {programContent, records} = useLoaderData();
    const smallPage = useSmallPage();
    return (
        <>
            <div className="ProgramHeader">
                <Typography variant={smallPage ? 'h4' : 'h3'} sx={{display: 'flex', position: 'relative'}}>
                    {programContent.ProgramID}
                </Typography>
                {editable ? <div className='ReviseRefreshButtonGroup'>
                    <IconButton component={Link} to={`edit${window.location.search}`}>
                        <Edit/>
                    </IconButton>
                    <Form method='post' style={{display: 'flex'}}>
                        <IconButton type='submit' title='refresh program content'>
                            <Refresh/>
                        </IconButton>
                    </Form>
                </div> : null}
            </div>
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