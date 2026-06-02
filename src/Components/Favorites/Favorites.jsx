import {Container, createTheme, ThemeProvider, Typography} from "@mui/material";
import Grid from "@mui/material/Grid";
import {Outlet, useLoaderData} from "react-router-dom";
import {getMetadata} from "../../Data/UserData";
import {loader as ProgramPageLoader} from "../ProgramPage/ProgramPage";
import SearchBar from "../ProgramPage/SideBar/SearchBar/SearchBar";
import {getQuery} from "../ProgramPage/SideBar/SideBar";
import ProgramCard from "./ProgramCard";
import "./Favorites.css";
import capoobeat from "../../Assets/images/Favorites/capoobeat.gif";

const favoritesTheme = (theme) => createTheme({
    ...theme,
    breakpoints: {
        values: {
            xs: 0,
            sm: 580,
            md: 900,
            lg: 1100,
            xl: 1436,
        },
    },
});

function filterProgramsById(programs, programIDs) {
    const filtered = {};
    for (const university in programs) {
        const filteredPrograms = programs[university].filter((program) =>
            programIDs.includes(program.ProgramID),
        );
        if (filteredPrograms.length > 0) {
            filtered[university] = filteredPrograms;
        }
    }
    return filtered;
}

function flattenPrograms(programs) {
    const flattened = [];
    for (const university in programs) {
        flattened.push(...programs[university]);
    }
    return flattened;
}

export async function loader({request}) {
    const metadata = await getMetadata();
    const programPageData = await ProgramPageLoader({request});
    programPageData.programs = filterProgramsById(
        programPageData.programs,
        metadata.ProgramCollection ?? [],
    );
    return {programPageData};
}

export default function Favorites() {
    const {programPageData} = useLoaderData();

    const noPrograms = Object.keys(programPageData.programs).length === 0;

    return (
        <Container maxWidth={"xl"}>
            <Container maxWidth={"lg"} sx={{mt: 1.5}}>
                <SearchBar query={getQuery(programPageData)} pageName="favorites"/>
            </Container>
            {noPrograms ? (
                <Container
                    sx={{
                        height: "100%",
                        maxHeight: "calc(100vh - 150px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "20px",
                        p: 0,
                    }}
                >
                    <Typography variant="h4" component="div" textAlign="center">
                        No programs to display.
                    </Typography>
                    <img src={capoobeat} height="150px" alt="No programs saved"/>
                </Container>
            ) : (
                <ThemeProvider theme={favoritesTheme}>
                    <Grid
                        container
                        spacing={2}
                        columns={60}
                        maxHeight={"calc(100vh - 150px)"}
                        sx={{my: 2, overflowY: "auto"}}
                    >
                        {flattenPrograms(programPageData.programs).map((program) => (
                            <ProgramCard key={program.ProgramID} program={program}/>
                        ))}
                    </Grid>
                </ThemeProvider>
            )}
            <Outlet></Outlet>
        </Container>
    );
}
