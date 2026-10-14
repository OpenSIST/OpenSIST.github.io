import {Box, Typography} from "@mui/material";
import {Outlet, redirect, useLoaderData} from "react-router-dom";
import {getMetadata, uncollectProgram} from "../../Data/UserData";
import {loader as ProgramPageLoader} from "../ProgramPage/ProgramPage";
import SearchBar from "../ProgramPage/SideBar/SearchBar/SearchBar";
import {getQuery} from "../ProgramPage/SideBar/SideBar";
import ProgramCard from "./ProgramCard";
import "./Favorites.css";
import capoobeat from "../../Assets/images/Favorites/capoobeat.gif";

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

export async function action({request}) {
    const formData = await request.formData();
    const actionType = formData.get("ActionType");
    const programId = formData.get("ProgramID");
    if (actionType === "UnStar") {
        await uncollectProgram(programId);
    }
    return redirect(request.url);
}

export default function Favorites() {
    const {programPageData} = useLoaderData();
    const programs = flattenPrograms(programPageData.programs);
    const noPrograms = programs.length === 0;

    return (
        <Box sx={{flexGrow: 1, width: "100%", minWidth: 0, height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", px: {xs: 2, sm: 3, md: 4}, py: 2}}>
            <Box sx={{display: "flex", alignItems: "baseline", gap: 1.5, mb: 2}}>
                <Typography variant="h5" sx={{fontWeight: 700}}>我的收藏</Typography>
                {!noPrograms ? (
                    <Typography variant="body2" sx={{color: "text.secondary"}}>
                        {programs.length} 个项目
                    </Typography>
                ) : null}
            </Box>

            <Box sx={{mb: 2, maxWidth: 720}}>
                <SearchBar query={getQuery(programPageData)} pageName="favorites"/>
            </Box>

            {noPrograms ? (
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        color: "text.secondary",
                    }}
                >
                    <img src={capoobeat} height="140px" alt="还没有收藏"/>
                    <Typography variant="h6" sx={{fontWeight: 600, color: "text.primary"}}>
                        还没有收藏任何项目
                    </Typography>
                    <Typography variant="body2" sx={{textAlign: "center", maxWidth: 360}}>
                        在「项目信息表」中打开任意项目，点击右上角的收藏按钮，即可把它添加到这里。
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 2,
                        alignContent: "start",
                        pb: 2,
                    }}
                >
                    {programs.map((program) => (
                        <ProgramCard key={program.ProgramID} program={program}/>
                    ))}
                </Box>
            )}
            <Outlet/>
        </Box>
    );
}
