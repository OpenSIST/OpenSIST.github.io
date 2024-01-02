import React, {useRef} from 'react';
import ReactMarkdown from 'react-markdown';
import AddModifyProgram from "../../Modify/Program/AddModifyProgram";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./css/github.css";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import Draggable from 'react-draggable';
import './ProgramContent.css'
import {Form, useLoaderData} from "react-router-dom";

import {getProgramContent} from "../../../Data/ProgramData";

export async function loader({params}) {
    const programId = params.programId;
    const programContent = await getProgramContent(programId);
    return {programContent};
}

// export async function action({params}) {
//     const programId = params.programId;
//
// }

function ProgramContent() {
    const {programContent} = useLoaderData();
    const nodeRef = useRef(null);

    return (
        <div className="ProgramContent">
            <div className='ProgramDescription'>
                <ReactMarkdown>{programContent.description}</ReactMarkdown>
            </div>
            <Draggable nodeRef={nodeRef}>
                <div ref={nodeRef} className='EditRefreshButtonGroup'>
                    <Form action='edit'>
                        <button type='submit' title='EditButton'
                                className='Button'>
                            <FontAwesomeIcon icon={solid("pen-to-square")}/>
                        </button>
                    </Form>
                </div>
            </Draggable>
        </div>
    );
}

export default ProgramContent;