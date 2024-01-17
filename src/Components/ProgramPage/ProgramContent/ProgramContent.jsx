import React from 'react';
import ReactMarkdown from 'react-markdown';
import "../../../github.css";
import './ProgramContent.css'
import {Form, Link, useLoaderData, useNavigate} from "react-router-dom";
import {getProgramContent, getProgramDesc} from "../../../Data/ProgramData";
import {regionFlagMapping, univAbbrFullNameMapping} from "../../../Data/Common";
import {IconButton, Tooltip, Typography} from "@mui/material";
import {Edit, HelpOutline, Refresh} from "@mui/icons-material";

export async function loader({params}) {
    const programId = params.programId;
    const programContent = await getProgramContent(programId);
    return {programContent};
}

export async function action({params}) {
    const programId = params.programId;
    return await getProgramDesc(programId, true);
}

function ProgramContent() {
    const {programContent} = useLoaderData();
    let flags = programContent.Region.map((region) => regionFlagMapping[region]);
    flags = flags.reduce((prev, curr) => prev + ' ' + curr, '');
    return (
        <div className="ProgramContent" key={programContent.ProgramID}>
            <div className="ProgramHeader">
                <h1 style={{display: 'flex', position: 'relative'}}>
                    {flags} {programContent.ProgramID}
                    {/*<div>*/}
                    {/*    {<Tooltip*/}
                    {/*        title={<Typography fontSize={15}>*/}
                    {/*            {univAbbrFullNameMapping[programContent.University]}*/}
                    {/*        </Typography>}*/}
                    {/*        arrow*/}
                    {/*        style={{position: 'absolute', width: 'fit-content'}}*/}
                    {/*    >*/}
                    {/*        <IconButton>*/}
                    {/*            <HelpOutline/>*/}
                    {/*        </IconButton>*/}
                    {/*    </Tooltip>}*/}
                    {/*</div>*/}
                </h1>
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
        </div>
    );
}

export default ProgramContent;