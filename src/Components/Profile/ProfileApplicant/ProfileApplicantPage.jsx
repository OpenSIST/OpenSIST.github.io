import {Paper} from "@mui/material";
import Grid2 from "@mui/material/Grid";
import {redirect, useLoaderData} from "react-router-dom";
import {getApplicant, getApplicants, isAuthApplicant, removeApplicant} from "../../../Data/ApplicantData";
import {getRecordByApplicant, removeRecord} from "../../../Data/RecordData";
import {getAvatar, getDisplayName, getMetadata} from "../../../Data/UserData";
import {BasicInfoBlock} from "./ProfileApplicantHeader";
import {RecordBlock} from "./ProfileApplicantRecords";
import {CompetitionBlock, ExchangeBlock, InternshipBlock, PublicationBlock, RecommendationBlock, ResearchBlock} from "./ProfileApplicantSections";
import "./ProfileApplicantPage.css";
import {dataPointsApplicantPath, decodePathParam, profileApplicantPath} from "../../RouteUtils";

export async function loader({params}) {
    const applicantId = decodePathParam(params.applicantId);
    const isAuth = await isAuthApplicant(applicantId);
    if (!isAuth) {
        await getApplicants(true);
        const doubleCheck = await isAuthApplicant(applicantId);
        if (!doubleCheck) {
            throw new Error(`Sorry, you are not authorized to view the profile page of ${applicantId}.`);
        }
    }
    return loadApplicantProfile(applicantId);
}

export async function DataPointsLoader({params}) {
    return loadApplicantProfile(decodePathParam(params.applicantId));
}

async function loadApplicantProfile(applicantId) {
    const applicant = await getApplicant(applicantId);
    const displayName = applicant.ApplicantID.split('@')[0];
    const records = await getRecordByApplicant(applicantId);
    const metadata = await getMetadata(displayName);
    const contact = metadata?.Contact ?? {};
    const avatarUrl = await getAvatar(metadata?.Avatar, displayName);
    return {avatarUrl, contact, applicant, records};
}

async function refreshApplicantProfile(applicantId, displayName) {
    await getRecordByApplicant(applicantId, true);
    const metadata = await getMetadata(displayName, true);
    await getAvatar(metadata?.Avatar, displayName, true);
}

export async function action({params, request}) {
    const formData = await request.formData();
    const actionType = formData.get('ActionType');
    const applicantId = decodePathParam(params.applicantId);
    if (actionType === 'DeleteApplicant') {
        await removeApplicant(applicantId);
        return redirect('/profile');
    }
    if (actionType === 'DeleteRecord') {
        const recordId = formData.get('RecordID');
        await removeRecord(recordId);
        return redirect(profileApplicantPath(applicantId));
    }
    if (actionType === 'Refresh') {
        const displayName = await getDisplayName(true);
        await refreshApplicantProfile(applicantId, displayName);
        return redirect(profileApplicantPath(applicantId));
    }
}

export async function DataPointsAction({params, request}) {
    const formData = await request.formData();
    const actionType = formData.get('ActionType');
    const applicantId = decodePathParam(params.applicantId);
    if (actionType === 'Refresh') {
        await refreshApplicantProfile(applicantId, applicantId.split("@")[0]);
        return redirect(dataPointsApplicantPath(applicantId));
    }
}

export function ProfileApplicantPage({editable = false}) {
    const {avatarUrl, contact, applicant, records} = useLoaderData();
    return (
        <Grid2
            component={Paper}
            key={applicant.ApplicantID}
            container
            spacing={2}
            sx={{
                boxShadow: "none",
                bgcolor: "transparent",
            }}
        >
            <BasicInfoBlock avatarUrl={avatarUrl} contact={contact} applicant={applicant} records={records}
                            editable={editable}/>
            <RecordBlock records={records} applicantId={applicant.ApplicantID} editable={editable}/>
            <ExchangeBlock exchanges={applicant?.Exchange}/>
            <ResearchBlock research={applicant?.Research}/>
            <InternshipBlock internships={applicant?.Internship}/>
            <PublicationBlock publications={applicant?.Publication}/>
            <RecommendationBlock recommendations={applicant?.Recommendation}/>
            <CompetitionBlock competition={applicant?.Competition}/>
        </Grid2>
    )
}
