import React, {useState, useEffect} from 'react';
import fetch_url from "../../Data";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {solid} from '@fortawesome/fontawesome-svg-core/import.macro'
import ProgramContent from "../ProgramContent/ProgramContent";
import {useNavigate} from "react-router-dom";
import "./SideBar.css"
import AddModifyProgram from "../Modify/Program/AddModifyProgram";

function SideBar(props) {
    const navigate = useNavigate();
    const [univList, setUnivList] = useState([]);
    const [searched_univ, setSearchedUniv] = useState([]);
    const [selectedProgramDesc, setSelectedProgramDesc] = useState("");
    const [addProgram, setAddProgram] = useState(false);

    const handleAddProgram = () => {
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
        setSelectedProgramDesc(programDesc);
    }

    return (
        <>
            <div className='ProgramMainBlock'>
                <div className='Side-bar'>
                    <input className='Search-bar' onInput={event => {
                        event.preventDefault();
                        setSearchedUniv(univList.filter((univ) => univ[0].toLowerCase().includes(
                            event.target.value.toLowerCase())));
                    }} placeholder='search for...'/>
                    <ul className="Univ-list">
                        {searched_univ.map((univ) => (
                                <UnivItem univ={univ} key={univ[0]} onProgramSelect={handleProgramSelect}/>
                            )
                        )}
                    </ul>
                    <button onClick={handleAddProgram}>
                        Add Program
                    </button>
                </div>
                {addProgram ? <AddModifyProgram/> : null}
                <div className='ProgramContent'>
                    <ProgramContent programDesc={selectedProgramDesc}/>
                </div>
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
            {showList ? <ProgramItem program={props.univ[1]} onProgramSelect={props.onProgramSelect}/> : null}
        </>
    );
}


function ProgramItem({program, onProgramSelect}) {
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
