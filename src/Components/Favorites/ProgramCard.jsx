import {Box, Chip, IconButton, Paper, Tooltip, Typography} from "@mui/material";
import {BookmarkRemoveOutlined} from "@mui/icons-material";
import {Form, useNavigate} from "react-router-dom";
import {regionFlagMapping} from "../../Data/Schemas";
import {univAbbrFullNameMapping} from "../../Data/Common";
import {favoritesProgramPath} from "../RouteUtils";

const ProgramCard = ({program}) => {
    const navigate = useNavigate();

    const flags = (program.Region ?? []).map((r) => regionFlagMapping[r]).join(" ");
    const majors = program.TargetApplicantMajor ?? [];

    return (
        <Paper
            elevation={0}
            onClick={() =>
                navigate(`${favoritesProgramPath(program.ProgramID)}${window.location.search}`)
            }
            sx={{
                position: "relative",
                cursor: "pointer",
                borderRadius: 1,
                p: 2,
                minHeight: 150,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                bgcolor: (theme) => theme.palette.surfaceVariant,
                border: "1px solid transparent",
                transition: "border-color 0.15s ease",
                "&:hover": {borderColor: "primary.main"},
            }}
        >
            <Box sx={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1}}>
                <Box sx={{minWidth: 0}}>
                    <Typography variant="h6" sx={{fontWeight: 700, lineHeight: 1.2}}>
                        {program.University}
                    </Typography>
                    <Typography variant="caption" sx={{color: "text.secondary"}} noWrap component="div">
                        {univAbbrFullNameMapping[program.University]}
                    </Typography>
                </Box>
                <Box sx={{display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0}}>
                    {flags ? <Typography variant="body2">{flags}</Typography> : null}
                    <Form method="post">
                        <input type="hidden" name="ActionType" value="UnStar"/>
                        <input type="hidden" name="ProgramID" value={program.ProgramID}/>
                        <Tooltip title="取消收藏" arrow>
                            <IconButton
                                type="submit"
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                                sx={{color: "text.secondary", "&:hover": {color: "primary.main"}}}
                            >
                                <BookmarkRemoveOutlined fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </Form>
                </Box>
            </Box>

            <Typography sx={{fontWeight: 600, mt: 0.5}}>{program.Program}</Typography>

            <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5, mt: "auto", pt: 1}}>
                {program.Degree ? (
                    <Chip
                        size="small"
                        label={program.Degree}
                        sx={{bgcolor: (theme) => theme.palette.surface, color: "primary.main", fontWeight: 600}}
                    />
                ) : null}
                {majors.map((m) => (
                    <Chip
                        key={m}
                        size="small"
                        label={m}
                        sx={{bgcolor: (theme) => theme.palette.surface, color: "primary.main"}}
                    />
                ))}
            </Box>
        </Paper>
    );
};

export default ProgramCard;
