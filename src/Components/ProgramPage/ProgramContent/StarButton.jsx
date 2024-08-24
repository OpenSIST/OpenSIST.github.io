import { Star, StarBorder } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { Form } from "react-router-dom";

const StarButton = ({programID, metaData}) => {
    const starred = metaData.ProgramCollection && metaData.ProgramCollection.includes(programID)

    return <Form method='post' style={{display: 'flex'}}>
        <Tooltip title="收藏该项目" arrow>
            <IconButton type="submit" name="ActionType" value={starred ? "UnStar" : "Star"}>
                {starred ? <Star/> : <StarBorder/>}
            </IconButton>
        </Tooltip>
    </Form>
}

export default StarButton