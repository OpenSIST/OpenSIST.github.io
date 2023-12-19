import React, {useState, useEffect} from 'react';
import fetch_url from "./Data";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
function SideBar(props) {
    const [univList, setUnivList] = useState([]);
    const [searched_univ, setSearchedUniv] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            let response = await fetch_url(props.url);
            let data = Object.entries(response);
            setUnivList(data);
            setSearchedUniv(data);
        };
        fetchData();
    }, [props.url]);


    return (
        <div className='Left-block Context'>
            <div className='Center-block Side-bar'>
                <input className='Search-bar' onInput={event => {
                    event.preventDefault();
                    // setSearchedUniv(univList.filter((univ) => univ[0].includes(event.target.value)
                    //     || Object.keys(univ[1]).some((program) => program.includes(event.target.value))));
                    setSearchedUniv(univList.filter((univ) => univ[0].toLowerCase().includes(
                        event.target.value.toLowerCase())));
                }} placeholder='search for...'/>
                <ul className="Univ-list">
                    {searched_univ.map((univ) => (
                        <UnivItem univ={univ} key={univ[0]}/>
                        )
                    )}
                </ul>
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
        <div className='Univ-block'>
            <li className='Univ-item' onClick={handleClick}>
                <div>
                    {props.univ[0]}
                </div>
                <div>
                    {isClicked ? <FontAwesomeIcon icon={solid("caret-down")}/> :
                        <FontAwesomeIcon icon={solid("caret-left")}/>}
                </div>
            </li>
            {showList ? <ProgramItem program={props.univ[1]}/> : null}
        </div>
    );
}


function ProgramItem({program}) {
    return (
        <ul className='Program-list'>
            {Object.entries(program).map((program) => (
                <li className='Program-item' key={program[0]}>
                    <div>
                        {program[0]}
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default SideBar;
