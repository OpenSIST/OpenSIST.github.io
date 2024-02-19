import {ADD_MODIFY_RECORD, GET_RECORD_BY_APPLICANT, GET_RECORD_BY_RECORD_IDs} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import localforage from "localforage";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min

export async function addModifyRecord(requestBody) {
    const response = await fetch(ADD_MODIFY_RECORD, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({
            newRecord: requestBody.newRecord,
            content: requestBody.content,
        }),
    });
    await handleErrors(response);
    await setRecordByRecordID(requestBody.content.RecordID, requestBody.content);
    let records = await getRecordByApplicant(requestBody.content.ApplicantID, true);
    if (records.find(record => record.RecordID === requestBody.content.RecordID) !== undefined) {
        records[records.indexOf(requestBody.content)] = requestBody.content;
    } else {
        records.push(requestBody.content);
    }
    await setRecordByApplicant(requestBody.content.ApplicantID, records);
}

export async function getRecordByApplicant(applicantId, isRefresh = false) {
    // await localforage.removeItem(`records-${applicantId}`)  //TODO: remove this line
    let records = await localforage.getItem(`records-${applicantId}`);
    if (isRefresh || records === null || (Date.now() - records.Date) > CACHE_EXPIRATION) {
        const response = await fetch(GET_RECORD_BY_APPLICANT, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ApplicantID: applicantId}),
        });
        await handleErrors(response);
        records = await response.json()
        await setRecordByApplicant(applicantId, records['data'])
    }
    return records['data'];
}

export async function setRecordByApplicant(applicantId, records) {
    records = {data: records, Date: Date.now()};
    await localforage.setItem(`records-${applicantId}`, records)
}

export async function getRecordByRecordIDs(recordIDs, isRefresh = false) {
    const cacheRecords = await Promise.all(recordIDs.map(async (recordId) => {
        return await localforage.getItem(`record-${recordId}`);
    }));
    const expiredIDs = recordIDs.filter((recordId, index) => {
        return isRefresh || cacheRecords[index] === null || (Date.now() - cacheRecords[index].Date) > CACHE_EXPIRATION;
    });
    const unexpiredIDs = recordIDs.filter((recordId, index) => {
        return !expiredIDs.includes(recordId)
    });

    const unexpiredRecords = {};
    unexpiredIDs.forEach((recordId) => {
        unexpiredRecords[recordId] = cacheRecords[recordIDs.indexOf(recordId)]['data'];
    })

    const response = await fetch(GET_RECORD_BY_RECORD_IDs, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({IDs: expiredIDs}),
    });
    await handleErrors(response);
    let records = await response.json()
    await Promise.all(expiredIDs.map(async (recordId) => {
        await setRecordByRecordID(recordId, records['data'][recordId])
    }));
    records = {
        ...records['data'],
        ...unexpiredRecords
    }
    return records;
}

export async function setRecordByRecordID(recordId, record) {
    record = {data: record, Date: Date.now()};
    await localforage.setItem(`record-${recordId}`, record)
}