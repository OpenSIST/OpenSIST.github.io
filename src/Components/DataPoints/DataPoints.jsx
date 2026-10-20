import React, {useMemo} from "react";
import {Outlet, redirect, useLoaderData, useNavigate, useNavigation, useParams, useSubmit} from "react-router-dom";
import {Button, Dialog, DialogActions, DialogContent, IconButton, Paper} from "@mui/material";
import {Close, Refresh} from "@mui/icons-material";
import {getApplicants} from "../../Data/ApplicantData";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByRecordIDs} from "../../Data/RecordData";
import './DataPoints.css';
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";
import {LoadingBackdrop, useSmallPage} from "../common";
import RecordTable from "./RecordTable";
import {decodePathParam} from "../RouteUtils";

async function getAllRecords(isRefresh = false) {
    let programs = await getPrograms(isRefresh);
    programs = Object.values(programs).flat().filter(program => program.Applicants?.length > 0);
    const recordIDs = programs.flatMap(program => (
        program.Applicants.map(applicant => applicant + "|" + program.ProgramID)
    ));
    const programOrder = new Map(programs.map((program, index) => [program.ProgramID, index]));
    const recordsById = await getRecordByRecordIDs(recordIDs, isRefresh);
    const missingRecordIDs = recordIDs.filter((recordId) => !isLoadedRecord(recordsById[recordId]));
    const refreshedMissingRecords = missingRecordIDs.length > 0 && !isRefresh
        ? await getRecordByRecordIDs(missingRecordIDs, true)
        : {};
    return Object.values({...recordsById, ...refreshedMissingRecords})
        .filter(isLoadedRecord)
        .sort((a, b) => {
            return (programOrder.get(a.ProgramID) ?? Number.MAX_SAFE_INTEGER) -
                (programOrder.get(b.ProgramID) ?? Number.MAX_SAFE_INTEGER);
        });
}

export async function loader() {
    const [records, applicants] = await Promise.all([getAllRecords(), getApplicants()]);
    return {records, applicants};
}

export async function action() {
    await Promise.all([getAllRecords(true), getApplicants(true)]);
    return redirect('/datapoints');
}

export function ApplicantProfileInDataPoints() {
    const navigate = useNavigate();
    const smallPage = useSmallPage();
    const params = useParams();
    const applicantID = decodePathParam(params.applicantId);
    const {applicant} = useLoaderData();
    return (
        <Dialog
            open={applicantID === applicant.ApplicantID}
            onClose={() => navigate("..")}
            fullScreen={smallPage}
            fullWidth
            maxWidth={'xl'}
            sx={{userSelect: 'text'}}
            PaperProps={{sx: {bgcolor: (theme) => theme.palette.background.default}}}
        >
            <DialogActions>
                <IconButton aria-label="关闭详情" onClick={() => navigate("..")}>
                    <Close/>
                </IconButton>
            </DialogActions>
            <DialogContent>
                <ProfileApplicantPage editable={false}/>
            </DialogContent>
        </Dialog>
    )
}

export function ProgramContentInDataPoints() {
    const navigate = useNavigate();
    const smallPage = useSmallPage();
    const params = useParams();
    const programID = decodePathParam(params.programId);
    const {programContent} = useLoaderData();
    return (
        <Dialog
            open={programID === programContent.ProgramID}
            onClose={() => navigate("..")}
            fullScreen={smallPage}
            fullWidth
            maxWidth={'xl'}
            sx={{userSelect: 'text'}}
        >
            <DialogContent>
                <ProgramContent editable={false} inDialog={true}/>
            </DialogContent>
        </Dialog>
    )
}

/**
 * DataGrid — themed, virtualized record table. Reused by the program page
 * (insideProgramPage) and the standalone DataPoints view.
 */
export const DataGrid = RecordTable;

function RefreshButton() {
    const submit = useSubmit();
    const navigation = useNavigation();
    const busy = navigation.state !== "idle";
    return (
        <Button
            disableRipple
            className="rt-pill rt-group-pill"
            onClick={() => submit(null, {method: "post"})}
            startIcon={
                <Refresh sx={{
                    fontSize: 16,
                    "@keyframes rtspin": {to: {transform: "rotate(360deg)"}},
                    animation: busy ? "rtspin 0.8s linear infinite" : "none",
                }}/>
            }
        >
            刷新
        </Button>
    );
}

export default function DataPoints() {
    const loaderRecords = useLoaderData();
    const hasLoadedRecords = Array.isArray(loaderRecords?.records);
    const records = useMemo(() => {
        const sourceRecords = Array.isArray(loaderRecords?.records) ? loaderRecords.records : [];
        const degrees = new Map((loaderRecords?.applicants ?? []).map(applicant => [applicant.ApplicantID, applicant.CurrentDegree]));
        return sourceRecords.filter(isLoadedRecord).map(record => ({
            ...record,
            ApplicantDegree: degrees.get(record.ApplicantID),
            Season: record.ProgramYear + " " + record.Semester,
        }));
    }, [loaderRecords]);
    if (!hasLoadedRecords) {
        return <LoadingBackdrop forceOpen/>;
    }

    return (
        <div style={{overflowY: 'hidden', width: '100%', height: '100%'}}>
            <Paper
                className="DataPointsContent"
                elevation={0}
                sx={{
                    bgcolor: (theme) => theme.palette.background.default,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <DataGrid records={records} insideProgramPage={false} refreshSlot={<RefreshButton/>}/>
                <Outlet/>
            </Paper>
        </div>
    )
}

function isLoadedRecord(record) {
    return Boolean(record?.RecordID && record?.ApplicantID && record?.ProgramID);
}
