import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {Form, NavLink, useLoaderData, useNavigate, useNavigation} from "react-router-dom";
import "./SideBar.css";
import SearchBar from "./SearchBar/SearchBar";
import {ResponsiveButton, useClickOutSideRef, useSmallPage} from "../common";
import {regionFlagMapping} from "../../Data/Common";

export default function SideBar({twoLevelList}) {
    const SideBarHidden = useSmallPage();
    const [SideBarOpen, setSideBarOpen, SideBarRef] = useClickOutSideRef();

    return (
        <div style={{display: "flex"}} ref={SideBarRef}>
            <div className={'SideBar ' + (SideBarHidden ? 'hidden ' : '') + (SideBarOpen ? 'open' : '')}>
                <SearchBar/>
                <div className='AddRefreshButtonGroup'>
                    <Form action='/programs/new'>
                        <button title='add new program'>
                            <FontAwesomeIcon icon={solid('plus')}/>
                        </button>
                    </Form>
                    <Form method='post'>
                        <ResponsiveButton/>
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
                <div style={{textAlign: 'center', paddingTop: '5px'}}>
                    对列表有问题可以<a href='https://github.com/OpenSIST/OpenSIST.github.io/issues'>联系我们</a>
                </div>
            </div>
            <button
                className={'Button ShowUpButton ' + (SideBarHidden ? 'hidden ' : '') + (SideBarOpen ? 'open ' : '')}
                // hidden={!SideBarHidden}
                onClick={() => setSideBarOpen(!SideBarOpen)}
            >
                <FontAwesomeIcon icon={solid('bars')}/>
            </button>
        </div>
    )
}

function FirstLevelItem({firstLevel, secondLevelList}) {
    const [isFolded, setIsFolded] = React.useState(false);
    let flags = secondLevelList[0].Region.map((region) => regionFlagMapping[region]);
    flags = flags.reduce((prev, curr) => prev + ' ' + curr, '');
    return (
        <>
            <li
                className='FirstLevelItem'
                onClick={() => setIsFolded(!isFolded)}
            >
                {firstLevel} {flags}
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
    const { programs, u, d, m, r } = useLoaderData();
    const query = [{'key': 'u', 'value': u}, {'key': 'd', 'value': d}, {'key': 'm', 'value': m}, {'key': 'r', 'value': r}];
    const queryString = query.reduce(
        (accumulator, currentValue) => accumulator + (currentValue.value && currentValue.value !== '' ? `${currentValue.key}=${currentValue.value}&` : ''),
        '?',
    );
    return (
        <>
            <li className='SecondLevelItem'>
                <NavLink
                    to={`/programs/${secondLevel.ProgramID}${queryString.slice(0, queryString.length - 1)}`}
                    className={(({isActive, isPending}) =>
                        isActive ? "active" : isPending ? "pending" : "")}
                >
                    {secondLevel.Program}
                </NavLink>
            </li>
        </>
    )
}