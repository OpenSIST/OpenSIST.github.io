import {getRecordByApplicant} from "../../../Data/RecordData";
import {useLoaderData} from "react-router-dom";
import {Box, Card, CardActionArea, Typography} from "@mui/material";
import {Add} from "@mui/icons-material";
import "./ProfileApplicantPage.css";
import {Link} from 'react-router-dom';

export async function loader({params}) {
    const applicantId = params.applicantId;
    const records = await getRecordByApplicant(applicantId);
    return {applicantId, records};
}

export default function ProfileApplicantPage() {
    const {applicantId, records} = useLoaderData();
    return (
        <>
            <Box sx={{display: 'flex'}}>
                {records.map(record => (
                    <Card className="RecordCard">
                        <Typography>record.ProgramID</Typography>
                    </Card>
                ))}
                <Card className="RecordCard">
                    <CardActionArea component={Link} to={`/profile/${applicantId}/new-program`}>
                        <Add sx={{fontSize: '10rem'}}/>
                    </CardActionArea>
                </Card>
            </Box>
        </>
    )
}