import React, {useMemo} from "react";
import {Form, Outlet, redirect, useLoaderData, useNavigate, useParams} from "react-router-dom";
import {Dialog, DialogActions, DialogContent, IconButton, Paper} from "@mui/material";
import {Close, Refresh} from "@mui/icons-material";
import {getPrograms} from "../../Data/ProgramData";
import {getRecordByRecordIDs} from "../../Data/RecordData";
import './DataPoints.css';
import {ProfileApplicantPage} from "../Profile/ProfileApplicant/ProfileApplicantPage";
import ProgramContent from "../ProgramPage/ProgramContent/ProgramContent";
import {DraggableFAB, LoadingBackdrop} from "../common";
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
    return {records: await getAllRecords()};
}

export async function action() {
    await getAllRecords(true);
    return redirect('/datapoints');
}

export function ApplicantProfileInDataPoints() {
    const navigate = useNavigate();
    const params = useParams();
    const applicantID = decodePathParam(params.applicantId);
    const {applicant} = useLoaderData();
    return (
        <Dialog
            open={applicantID === applicant.ApplicantID}
            onClose={() => navigate("..")}
            fullWidth
            maxWidth={'xl'}
            sx={{userSelect: 'text'}}
            PaperProps={{sx: {bgcolor: (theme) => theme.palette.background.default}}}
        >
            <DialogActions>
                <IconButton onClick={() => navigate("..")}>
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
    const params = useParams();
    const programID = decodePathParam(params.programId);
    const {programContent} = useLoaderData();
    return (
        <Dialog
            open={programID === programContent.ProgramID}
            onClose={() => navigate("..")}
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

const FloatingControls = () => (
    /* Refresh FAB */
    (<Form method="post" className="refresh-button">
        <DraggableFAB
            Icon={<Refresh/>}
            ActionType="Refresh"
            ButtonClassName="HiddenRefreshButton"
            color="primary"
            tooltipTitle="刷新表格"
        />
    </Form>)
)

export default function DataPoints() {
    const loaderRecords = useLoaderData();
    const hasLoadedRecords = Array.isArray(loaderRecords?.records);
    const records = useMemo(() => {
        const sourceRecords = Array.isArray(loaderRecords?.records) ? loaderRecords.records : [];
        return sourceRecords.filter(isLoadedRecord).map(record => ({
            ...record,
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
                sx={{
                    bgcolor: (theme) => theme.palette.background.default,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <DataGrid records={records} insideProgramPage={false}/>
                <Outlet/>
                <FloatingControls/>
            </Paper>
        </div>
    )
}

function isLoadedRecord(record) {
    return Boolean(record?.RecordID && record?.ApplicantID && record?.ProgramID);
}
