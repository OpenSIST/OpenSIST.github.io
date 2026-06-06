import {ADD_MODIFY_RECORD, RECORD_LIST, REMOVE_RECORD} from "../APIs/APIs";
import {apiJson, apiRequest} from "./Common";
import {FOREGROUND_PRIORITY, isCacheEntryExpired, loadCachedValue, readCacheEntry, writeCacheValue} from "./CacheStore";
import {getApplicant, setApplicant} from "./ApplicantData";
import {getProgram, setProgram} from "./ProgramData";

const RECORDS_CACHE_KEY = "records";

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

export async function getRecordByApplicant(applicantId, isRefresh = false, options = {}) {
    const applicant = await getApplicant(applicantId, isRefresh, options);
    const recordIDs = Object.keys(applicant.Programs).map(programID => {
        return applicantId + '|' + programID;
    });
    return getRecordByRecordIDs(recordIDs, isRefresh, options);
}

export async function getRecordByProgram(programId, isRefresh = false, options = {}) {
    const program = await getProgram(programId, isRefresh, options);
    const recordIDs = program.Applicants.map(applicantID => {
        return applicantID + '|' + programId;
    });
    return getRecordByRecordIDs(recordIDs, isRefresh, options);
}

export async function getRecordByRecordIDs(recordIDs, isRefresh = false, {priority = FOREGROUND_PRIORITY} = {}) {
    const uniqueRecordIDs = [...new Set(recordIDs)].filter(Boolean);
    if (uniqueRecordIDs.length === 0) {
        return {};
    }
    const records = await getRecords(isRefresh, {priority});
    return Object.fromEntries(uniqueRecordIDs.flatMap((recordId) => (
        isRecordData(records[recordId]) ? [[recordId, records[recordId]]] : []
    )));
}

export async function getRecords(isRefresh = false, {priority = FOREGROUND_PRIORITY} = {}) {
    return await loadCachedValue({
        key: RECORDS_CACHE_KEY,
        legacyFields: ["data"],
        forceRefresh: isRefresh,
        priority,
        load: async () => {
            const response = await apiJson(RECORD_LIST, {
                fetchPriority: priority,
            });
            return normalizeRecordList(response.data);
        },
    }) ?? {};
}

export async function setRecords(records) {
    if (!records) {
        return;
    }
    await writeCacheValue(RECORDS_CACHE_KEY, normalizeRecordList(records));
}

export async function updateCachedRecords(update) {
    const records = await readFreshCachedRecords();
    if (!records) {
        return;
    }
    await setRecords(update(records));
}

async function readFreshCachedRecords() {
    const entry = await readCacheEntry(RECORDS_CACHE_KEY, {legacyFields: ["data"]});
    return isCacheEntryExpired(entry) ? null : normalizeRecordList(entry.value);
}

function normalizeRecordList(records) {
    const recordList = Array.isArray(records) ? records : Object.values(records ?? {});
    return Object.fromEntries(
        recordList
            .filter(isRecordData)
            .map((record) => [record.RecordID, record])
    );
}

function isRecordData(record) {
    return Boolean(record?.RecordID && record?.ApplicantID && record?.ProgramID);
}

export async function setRecord(record) {
    if (!record) {
        return;
    }
    await updateCachedRecords((records) => ({...records, [record.RecordID]: record}));
}

export async function removeRecord(recordId) {
    await apiRequest(REMOVE_RECORD, {
        body: {
            RecordID: recordId,
        },
    });
    await deleteRecord(recordId);
}

export async function deleteRecord(recordId) {
    await updateCachedRecords((records) => {
        const updatedRecords = {...records};
        delete updatedRecords[recordId];
        return updatedRecords;
    });

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
