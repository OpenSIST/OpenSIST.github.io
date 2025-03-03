import { StarRounded, StarBorderRounded } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { Form } from "react-router-dom";

const StarButton = ({programID, metaData}) => {
    const theme = useTheme()
    const darkMode = theme.palette.mode === "dark"
    const starred = metaData.ProgramCollection && metaData.ProgramCollection.includes(programID)
    const color = darkMode ? "#ff9f0a" : "#ff9500"

    return <Form method='post' style={{display: 'flex'}}>
        <Tooltip title={starred ? "取消收藏该项目" : "收藏该项目"} arrow>
            <IconButton type="submit" name="ActionType" value={starred ? "UnStar" : "Star"}>
                {starred ? <StarRounded style= {{color: color}}/> : <StarBorderRounded/>}
            </IconButton>
        </Tooltip>
    </Form>
}

export default StarButton