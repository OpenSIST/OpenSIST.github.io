import React from 'react';
import ReactMarkdown from 'react-markdown';
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./css/github.css";
import './ProgramContent.css'
import {Form, useLoaderData} from "react-router-dom";
import {getProgramContent, getProgramDesc} from "../../../Data/ProgramData";
import {ResponsiveButton} from "../../common";

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
    const components = {
        h1: ({node, ...props}) => (
            <h1 {...props} style={{display: 'flex'}}>
                {props.children}
                <div className='ReviseRefreshButtonGroup'>
                    <Form action='edit' style={{display: 'flex'}}>
                        <button type='submit' title='Edit'>
                            <FontAwesomeIcon icon={solid("pen-to-square")}/>
                        </button>
                    </Form>
                    <Form method='post' style={{display: 'flex'}}>
                        <ResponsiveButton/>
                    </Form>
                </div>
            </h1>
        ),
    };
    return (
        <div className="ProgramContent" key={programContent.ProgramID}>
            <ReactMarkdown
                components={components}
                className='ProgramDescription'
            >
                {programContent.description}
            </ReactMarkdown>
        </div>
    );
}

export default ProgramContent;