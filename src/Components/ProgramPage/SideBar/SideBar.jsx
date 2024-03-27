import React from "react";
import {Form, Link} from "react-router-dom";
import "./SideBar.css";
import SearchBar from "./SearchBar/SearchBar";
import {univAbbrFullNameMapping} from "../../../Data/Common";
import {
    Button,
    Collapse,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Paper, Tooltip, Typography,
    useTheme
} from "@mui/material";
import {Add, ExpandMore, NavigateNext, Refresh} from "@mui/icons-material";
import {blue, grey} from "@mui/material/colors";
import {CollapseSideBar} from "../../common";
import {regionFlagMapping} from "../../../Data/Schemas";
import Grid2 from "@mui/material/Unstable_Grid2";

export default function SideBar({loaderData}) {
    const univProgramList = loaderData.programs;
    return (
        <>
            <CollapseSideBar
                sx={{
                    '& .MuiDrawer-paper': {
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[900] : grey[50],
                        width: '250px',
                        height: 'calc(100vh - 120px)',
                        p: '20px',
                        mt: '10px',
                        gap: '10px',
                    }
                }}
            >
                <SearchBar query={getQuery(loaderData)} pageName='program'/>
                <Grid2 columnSpacing={1} container sx={{width: '100%'}}>
                    <Grid2 xs={9}>
                        <Form action='/programs/new' style={{width: "100%"}}>
                            <Tooltip title='添加新项目' arrow>
                                <Button fullWidth type='submit' variant="outlined"
                                        sx={{
                                            transition: 'background-color 0s',
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[800] : '#fff',
                                        }}
                                >
                                    <Add/>
                                </Button>
                            </Tooltip>
                        </Form>
                    </Grid2>
                    <Grid2 xs={3}>
                        <Form method='post' style={{width: "100%"}}>
                            <Tooltip title='刷新项目列表' arrow>
                                <Button fullWidth type='submit' variant="outlined"
                                        sx={{
                                            transition: 'background-color 0s',
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[800] : '#fff',
                                        }}
                                >
                                    <Refresh/>
                                </Button>
                            </Tooltip>
                        </Form>
                    </Grid2>
                </Grid2>
                <UnivProgramList univProgramList={univProgramList}/>
            </CollapseSideBar>
        </>
    )
}

export function UnivProgramList({univProgramList, ButtonComponent = ProgramButton}) {
    const [selectProgram, setSelectProgram] = React.useState(null);
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <Paper
            variant='elevation'
            elevation={darkMode ? 0 : 1}
            sx={{
                bgcolor: darkMode ? grey[800] : '#fff',
                height: "100%",
                overflowY: "auto"
            }}
        >
            <List
                component='nav'
                className="UnivProgramList"
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
        </Paper>
    )
}

export function ProgramList({univProgram, selectProgram, setSelectProgram, ButtonComponent}) {
    const [isFolded, setIsFolded] = React.useState(false);
    const univName = univProgram[0];
    const programList = univProgram[1];
    const flags = programList[0].Region.map((r) => regionFlagMapping[r]).reduce((prev, curr) => prev + ' ' + curr, '');
    return (
        <>
            <ListItemButton
                onClick={() => setIsFolded(!isFolded)}
            >
                {isFolded ? <ExpandMore/> : <NavigateNext/>}
                <ListItemText primary={univName} secondary={
                    <Typography variant='subtitle1' sx={{fontSize: 'clamp(11px, 1.5vw, 13px)'}}>
                        {univAbbrFullNameMapping[univName]}
                </Typography>
                }/>
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
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <ListItemButton
            className='ProgramItem'
            selected={program.ProgramID === selectProgram}
            component={Link}
            onClick={() => setSelectProgram(program.ProgramID)}
            to={`/programs/${program.ProgramID}${window.location.search}`}
            sx={{
                pl: "3rem",
                "&::before": {
                    background: darkMode ? grey[700] : grey[300],
                },
                "&.Mui-selected": {
                    "&::before": {
                        background: darkMode ? blue[800] : blue[300],
                    }
                }
            }}
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