import React, {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import AddModifyProgram from "../../Modify/Program/AddModifyProgram";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./css/github.css";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

function ProgramContent({program, isEditMode, setIsEditMode, isForceFetch, setIsForceFetch, className}) {
    const [isLoading, setIsLoading] = useState(false);

    const handleRefresh = () => {
        setIsLoading(true);
        setIsForceFetch(true);
    };

    useEffect(() => {
        if (!isForceFetch) {
            setIsLoading(false);
        }
    }, [isForceFetch]);

    const handleRevise = () => {
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
                <div className='ProgramDescription'>
                    <ReactMarkdown>{program.Description}</ReactMarkdown>
                </div>
                <div className='ReviseRefreshButtonGroup'>
                    <button onClick={handleRevise} id='ReviseButton' title='ReviseButton' className='Button'><FontAwesomeIcon icon={solid("pen-to-square")}/></button>
                    <button onClick={handleRefresh} id='RefreshButton' title='RefreshButton' className='Button'>
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin/> :
                            <FontAwesomeIcon icon={solid("arrows-rotate")}/>}
                    </button>
                </div>
            </div>
        )
    );
}

export default ProgramContent;