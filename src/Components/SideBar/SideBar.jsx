import React, {useState, useEffect} from 'react';
import {fetchProgramList, fetchProgramDesc} from "../../Data/Data";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {solid} from '@fortawesome/fontawesome-svg-core/import.macro'
import ProgramContent from "./ProgramContent/ProgramContent";
import "./SideBar.css"
import AddModifyProgram from "../Modify/Program/AddModifyProgram";
import SearchBar from "./SearchBar/SearchBar";

function SideBar(props) {
    const [fullList, setFullList] = useState([]);
    const [universityProgramList, setUniversityProgramList] = useState([]);
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [addProgram, setAddProgram] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const handleAddProgram = () => {
        setSelectedUniversity(null);
        setSelectedProgram(null);
        setAddProgram(!addProgram);
    }

    useEffect(() => {
        const fetchData = async () => {
            let response = await fetchProgramList();
            let data = Object.entries(response);
            setFullList(data);
            setUniversityProgramList(data);
        };
        fetchData().then();
    }, []);

    const handleProgramSelect = async (Program) => {
        setAddProgram(false);

        let response = await fetchProgramDesc({
            session: localStorage.getItem('token'),
            ProgramID: Program.ProgramID
        });

        const ProgramWithDesc = {
            ...Program, "Description": response
        }
        setSelectedProgram(ProgramWithDesc);
        setSelectedUniversity(Program.University)
        setIsEditMode(false);
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
                    <button onClick={handleAddProgram} id='AddProgramButton' title='AddProgramButton'>
                        <FontAwesomeIcon icon={solid("plus")}/>
                    </button>
                </div>
                <AddModifyProgram isShow={addProgram} setIsShow={setAddProgram} className='ProgramContent'/>
                <ProgramContent program={selectedProgram}
                                isEditMode={isEditMode} setIsEditMode={setIsEditMode}
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
        <li className={'ProgramItem' + (isClicked ? 'Selected' : '')} onClick={() => setSelectedProgram(program)}>
            <div> {program.Program} </div>
        </li>
    );

}


export default SideBar;
