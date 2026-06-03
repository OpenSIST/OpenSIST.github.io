import {StarBorderRounded, StarRounded} from "@mui/icons-material";
import {IconButton, Input, Tooltip, useTheme} from "@mui/material";
import {Form} from "react-router-dom";

const StarButton = ({programID, metadata}) => {
    const theme = useTheme()
    const darkMode = theme.palette.mode === "dark"
    const starred = metadata.ProgramCollection && metadata.ProgramCollection.includes(programID)
    const color = darkMode ? "#ff9f0a" : "#ff9500"

    return <Form method='post' style={{display: 'flex'}} onClick={e => e.stopPropagation()}>
        <Input type="hidden" name="ProgramID" value={programID}/>
        <Tooltip title={starred ? "取消收藏该项目" : "收藏该项目"} arrow>
            <IconButton type="submit" name="ActionType" value={starred ? "UnStar" : "Star"}>
                {starred ? <StarRounded style={{color}}/> : <StarBorderRounded/>}
            </IconButton>
        </Tooltip>
    </Form>
}

export default StarButton