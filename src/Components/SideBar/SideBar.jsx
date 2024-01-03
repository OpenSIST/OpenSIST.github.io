import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {Form, NavLink, useNavigate} from "react-router-dom";
import "./SideBar.css";
import {getPrograms} from "../../Data/ProgramData";

// export async function action() {
//     return getPrograms(true);
// }

export default function SideBar({twoLevelList}) {
    const navigate = useNavigate()
    return (
        <div className='SideBar'>
            <button onClick={() => navigate('/programs/new')} className='Button'>
                <FontAwesomeIcon icon={solid('plus')}/>
            </button>
            <Form method='post'>
                <button type='submit' title='Refresh' className='Button'><FontAwesomeIcon
                    icon={solid("arrows-rotate")}/></button>
            </Form>
            <ul className='FirstLevelList'>
                {
                    Object.entries(twoLevelList).map(([firstLevel, secondLevelList]) => (
                        <React.Fragment key={firstLevel}>
                            <FirstLevelItem
                                firstLevel={firstLevel}
                                secondLevelList={secondLevelList}
                            />
                        </React.Fragment>
                    ))
                }
            </ul>
        </div>
    )
}

function FirstLevelItem({firstLevel, secondLevelList}) {
    const [isFolded, setIsFolded] = React.useState(false);
    return (
        <>
            <li
                className='FirstLevelItem'
                onClick={() => setIsFolded(!isFolded)}
            >
                {firstLevel}
                <FontAwesomeIcon
                    icon={solid('caret-right')}
                    rotation={isFolded ? 90 : 0}
                />
            </li>
            {isFolded ? secondLevelList.map((secondLevel) => (
                <React.Fragment key={secondLevel.ProgramID}>
                    <SecondLevelItem secondLevel={secondLevel}/>
                </React.Fragment>
            )) : null}
        </>
    )
}

function SecondLevelItem({secondLevel}) {
    return (
        <>
            <li className='SecondLevelItem'>
                <NavLink
                    to={`/programs/${secondLevel.ProgramID}`}
                    className={(({isActive, isPending}) =>
                        isActive ? "active" : isPending ? "pending" : "")}
                >
                    {secondLevel.Program}
                </NavLink>
            </li>
        </>
    )
}