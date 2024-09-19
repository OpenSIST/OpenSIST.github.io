import { Container, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { Outlet, useLoaderData } from "react-router-dom";
import { getMetaData } from "../../Data/UserData";
import { loader as ProgramPageLoader } from "../ProgramPage/ProgramPage";
import SearchBar from "../ProgramPage/SideBar/SearchBar/SearchBar";
import { getQuery } from "../ProgramPage/SideBar/SideBar";
import ProgramCard from "./ProgramCard";
import "./Favorites.css";
import capoobeat from "../../Assets/images/Favorites/capoobeat.gif";
import capoonife from "../../Assets/images/Favorites/capoonife.gif";
import capoosigh from "../../Assets/images/Favorites/capoosigh.gif";

function filterProgramsById(programs, programIDs) {
    let filtered = {};
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
    let flattened = [];
    for (const university in programs) {
        flattened.push(...programs[university]);
    }
    return flattened;
}

export async function loader({ request }) {
    const metaData = await getMetaData();
    const programPageData = await ProgramPageLoader({ request });
    programPageData.programs = filterProgramsById(
        programPageData.programs,
        metaData.ProgramCollection ?? [],
    );
    return { programPageData };
}

export default function Favorites() {
    let { programPageData } = useLoaderData();

    const noPrograms = Object.keys(programPageData.programs).length === 0;

    const noProgramImgs = [capoobeat, capoosigh, capoonife]
    const noProgramImg = noProgramImgs[Math.floor(Math.random() * noProgramImgs.length)]

    return (
        <Container maxWidth={"xl"}>
            <Container maxWidth={"lg"} sx={{ mt: 1.5 }}>
                <SearchBar query={getQuery(programPageData)} pageName="favorites" />
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
                    <img src={noProgramImg} height="150px" alt="capoo" />
                </Container>
            ) : (
                <Grid
                    container
                    spacing={2}
                    columns={60}
                    maxHeight={"calc(100vh - 150px)"}
                    sx={{ my: 2, overflowY: "auto" }}
                >
                    {flattenPrograms(programPageData.programs).map((program) => (
                        <ProgramCard key={program.ProgramID} program={program} />
                    ))}
                </Grid>
            )}
            <Outlet></Outlet>
        </Container>
    );
}