import React, {useState, useEffect} from 'react';
import {fetchProgramList, fetchProgramDesc} from "../../Data/Data";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {solid} from '@fortawesome/fontawesome-svg-core/import.macro'
import ProgramContent from "./ProgramContent/ProgramContent";
import "./SideBar.css"
import AddModifyProgram from "../Modify/Program/AddModifyProgram";
import SearchBar from "./SearchBar/SearchBar";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

function SideBar(props) {
    const [fullList, setFullList] = useState([]);
    const [universityProgramList, setUniversityProgramList] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [addProgram, setAddProgram] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isForceFetchList, setIsForceFetchList] = useState(false);
    const [isForceFetchDesc, setIsForceFetchDesc] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isForceFetchList) {
            setIsLoading(false);
        }
    }, [isForceFetchList]);

    const handleRefresh = () => {
        setIsLoading(true);
        setIsForceFetchList(true);
    }

    const handleAddProgram = () => {
        setSelectedUniversity(null);
        setSelectedProgram(null);
        setAddProgram(!addProgram);
    }

    useEffect(() => {
        const fetchData = async () => {
            let response = await fetchProgramList(isForceFetchList);
            let data = Object.entries(response);
            setFullList(data);
            setUniversityProgramList(data);
            setIsForceFetchList(false);
        };
        fetchData().then();
    }, [isForceFetchList]);

    useEffect(() => {
        const fetchData = async () => {
            if (selectedProgram !== null) {
                let response = await fetchProgramDesc({
                    session: localStorage.getItem('token'),
                    ProgramID: selectedProgram.ProgramID,
                    forceFetch: isForceFetchDesc
                });
                const ProgramWithDesc = {...selectedProgram};
                ProgramWithDesc['Description'] = response;
                setSelectedProgram(ProgramWithDesc);
                setSelectedUniversity(selectedProgram.University)
                setIsEditMode(false);
                setIsForceFetchDesc(false);
            }
        };
        fetchData().then();
    }, [selectedProgram ? selectedProgram.ProgramID : null, isForceFetchDesc]);

    const handleProgramSelect = (Program) => {
        setSelectedProgram(Program);
    }

    return (
        <>
            <div className='ProgramMainBlock'>
                <div className='SideBar'>
                    <SearchBar setSearchedUniv={setUniversityProgramList} univList={fullList}/>
                    <UnivProgramList universityProgramList={universityProgramList}
                                     selectedUniversity={selectedUniversity}
                                     selectedProgram={selectedProgram}
                                     setSelectedProgram={handleProgramSelect}
                    />
                    <div className="AddRefreshButtonGroup">
                        <button onClick={handleAddProgram} id='AddProgramButton' title='AddProgramButton'>
                            <FontAwesomeIcon icon={solid("plus")}/>
                        </button>
                        <button onClick={handleRefresh} id='RefreshButton' title='RefreshButton'>
                            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin/> :
                                <FontAwesomeIcon icon={solid("arrows-rotate")}/>}
                        </button>
                    </div>
                </div>
                <AddModifyProgram isShow={addProgram} setIsShow={setAddProgram} setIsForceFetch={setIsForceFetchList}
                                  className='ProgramContent'/>
                <ProgramContent program={selectedProgram}
                                isEditMode={isEditMode} setIsEditMode={setIsEditMode}
                                isForceFetch={isForceFetchDesc}
                                setIsForceFetch={setIsForceFetchDesc}
                                className='ProgramContent'/>
            </div>
        </>
    );
}

function UnivProgramList({
                             universityProgramList,
                             selectedUniversity,
                             selectedProgram,
                             setSelectedProgram
                         }) {
    return (
        <ul className="UnivProgramList">
            {universityProgramList.map(([university, programs]) => (
                <React.Fragment key={university}>
                    <UnivItem university={university} programs={programs} key={university}
                              selectedUniversity={selectedUniversity}
                              selectedProgram={selectedProgram}
                              setSelectedProgram={setSelectedProgram}
                    />
                </React.Fragment>
            ))}
        </ul>
    );

}


function UnivItem({university, programs, selectedUniversity, selectedProgram, setSelectedProgram}) {
    // const isClicked = unfoldUniversities.includes(university);
    const [isFolded, setIsFolded] = useState(false);
    const isSelected = (selectedUniversity === university);
    return (
        <>
            <li className={'UnivItem' + (isSelected ? "Selected" : "")}
                onClick={() => setIsFolded(!isFolded)}>
                <div> {university} </div>
                <div>
                    {isFolded ? <FontAwesomeIcon icon={solid("caret-down")}/> :
                        <FontAwesomeIcon icon={solid("caret-right")}/>}
                </div>
            </li>
            {isFolded ? programs.map((program) => (
                <ProgramItem program={program} key={program.Program}
                             selectedProgram={selectedProgram}
                             setSelectedProgram={setSelectedProgram}
                />
            )) : null}
        </>
    );
}

function ProgramItem({program, selectedProgram, setSelectedProgram}) {
    const isClicked = (selectedProgram !== null && selectedProgram.ProgramID === program.ProgramID);
    // console.log(`ProgramItem: ${program.ProgramID} ${isClicked}`);
    return (
        <li className={'ProgramItem' + (isClicked ? 'Selected' : '')}
            onClick={() => setSelectedProgram(program)}>
            <div> {program.Program} </div>
        </li>
    );

}


export default SideBar;
