import { ThemeProvider, createTheme, useTheme } from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { grey } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { regionFlagMapping } from "../../Data/Schemas";
import { univAbbrFullNameMapping } from "../../Data/Common";

const ProgramCard = ({ program }) => {
    const darkMode = useTheme().palette.mode === "dark";

    const navigate = useNavigate();

    const flags = program.Region.map((r) => regionFlagMapping[r]).reduce(
        (prev, curr) => prev + " " + curr,
        ""
    );

    const breakpointsTheme = (theme) => createTheme({
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

// TODO: --------------- remove this -----------------
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
// ---------------------------------------------------

    return (<ThemeProvider theme={breakpointsTheme}>
        <Grid
            display="flex"
            alignItems="center"
            justifyContent="center"
            xs={60}
            sm={30}
            md={20}
            lg={15}
            xl={12}
        >
            <Card
                sx={{
                    position: "relative",
                    width: 274,
                    height: 154,
                    backgroundColor: darkMode ? grey[800] : grey[200],
                    color: darkMode ? grey[200] : grey[900],
                    borderRadius: "10px",
                    borderLeft: `20px solid ${color}`,  // TODO: change this
                    boxShadow: `0px 2px 4px ${color}80`,  // TODO: change this
                    "&:hover": {
                        cursor: "pointer",
                        transition: "all 0.1s linear",
                        backgroundColor: darkMode ? grey[700] : grey[300],
                    },
                    transition: "all 0.1s linear",
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
                <Typography className="programcardtext abbruni" component="div">
                    {program.University}
                </Typography>
                <Typography className="programcardtext fulluni" component="div" sx={
                    { color: darkMode ? grey[400] : grey[700], }
                }>
                    {univAbbrFullNameMapping[program.University]}
                </Typography>
                <Typography className="programcardtext program" component="div">
                    {program.Program}
                </Typography>
            </Card>
        </Grid>
    </ThemeProvider>);
};

export default ProgramCard;