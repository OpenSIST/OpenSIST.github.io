import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {Form, Link} from "react-router-dom";
import "./SideBar.css";
import SearchBar from "./SearchBar/SearchBar";
import {CountryFlag, useClickOutSideRef, useSmallPage} from "../common";
import {univAbbrFullNameMapping} from "../../Data/Common";
import {Button, ButtonGroup, Collapse, Divider, List, ListItemButton, ListItemText} from "@mui/material";
import {Add, ExpandMore, NavigateNext, Refresh} from "@mui/icons-material";

export default function SideBar({twoLevelList}) {
    const SideBarHidden = useSmallPage();
    const [SideBarOpen, setSideBarOpen, SideBarRef] = useClickOutSideRef();
    const [selectProgram, setSelectProgram] = React.useState(null);
    return (
        <div style={{display: "flex"}} ref={SideBarRef}>
            <div className={'SideBar ' + (SideBarHidden ? 'hidden ' : '') + (SideBarOpen ? 'open' : '')}>
                <SearchBar/>
                <ButtonGroup fullWidth sx={{mb: "10px"}}>
                    <Button fullWidth title='add new program' component={Link} to='/programs/new'>
                        <Add/>
                    </Button>
                    <Form method='post' style={{width: "100%"}}>
                        <Button type='submit' title='refresh program list'>
                            <Refresh/>
                        </Button>
                    </Form>
                </ButtonGroup>
                <List
                    component='nav'
                    sx={{
                        width: '100%',
                        bgcolor: 'background.paper',
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        borderRadius: "5px",
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 500px)',
                    }}
                >
                    {Object.entries(twoLevelList).map(([firstLevel, secondLevelList]) => (
                        <React.Fragment key={firstLevel}>
                            <NestedList
                                firstLevel={firstLevel}
                                secondLevelList={secondLevelList}
                                selectProgram={selectProgram}
                                setSelectProgram={setSelectProgram}
                            />
                        </React.Fragment>
                    ))}
                </List>
                <div style={{textAlign: 'center', paddingTop: '5px'}}>
                    对列表有问题可以<a href='https://github.com/OpenSIST/OpenSIST.github.io/issues'>联系我们</a>
                </div>
            </div>
            <button
                className={'Button ShowUpButton ' + (SideBarHidden ? 'hidden ' : '') + (SideBarOpen ? 'open ' : '')}
                onClick={() => setSideBarOpen(!SideBarOpen)}
            >
                <FontAwesomeIcon icon={solid('bars')}/>
            </button>
        </div>
    )
}

function NestedList({firstLevel, secondLevelList, selectProgram, setSelectProgram}) {
    const [isFolded, setIsFolded] = React.useState(false);
    const flags = secondLevelList[0].Region.map((r) => (<CountryFlag key={r} country={r}/>))
    return (
        <>
            <ListItemButton onClick={() => setIsFolded(!isFolded)}>
                {isFolded ? <ExpandMore/> : <NavigateNext/>}
                <ListItemText primary={firstLevel} secondary={univAbbrFullNameMapping[firstLevel]}/>
                {flags}
            </ListItemButton>
            <Divider component="li" light />
            <Collapse in={isFolded} timeout='auto' unmountOnExit>
                <List component="div" disablePadding>
                    {
                        secondLevelList.map((secondLevel) => (
                            <React.Fragment key={secondLevel.ProgramID}>
                                <ListItemButton
                                    className='SecondLevelItem'
                                    selected={secondLevel.ProgramID === selectProgram}
                                    component={Link}
                                    onClick={() => setSelectProgram(secondLevel.ProgramID)}
                                    to={`/programs/${secondLevel.ProgramID}${window.location.search}`}
                                    sx={{pl: "3rem"}}
                                >
                                    <ListItemText primary={secondLevel.Program} secondary={MajorString(secondLevel.TargetApplicantMajor)}/>
                                </ListItemButton>
                            </React.Fragment>
                        ))
                    }
                </List>
            </Collapse>
        </>
    )
}

function MajorString(majorList) {
    const major_string = majorList.reduce((prev, curr) => prev + '/' + curr, '');
    return major_string.slice(1);
}