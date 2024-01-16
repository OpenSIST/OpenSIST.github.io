import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {Form, NavLink, Link, useLoaderData} from "react-router-dom";
import "./SideBar.css";
import SearchBar from "./SearchBar/SearchBar";
import {useClickOutSideRef, useSmallPage} from "../common";
import {regionFlagMapping} from "../../Data/Common";
import {Button, ButtonGroup} from "@mui/material";
import {Add, Refresh} from "@mui/icons-material";

export default function SideBar({twoLevelList}) {
    const SideBarHidden = useSmallPage();
    const [SideBarOpen, setSideBarOpen, SideBarRef] = useClickOutSideRef();

    return (
        <div style={{display: "flex"}} ref={SideBarRef}>
            <div className={'SideBar ' + (SideBarHidden ? 'hidden ' : '') + (SideBarOpen ? 'open' : '')}>
                <SearchBar/>
                <ButtonGroup variant='contained'>
                    <Button title='add new program' component={Link} to='/programs/new'>
                        <Add/>
                    </Button>
                    <Form method='post'>
                        <Button type='submit' title='refresh program list'>
                            <Refresh/>
                        </Button>
                    </Form>
                </ButtonGroup>
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
    return (
        <>
            <li className='SecondLevelItem'>
                <NavLink
                    to={`/programs/${secondLevel.ProgramID}${window.location.search}`}
                    className={(({isActive, isPending}) =>
                        isActive ? "active" : isPending ? "pending" : "")}
                >
                    {secondLevel.Program}
                </NavLink>
            </li>
        </>
    )
}