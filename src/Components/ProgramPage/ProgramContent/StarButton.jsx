import { StarRounded, StarBorderRounded } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { Form } from "react-router-dom";

const StarButton = ({programID, metaData}) => {
    const starred = metaData.ProgramCollection && metaData.ProgramCollection.includes(programID)

    return <Form method='post' style={{display: 'flex'}}>
        <Tooltip title={starred ? "取消收藏该项目" : "收藏该项目"} arrow>
            <IconButton type="submit" name="ActionType" value={starred ? "UnStar" : "Star"}>
                {starred ? <StarRounded/> : <StarBorderRounded/>}
            </IconButton>
        </Tooltip>
    </Form>
}

export default StarButton