import {ADD_MODIFY_RECORD, GET_RECORDS_BY_ID, REMOVE_RECORD} from "../APIs/APIs";
import {apiJson, apiRequest, shouldRefreshCache} from "./Common";
import localforage from "localforage";
import {getApplicant, setApplicant} from "./ApplicantData";
import {getProgram, setProgram} from "./ProgramData";

export async function addModifyRecord(requestBody) {
    await apiRequest(ADD_MODIFY_RECORD, {
        body: {
            newRecord: requestBody.newRecord,
            content: requestBody.content,
        },
    });
    await setRecord(requestBody.content);

    const applicantID = requestBody.content.ApplicantID;
    const programID = requestBody.content.ProgramID;

    const applicant = await getApplicant(applicantID);
    await setApplicant({
        ...applicant,
        Programs: {...applicant.Programs, [programID]: requestBody.content.Status},
    });

    const program = await getProgram(programID);
    if (!program.Applicants.includes(applicantID)) {
        await setProgram({...program, Applicants: [...program.Applicants, applicantID]});
    }
}

export async function getRecordByApplicant(applicantId, isRefresh = false) {
    const applicant = await getApplicant(applicantId, isRefresh);
    const recordIDs = Object.keys(applicant.Programs).map(programID => {
        return applicantId + '|' + programID;
    });
    return getRecordByRecordIDs(recordIDs, isRefresh);
}

export async function getRecordByProgram(programId, isRefresh = false) {
    const program = await getProgram(programId, isRefresh);
    const recordIDs = program.Applicants.map(applicantID => {
        return applicantID + '|' + programId;
    });
    return getRecordByRecordIDs(recordIDs, isRefresh);
}

export async function getRecordByRecordIDs(recordIDs, isRefresh = false) {
    const cacheRecords = await Promise.all(recordIDs.map(recordId => {
        return localforage.getItem(`record-${recordId}`);
    }));
    const cacheRecordsById = Object.fromEntries(
        recordIDs.map((recordId, index) => [recordId, cacheRecords[index]])
    );
    const expiredIDs = recordIDs.filter((recordId, index) => {
        return shouldRefreshCache(cacheRecords[index], isRefresh);
    });
    const expiredIDSet = new Set(expiredIDs);
    const unexpiredIDs = recordIDs.filter(recordId => !expiredIDSet.has(recordId));

    const unexpiredRecords = {};
    unexpiredIDs.forEach((recordId) => {
        unexpiredRecords[recordId] = cacheRecordsById[recordId]['data'];
    })
    let expiredRecords = {};
    if (expiredIDs.length > 0) {
        const requests = [];
        const batchSize = 30;
        for (let i = 0; i < expiredIDs.length; i += batchSize) {
            requests.push(apiJson(GET_RECORDS_BY_ID, {
                body: {IDs: expiredIDs.slice(i, i + batchSize)},
            }));
        }
        const responses = await Promise.all(requests);
        expiredRecords = responses.reduce((obj, response) => {
            return {...obj, ...response.data};
        }, {});
        await Promise.all(expiredIDs.map(recordId => setRecord(expiredRecords[recordId])));
    }
    return {
        ...expiredRecords,
        ...unexpiredRecords
    };
}

export async function setRecord(record) {
    if (!record) {
        return;
    }
    const recordID = record.RecordID;
    await localforage.setItem(`record-${recordID}`, {data: record, Date: Date.now()});
}

export async function removeRecord(recordId) {
    /* Remove record from server and localforage. */
    await apiRequest(REMOVE_RECORD, {
        body: {
            RecordID: recordId,
        },
    });
    await deleteRecord(recordId);
}

export async function deleteRecord(recordId) {
    /* Remove record from localforage. */
    await localforage.removeItem(`record-${recordId}`);

    const [applicantID, programID] = recordId.split('|');

    const applicant = await getApplicant(applicantID);
    const Programs = Object.fromEntries(
        Object.entries(applicant.Programs).filter(([key]) => key !== programID)
    );
    await setApplicant({
        ...applicant,
        Programs,
        Final: applicant.Final === programID ? "" : applicant.Final,
    });

    const program = await getProgram(programID);
    await setProgram({
        ...program,
        Applicants: program.Applicants.filter(applicant => applicant !== applicantID),
    });
}
