import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ProgramContent.css'
import {Form, Link, useLoaderData} from "react-router-dom";
import {getProgramContent, getProgramDesc} from "../../../Data/ProgramData";
import {IconButton, Typography} from "@mui/material";
import {Edit, Refresh} from "@mui/icons-material";
import remarkGfm from 'remark-gfm'

export async function loader({params}) {
    // console.time("ProgramContentLoader")
    const programId = params.programId;
    try {
        const programContent = await getProgramContent(programId);
        // console.timeEnd("ProgramContentLoader")
        return {programContent};
    } catch (e) {
        throw e;
    }
}

export async function action({params}) {
    const programId = params.programId;
    return await getProgramDesc(programId, true);
}

function ProgramContent({editable = true}) {
    const {programContent} = useLoaderData();
    return (
        <>
            <div className="ProgramHeader">
                <Typography variant='h3' sx={{display: 'flex', position: 'relative'}}>
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
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className='ProgramDescription'
            >
                {programContent.description}
            </ReactMarkdown>
        </>
    );
}

export default ProgramContent;