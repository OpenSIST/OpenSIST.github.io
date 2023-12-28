import React, {useState, useEffect} from 'react';
import fetch_url from "../Data";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import ProgramContent from "./ProgramContent/ProgramContent";
function SideBar(props) {
    const [univList, setUnivList] = useState([]);
    const [searched_univ, setSearchedUniv] = useState([]);
    const [selectedProgramDesc, setSelectedProgramDesc] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            let response = await fetch_url(props.url);
            let data = Object.entries(response);
            setUnivList(data);
            setSearchedUniv(data);
        };
        fetchData();
    }, [props.url]);

    const handleProgramSelect = (programDesc) => {
        setSelectedProgramDesc(programDesc);
    }

    return (
        <div className='ProgramMainBlock'>
            <div className='Center-block Side-bar'>
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
            </div>
            <div className='Program-Description'>
                <ProgramContent programDesc={selectedProgramDesc}/>
            </div>
        </div>
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
                    {program[1].name}
                </li>
            ))}
        </ul>
    )
}

export default SideBar;
