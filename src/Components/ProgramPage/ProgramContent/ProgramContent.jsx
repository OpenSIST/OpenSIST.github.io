import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ProgramContent.css'
import {Form, Link, redirect, useLoaderData} from "react-router-dom";
import {getProgramContent, getProgramDesc} from "../../../Data/ProgramData";
import {IconButton, Typography} from "@mui/material";
import {Edit, Refresh} from "@mui/icons-material";

export async function loader({params}) {
    const programId = params.programId;
    try {
        const programContent = await getProgramContent(programId);
        return {programContent};
    } catch (e) {
        throw e;
    }
}

export async function action({params}) {
    const programId = params.programId;
    return await getProgramDesc(programId, true);
}

function ProgramContent() {
    const {programContent} = useLoaderData();
    return (
        <>
            <div className="ProgramHeader">
                <Typography variant='h3' sx={{display: 'flex', position: 'relative'}}>
                    {programContent.ProgramID}
                </Typography>
                <div className='ReviseRefreshButtonGroup'>
                    <IconButton component={Link} to={`edit${window.location.search}`}>
                        <Edit/>
                    </IconButton>
                    <Form method='post' style={{display: 'flex'}}>
                        <IconButton type='submit' title='refresh program content'>
                            <Refresh/>
                        </IconButton>
                    </Form>
                </div>
            </div>
            <ReactMarkdown
                className='ProgramDescription'
            >
                {programContent.description}
            </ReactMarkdown>
        </>
    );
}

export default ProgramContent;