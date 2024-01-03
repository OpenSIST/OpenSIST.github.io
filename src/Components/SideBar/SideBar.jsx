import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {Form, NavLink, useLoaderData, useNavigate, useNavigation} from "react-router-dom";
import "./SideBar.css";
import SearchBar from "./SearchBar/SearchBar";

export default function SideBar({twoLevelList}) {
    const navigation = useNavigation();
    const loading =
        navigation.state !== 'idle'
        && navigation.formData != null
        && navigation.formAction === navigation.location?.pathname;

    return (
        <div className='SideBar'>
            <SearchBar/>
            <div className='AddRefreshButtonGroup'>
                <Form action='/programs/new'>
                    <button
                        className='Button'>
                        <FontAwesomeIcon icon={solid('plus')}/>
                    </button>
                </Form>
                <Form method='post'>
                    <button
                        type='submit'
                        title='Refresh'
                        className='Button'
                    >
                        <FontAwesomeIcon
                            icon={solid("arrows-rotate")} spin={loading}
                        />
                    </button>
                </Form>
            </div>
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