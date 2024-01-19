import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import {Form, Link} from "react-router-dom";
import "./SideBar.css";
import SearchBar from "./SearchBar/SearchBar";
import {useClickOutSideRef, useSmallPage} from "../common";
import {regionFlagMapping, univAbbrFullNameMapping} from "../../Data/Common";
import {Button, ButtonGroup, Collapse, Divider, Grid, List, ListItemButton, ListItemText, Paper} from "@mui/material";
import {Add, ExpandMore, NavigateNext, Refresh} from "@mui/icons-material";
export default function SideBar({loaderData}) {
    const univProgramList = loaderData.programs;
    const SideBarHidden = useSmallPage();
    const [SideBarOpen, setSideBarOpen, SideBarRef] = useClickOutSideRef();
    return (
        <div style={{display: "flex"}} ref={SideBarRef}>
            <Paper className={'SideBar ' + (SideBarHidden ? 'hidden ' : '') + (SideBarOpen ? 'open' : '')}>
                <SearchBar query={getQuery(loaderData)}/>
                <ButtonGroup fullWidth sx={{mb: "10px"}}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Button title='添加新项目' component={Link} to='/programs/new'>
                                <Add/>
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Form method='post'>
                                <Button type='submit' title='刷新项目列表'>
                                    <Refresh/>
                                </Button>
                            </Form>
                        </Grid>
                    </Grid>
                </ButtonGroup>

                <UnivProgramList univProgramList={univProgramList}/>
                <div style={{textAlign: 'center', paddingTop: '5px'}}>
                    对列表有问题可以<a href='https://github.com/OpenSIST/OpenSIST.github.io/issues'>联系我们</a>
                </div>
            </Paper>
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
    const flags = programList[0].Region.map((r) => regionFlagMapping[r]).reduce((prev, curr) => prev + ' ' + curr, '');
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