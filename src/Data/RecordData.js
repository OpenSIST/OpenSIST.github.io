import {ADD_MODIFY_RECORD, RECORD_LIST, REMOVE_RECORD} from "../APIs/APIs";
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

const recordCacheKey = (recordId) => `record-${recordId}`;
const recordListLoads = new Map();

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
        const refreshedRecords = await fetchRecordList(priority);
        const requestedIDSet = new Set(requestRecordIDs);
        const cacheWrites = Object.entries(refreshedRecords).map(([recordId, record]) => {
            const key = recordCacheKey(recordId);
            return writeCacheValue(key, record, {
                requestEpoch: request.epoch,
                requestVersion: requestedIDSet.has(recordId) ? request.versionFor(key) : undefined,
            });
        });
        requestRecordIDs.forEach((recordId) => {
            if (!refreshedRecords[recordId]) {
                const key = recordCacheKey(recordId);
                cacheWrites.push(removeCacheValue(key, {
                    requestEpoch: request.epoch,
                    requestVersion: request.versionFor(key),
                }));
            }
        });
        if (priority === BACKGROUND_PRIORITY) {
            await Promise.all(cacheWrites);
        } else {
            cacheWrites.forEach((cacheWrite) => void cacheWrite.catch(() => {}));
        }
        const retainedCachedRecords = Object.fromEntries(
            Object.entries(cachedRecords).filter(([recordId]) => !requestedIDSet.has(recordId))
        );
        const requestedRefreshedRecords = Object.fromEntries(
            requestRecordIDs.flatMap((recordId) => (
                refreshedRecords[recordId] ? [[recordId, refreshedRecords[recordId]]] : []
            ))
        );
        return {
            ...retainedCachedRecords,
            ...requestedRefreshedRecords,
        };
    } finally {
        request.release();
    }
}

function normalizeRecordList(records) {
    return Object.fromEntries(
        (records ?? [])
            .filter(isRecordData)
            .map((record) => [record.RecordID, record])
    );
}

function fetchRecordList(priority) {
    const loadKey = priority === BACKGROUND_PRIORITY ? BACKGROUND_PRIORITY : "foreground";
    if (recordListLoads.has(loadKey)) {
        return recordListLoads.get(loadKey);
    }
    const load = apiJson(RECORD_LIST, {
        fetchPriority: priority === BACKGROUND_PRIORITY ? "low" : undefined,
    }).then((response) => normalizeRecordList(response.data));
    recordListLoads.set(loadKey, load);
    return load.finally(() => {
        if (recordListLoads.get(loadKey) === load) {
            recordListLoads.delete(loadKey);
        }
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
