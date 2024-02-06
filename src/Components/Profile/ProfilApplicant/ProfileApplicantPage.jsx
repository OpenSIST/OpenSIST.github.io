import {getRecordByApplicant} from "../../../Data/RecordData";
import {useLoaderData} from "react-router-dom";

export async function loader({params}) {
    const applicantId = params.applicantId;
    const records = getRecordByApplicant(applicantId);
    return {records};
}

export default function ProfileApplicantPage() {
    const {records} = useLoaderData();
    return (
        <div>
            <h1>Profile Applicant Page</h1>
        </div>
    )
}