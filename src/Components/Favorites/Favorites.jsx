import { Container } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { Outlet, useLoaderData } from "react-router-dom";
import { getMetaData } from "../../Data/UserData";
import { loader as ProgramPageLoader } from "../ProgramPage/ProgramPage";
import SearchBar from "../ProgramPage/SideBar/SearchBar/SearchBar";
import { getQuery } from "../ProgramPage/SideBar/SideBar";
import ProgramCard from "./ProgramCard";
import "./Favorites.css"

function filterProgramsById(programs, programIDs) {
    let filtered = {};
    for (const university in programs) {
        const filteredPrograms = programs[university].filter((program) =>
            programIDs.includes(program.ProgramID)
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
        metaData.ProgramCollection || []
    );
    return { programPageData };
}

export default function Favorites() {
    let { programPageData } = useLoaderData();

    return (
        <Container maxWidth={"xl"} sx={{ flexDirection: "row" }}>
            <Container maxWidth={"lg"} sx={{ mt: 2 }}>
                <SearchBar
                    query={getQuery(programPageData)}
                    pageName="favorites"
                />
            </Container>
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
            <Outlet></Outlet>
        </Container>
    );
}
