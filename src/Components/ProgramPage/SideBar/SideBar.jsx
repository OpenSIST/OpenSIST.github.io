import React, {useState} from "react";
import {Form, Link} from "react-router-dom";
import "./SideBar.css";
import SearchBar from "./SearchBar/SearchBar";
import {useSmallPage} from "../../common";
import {regionFlagMapping, univAbbrFullNameMapping} from "../../../Data/Common";
import {
    Box,
    Button,
    Collapse,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Paper, SwipeableDrawer, Tooltip,
    useTheme
} from "@mui/material";
import {Add, ChevronRight, ExpandMore, NavigateNext, Refresh} from "@mui/icons-material";
import {blue, grey} from "@mui/material/colors";

export default function SideBar({loaderData}) {
    const univProgramList = loaderData.programs;
    const smallPage = useSmallPage();
    const [open, setOpen] = useState(false)
    return (
        <>
            <SwipeableDrawer
                variant={smallPage ? "temporary" : "persistent"}
                open={!smallPage || (smallPage && open)}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                elevation={1}
                sx={{
                    display: "flex",
                    width: 'auto',
                    height: 'auto',
                    [`& .MuiDrawer-paper`]: {
                        border: 'none',
                        position: (smallPage ? 'absolute' : 'initial'),
                        top: '60px',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? grey[900] : grey[50],
                        width: "250px",
                        height: "calc(100vh - 160px)",
                        ml: (smallPage ? '0' : '2vw'),
                        mt: '10px',
                        p: '20px',
                        borderRadius: '5px',
                        overflowY: 'auto',
                        boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);"
                    },
                }}
            >
                <SearchBar query={getQuery(loaderData)}/>
                <Box sx={{mb: "10px", display: 'flex', gap: "10px"}}>
                    <Form action='/programs/new' style={{width: "100%"}}>
                        <Tooltip title='添加新项目'>
                            <Button fullWidth type='submit' variant="outlined">
                                <Add/>
                            </Button>
                        </Tooltip>
                    </Form>
                    <Form method='post' style={{width: "100%"}}>
                        <Tooltip title='刷新项目列表'>
                            <Button fullWidth type='submit' variant="outlined">
                                <Refresh/>
                            </Button>
                        </Tooltip>
                    </Form>
                </Box>

                <UnivProgramList univProgramList={univProgramList}/>
                <div style={{textAlign: 'center', paddingTop: '5px'}}>
                    对列表有问题可以<a href='https://github.com/OpenSIST/OpenSIST.github.io/issues'>联系我们</a>
                </div>
            </SwipeableDrawer>
            <Button
                className="ShowUpButton"
                variant="contained"
                onClick={() => setOpen(!open)}
                sx={{
                    position: 'absolute',
                    visibility: smallPage ? 'visible' : 'hidden',
                    minWidth: "0",
                    px: "1vw",
                    width: "20px",
                    height: "80px",
                    borderRadius: "0 10px 10px 0",
                }}
            >
                <ChevronRight/>
            </Button>
        </>
    )
}

export function UnivProgramList({univProgramList, ButtonComponent = ProgramButton}) {
    const [selectProgram, setSelectProgram] = React.useState(null);
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <Paper
            variant={darkMode ? 'elevation' : 'elevation'}
            elevation={darkMode ? 0 : 1}
            sx={{
                bgcolor: darkMode ? grey[800] : grey[50],
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