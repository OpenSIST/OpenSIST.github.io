import React, {useState, useEffect} from 'react';
import fetch_url from "../../Data/Data";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {solid} from '@fortawesome/fontawesome-svg-core/import.macro'
import ProgramContent from "./ProgramContent/ProgramContent";
import "./SideBar.css"
import AddModifyProgram from "../Modify/Program/AddModifyProgram";
import SearchBar from "./SearchBar/SearchBar";

function SideBar(props) {
    const [univList, setUnivList] = useState([]);
    const [searched_univ, setSearchedUniv] = useState([]);
    const [selectedProgramDesc, setSelectedProgramDesc] = useState("");
    const [addProgram, setAddProgram] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const handleAddProgram = () => {
        setSelectedProgramDesc("")
        setAddProgram(!addProgram);
    }

    useEffect(() => {
        const fetchData = async () => {
            let response = await fetch_url(props.url);
            let data = Object.entries(response);
            setUnivList(data);
            setSearchedUniv(data);
        };
        fetchData().then();
    }, [props.url]);

    const handleProgramSelect = (programDesc) => {
        setAddProgram(false);
        setSelectedProgramDesc(programDesc);
        setIsEditMode(false);
    }

    return (
        <>
            <div className='ProgramMainBlock'>
                <div className='Side-bar'>
                    <SearchBar setSearchedUniv={setSearchedUniv} univList={univList}/>
                    <ul className="Univ-list">
                        {searched_univ.map((univ) => (
                                <UnivItem univ={univ} key={univ[0]} onProgramSelect={handleProgramSelect}/>
                            )
                        )}
                    </ul>
                    <button onClick={handleAddProgram} id='AddProgramButton' title='AddProgramButton'>
                        <FontAwesomeIcon icon={solid("plus")}/>
                    </button>

                </div>
                <AddModifyProgram isShow={addProgram} setIsShow={setAddProgram} className='ProgramContent'/>
                <ProgramContent programDesc={selectedProgramDesc} setProgramDesc={setSelectedProgramDesc}
                                isEditMode={isEditMode} setIsEditMode={setIsEditMode}
                                className='ProgramContent'/>
            </div>
        </>
    );
}


function UnivItem(props) {

    const [isClicked, setClicked] = useState(false);
    const [showList, setShowList] = useState(false);

    const handleClick = () => {
        setClicked(!isClicked);
        setShowList(!showList);
    };

    return (
        <>
            <li className='Univ-item' onClick={handleClick}>
                <div>
                    {props.univ[0]}
                </div>
                <div>
                    {isClicked ? <FontAwesomeIcon icon={solid("caret-down")}/> :
                        <FontAwesomeIcon icon={solid("caret-right")}/>}
                </div>
            </li>
            <ProgramItem showList={showList} program={props.univ[1]} onProgramSelect={props.onProgramSelect}/>
        </>
    );
}


function ProgramItem({showList, program, onProgramSelect}) {
    if (!showList) {
        return null;
    }
    return (
        <ul className='Program-list'>
            {Object.entries(program).map((program) => (
                <li className='Program-item' key={program[0]} onClick={
                    () => onProgramSelect(program[1].description)
                } style={{cursor: "pointer"}}>
                    <div>
                        {program[1].name}
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default SideBar;
