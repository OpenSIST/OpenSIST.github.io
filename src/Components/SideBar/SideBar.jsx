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
export default function SideBar({loaderData}) {
    const univProgramList = loaderData.programs;
    const SideBarHidden = useSmallPage();
    const [SideBarOpen, setSideBarOpen, SideBarRef] = useClickOutSideRef();
    return (
        <div style={{display: "flex"}} ref={SideBarRef}>
            <div className={'SideBar ' + (SideBarHidden ? 'hidden ' : '') + (SideBarOpen ? 'open' : '')}>
                <SearchBar query={getQuery(loaderData)}/>
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
                <UnivProgramList univProgramList={univProgramList}/>
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

export function UnivProgramList({univProgramList, ButtonComponent=ProgramButton}) {
    const [selectProgram, setSelectProgram] = React.useState(null);
    return (
        <>
            <List
                component='nav'
                sx={{
                    width: '100%',
                    bgcolor: 'background.paper',
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    borderRadius: "5px",
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 460px)',
                }}
            >
                {Object.entries(univProgramList).map((univProgram) => (
                    <React.Fragment key={univProgram[0]}>
                        <ProgramList
                            univProgram={univProgram}
                            selectProgram={selectProgram}
                            setSelectProgram={setSelectProgram}
                            ButtonComponent={ButtonComponent}
                        />
                    </React.Fragment>
                ))}
            </List>
        </>
    )
}

export function ProgramList({univProgram, selectProgram, setSelectProgram, ButtonComponent}) {
    const [isFolded, setIsFolded] = React.useState(false);
    const univName = univProgram[0];
    const programList = univProgram[1];
    const flags = programList[0].Region.map((r) => (<CountryFlag key={r} country={r}/>))
    return (
        <>
            <ListItemButton onClick={() => setIsFolded(!isFolded)}>
                {isFolded ? <ExpandMore/> : <NavigateNext/>}
                <ListItemText primary={univName} secondary={univAbbrFullNameMapping[univName]}/>
                {flags}
            </ListItemButton>
            <Divider component="li" light/>
            <Collapse in={isFolded} timeout='auto' unmountOnExit>
                <List component="div" disablePadding>
                    {
                        programList.map((program) => (
                            <ButtonComponent
                                program={program}
                                selectProgram={selectProgram}
                                setSelectProgram={setSelectProgram}
                                key={program.ProgramID}
                            />
                        ))
                    }
                </List>
            </Collapse>
        </>
    )
}

export function ProgramButton({program, selectProgram, setSelectProgram}) {
    return (
        <ListItemButton
            className='ProgramItem'
            selected={program.ProgramID === selectProgram}
            component={Link}
            onClick={() => setSelectProgram(program.ProgramID)}
            to={`/programs/${program.ProgramID}${window.location.search}`}
            sx={{pl: "3rem"}}
            key={program.ProgramID}
        >
            <ListItemText primary={program.Program}
                          secondary={program.TargetApplicantMajor.join('/')}/>
        </ListItemButton>
    )
}

export function getQuery(loaderData) {
    return {
        u: loaderData.u,
        d: loaderData.d,
        m: loaderData.m,
        r: loaderData.r
    }
}