import { useTheme } from "@mui/material";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { grey } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { regionFlagMapping } from "../../Data/Schemas";

const ProgramCard = ({ program }) => {
    const darkMode = useTheme().palette.mode === "dark";

    const navigate = useNavigate();

    const flags = program.Region.map((r) => regionFlagMapping[r]).reduce(
        (prev, curr) => prev + " " + curr,
        ""
    );

    return (
        <Grid
            display="flex"
            alignItems="center"
            justifyContent="center"
            xs={60}
            sm={20}
            md={15}
            lg={12}
        >
            <Paper
                elevation={2}
                sx={{
                    position: "relative",
                    width: 278,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: darkMode ? grey[800] : grey[200],
                    borderRadius: "10px",
                    p: 1,
                }}
                onClick={() =>
                    navigate(
                        `/favorites/${program.ProgramID}${window.location.search}`
                    )
                }
            >
                <Typography
                    variant="h5"
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        position: "absolute",
                        top: 4,
                        right: 10,
                    }}
                >
                    {flags}
                </Typography>
                <Typography variant="h6" component="div" textAlign={"center"}>
                    {program.ProgramID}
                </Typography>
            </Paper>
        </Grid>
    );
};

export default ProgramCard;
