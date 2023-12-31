import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import AddModifyProgram from "../../Modify/Program/AddModifyProgram";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./css/github.css";

function ProgramContent({program, isEditMode, setIsEditMode, setIsForceFetch, className}) {
    const handleReviseClick = () => {
        setIsEditMode(!isEditMode);
    };

    if (program === null) {
        return null
    }

    return (
        isEditMode ? (
            <AddModifyProgram
                isShow={isEditMode} setIsShow={setIsEditMode}
                originData={program}
                className={className}
                setIsForceFetch={setIsForceFetch}
            />) : (
            <div className={className}>
                <ReactMarkdown>{program.Description}</ReactMarkdown>
                <button onClick={handleReviseClick}><FontAwesomeIcon icon={solid("pen-to-square")}/></button>
                <button onClick={() => setIsForceFetch(true)} id='RefreshButton' title='RefreshButton'>
                    <FontAwesomeIcon icon={solid("arrows-rotate")}/>
                </button>
            </div>
        )
    );
}

export default ProgramContent;