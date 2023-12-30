import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AddModifyProgram from "../../Modify/Program/AddModifyProgram";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./css/github.css";

function ProgramContent({ programDesc, setProgramDesc, isEditMode, setIsEditMode, className }) {
    const handleReviseClick = () => {
        setIsEditMode(!isEditMode);
    };

    const handleContentChange = (event) => {
        setProgramDesc(event.target.value);
    };

    if (programDesc === '') {
        return null
    }

    return (
        isEditMode ? (
            <AddModifyProgram
                isShow={isEditMode} setIsShow={setIsEditMode}
                originData={
                    {
                        ProgramID: 'MSCS@Stanford',
                        University: 'Stanford',
                        Program: 'MSCS',
                        Region: ['United States'],
                        Degree: 'Master',
                        TargetApplicantMajor: ['CS', 'EE'],
                        Description: programDesc
                    }
                }
                className={className}
            /> ) : (
                <div className={className}>
                    <ReactMarkdown>{programDesc}</ReactMarkdown>
                    <button onClick={handleReviseClick}><FontAwesomeIcon icon={solid("pen-to-square")} /></button>
                </div>
        )
    );
}

export default ProgramContent;