import React from "react";
import {Form, Link} from "react-router-dom";
import "./SideBar.css";
import SearchBar from "./SearchBar/SearchBar";
import {univAbbrFullNameMapping} from "../../../Data/Common";
import {Box, Collapse, Divider, IconButton, List, ListItemButton, ListItemText, Paper, Tooltip, Typography, useTheme} from "@mui/material";
import {Add, ExpandMore, NavigateNext, Refresh} from "@mui/icons-material";
import {grey} from "@mui/material/colors";
import {CollapseSideBar} from "../../common";
import {regionFlagMapping} from "../../../Data/Schemas";
import StarButton from "../ProgramContent/StarButton";
import {programsProgramPath} from "../../RouteUtils";
import univList from "../../../Data/UnivList.json";

const MetadataContext = React.createContext();
const univRegionMapping = univList.reduce((acc, univ) => {
    acc[univ.abbr] = univ.region;
    return acc;
}, {});

export default function SideBar({loaderData}) {
    const univProgramList = loaderData.programs;
    return (
        <MetadataContext.Provider value={loaderData.metadata}>
            <CollapseSideBar
                sx={{
                    '& .MuiDrawer-paper': {
                        bgcolor: (theme) => theme.palette.surface,
                        width: '250px',
                        height: 'calc(100vh - 120px)',
                        p: '20px',
                        mt: '10px',
                        gap: '10px',
                    }
                }}
            >
                <SearchBar query={getQuery(loaderData)} pageName='program'/>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '2px'}}>
                    <Typography variant='caption' sx={{color: 'text.secondary', fontWeight: 600, letterSpacing: '0.04em'}}>
                        学校列表
                    </Typography>
                    <Box sx={{display: 'flex', gap: '2px'}}>
                        <Form action='/programs/new'>
                            <Tooltip title='添加新项目' arrow>
                                <IconButton type='submit' size='small' sx={{color: 'text.secondary'}}>
                                    <Add fontSize='small'/>
                                </IconButton>
                            </Tooltip>
                        </Form>
                        <Form method='post'>
                            <Tooltip title='刷新项目列表' arrow>
                                <IconButton type='submit' size='small' sx={{color: 'text.secondary'}}>
                                    <Refresh fontSize='small'/>
                                </IconButton>
                            </Tooltip>
                        </Form>
                    </Box>
                </Box>
                <UnivProgramList univProgramList={univProgramList}/>
            </CollapseSideBar>
        </MetadataContext.Provider>
    );
}

export function UnivProgramList({univProgramList, ButtonComponent = ProgramButton}) {
    const [selectProgram, setSelectProgram] = React.useState(null);
    return (
        <Paper
            variant='elevation'
            elevation={0}
            sx={{
                bgcolor: (theme) => theme.palette.surfaceVariant,
                height: "100%",
                overflowY: "auto"
            }}
        >
            <List
                component='nav'
                className="UnivProgramList"
            >
                {Object.entries(univProgramList).map((univProgram) => (
                    <React.Fragment key={`${univProgram[0]}-${univProgram[1].length === 0 ? 'empty' : 'programs'}`}>
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
    const univName = univProgram[0];
    const programList = univProgram[1];
    const hasPrograms = programList.length > 0;
    const [isFolded, setIsFolded] = React.useState(!hasPrograms);
    const region = programList[0]?.Region ?? univRegionMapping[univName] ?? [];
    const flags = region.map((r) => regionFlagMapping[r]).filter(Boolean).join(' ');
    return (
        <>
            <ListItemButton
                onClick={() => setIsFolded(!isFolded)}
            >
                {isFolded ? <ExpandMore fontSize="0.9em"/> : <NavigateNext fontSize="0.9em"/>}
                <ListItemText
                    primary={
                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                            <Typography>{univName}</Typography>
                            <Typography>{flags}</Typography>
                        </Box>
                    }
                    secondary={
                        <Typography variant='subtitle1' sx={{fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'text.secondary'}}>
                            {univAbbrFullNameMapping[univName]}
                        </Typography>
                    }/>

            </ListItemButton>
            <Divider component="li" light/>
            <Collapse in={isFolded} timeout='auto' unmountOnExit>
                <List component="div" disablePadding>
                    {
                        hasPrograms ? programList.map((program) => (
                            <ButtonComponent
                                program={program}
                                selectProgram={selectProgram}
                                setSelectProgram={setSelectProgram}
                                key={program.ProgramID}
                            />
                        )) : <EmptyProgramButton univName={univName}/>
                    }
                </List>
            </Collapse>
        </>
    )
}

function EmptyProgramButton({univName}) {
    return (
        <ListItemButton
            component={Link}
            to="/programs/new"
            state={{university: univName}}
            sx={{pl: "2rem", gap: 1}}
        >
            <Add fontSize="small"/>
            <ListItemText primary="暂无项目记录"
                          secondary="点击添加"/>
        </ListItemButton>
    );
}

export function ProgramButton({program, selectProgram, setSelectProgram}) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    const metadata = React.useContext(MetadataContext);
    return (
        <ListItemButton
            className='ProgramItem'
            selected={program.ProgramID === selectProgram}
            component={Link}
            onClick={() => setSelectProgram(program.ProgramID)}
            to={`${programsProgramPath(program.ProgramID)}${window.location.search}`}
            sx={{
                pl: "3rem",
                "&::before": {
                    background: darkMode ? grey[700] : grey[300],
                },
                "&.Mui-selected": {
                    "&::before": {
                        background: (theme) => theme.palette.primary.main,
                    }
                }
            }}
            key={program.ProgramID}
        >
            <ListItemText primary={program.Program}
                          secondary={program.TargetApplicantMajor.join('/')}/>
            <StarButton programID={program.ProgramID} metadata={metadata}/>
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
