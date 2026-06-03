import {ADD_MODIFY_RECORD, GET_RECORDS_BY_ID, REMOVE_RECORD} from "../APIs/APIs";
import {apiJson, apiRequest} from "./Common";
import {
    BACKGROUND_PRIORITY,
    beginCacheRequests,
    getCacheEpoch,
    isCacheEntryExpired,
    readCacheEntry,
    removeCacheValue,
    writeCacheValue
} from "./CacheStore";
import {getApplicant, setApplicant} from "./ApplicantData";
import {getProgram, setProgram} from "./ProgramData";

const RECORD_BATCH_SIZE = 90;

const recordCacheKey = (recordId) => `record-${recordId}`;

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

export async function getRecordByRecordIDs(recordIDs, isRefresh = false, {priority = "foreground"} = {}) {
    const uniqueRecordIDs = [...new Set(recordIDs)];
    const requestEpoch = getCacheEpoch();
    const entries = await Promise.all(uniqueRecordIDs.map((recordId) => (
        readCacheEntry(recordCacheKey(recordId), {legacyFields: ["data"], requestEpoch})
    )));
    if (requestEpoch !== getCacheEpoch()) {
        return {};
    }
    const cachedRecords = Object.fromEntries(uniqueRecordIDs.flatMap((recordId, index) => (
        isRecordData(entries[index]?.value) ? [[recordId, entries[index].value]] : []
    )));
    const expiredIDs = uniqueRecordIDs.filter((recordId, index) => (
        isCacheEntryExpired(entries[index], isRefresh) || !isRecordData(entries[index]?.value)
    ));
    const request = beginCacheRequests(expiredIDs.map(recordCacheKey), priority, requestEpoch);
    const requestRecordIDs = request.keys.map((key) => key.slice("record-".length));

    if (requestRecordIDs.length === 0) {
        return cachedRecords;
    }

    try {
        const responses = priority === BACKGROUND_PRIORITY
            ? await requestRecordBatchesSequentially(requestRecordIDs, priority)
            : await requestRecordBatchesConcurrently(requestRecordIDs, priority);
        const refreshedRecordResponses = responses.reduce((records, response) => {
            return {...records, ...response.data};
        }, {});
        const refreshedRecords = Object.fromEntries(
            Object.entries(refreshedRecordResponses).filter(([, record]) => isRecordData(record))
        );
        const cacheWrites = requestRecordIDs.map((recordId) => {
            const key = recordCacheKey(recordId);
            const requestEpoch = request.epoch;
            const requestVersion = request.versionFor(key);
            return isRecordData(refreshedRecordResponses[recordId])
                ? writeCacheValue(key, refreshedRecords[recordId], {requestEpoch, requestVersion})
                : removeCacheValue(key, {requestEpoch, requestVersion});
        });
        if (priority === BACKGROUND_PRIORITY) {
            await Promise.all(cacheWrites);
        } else {
            cacheWrites.forEach((cacheWrite) => void cacheWrite.catch(() => {}));
        }
        const requestedIDSet = new Set(requestRecordIDs);
        const retainedCachedRecords = Object.fromEntries(
            Object.entries(cachedRecords).filter(([recordId]) => !requestedIDSet.has(recordId))
        );
        return {
            ...retainedCachedRecords,
            ...refreshedRecords,
        };
    } finally {
        request.release();
    }
}

async function requestRecordBatchesConcurrently(recordIDs, priority) {
    return Promise.all(createRecordBatches(recordIDs).map((batch) => fetchRecordBatch(batch, priority)));
}

async function requestRecordBatchesSequentially(recordIDs, priority) {
    const responses = [];
    for (const batch of createRecordBatches(recordIDs)) {
        responses.push(await fetchRecordBatch(batch, priority));
    }
    return responses;
}

function createRecordBatches(recordIDs) {
    const batches = [];
    for (let index = 0; index < recordIDs.length; index += RECORD_BATCH_SIZE) {
        batches.push(recordIDs.slice(index, index + RECORD_BATCH_SIZE));
    }
    return batches;
}

function fetchRecordBatch(recordIDs, priority) {
    return apiJson(GET_RECORDS_BY_ID, {
        body: {IDs: recordIDs},
        fetchPriority: priority === BACKGROUND_PRIORITY ? "low" : undefined,
    });
}

function isRecordData(record) {
    return Boolean(record?.RecordID && record?.ApplicantID && record?.ProgramID);
}

export async function setRecord(record) {
    if (!record) {
        return;
    }
    await writeCacheValue(recordCacheKey(record.RecordID), record);
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
    await removeCacheValue(recordCacheKey(recordId));

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
