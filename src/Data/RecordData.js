import {
    ADD_MODIFY_RECORD,
    GET_RECORD_BY_RECORD_IDs,
    REMOVE_RECORD
} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import localforage from "localforage";
import {getApplicant, setApplicant} from "./ApplicantData";
import {getProgram, setProgram} from "./ProgramData";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min
// const CACHE_EXPIRATION = 1; // 10 min

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
    await setRecord(requestBody.content);

    const applicantID = requestBody.content.ApplicantID;
    const programID = requestBody.content.ProgramID;

    let applicant = await getApplicant(applicantID);
    applicant.Programs[programID] = requestBody.content.Status;
    await setApplicant(applicant);

    let program = await getProgram(programID);
    program.Applicants = program.Applicants.map(applicant => {
        if (applicant.ApplicantID === applicantID) {
            applicant.Programs[programID] = requestBody.content.Status;
        }
        return applicant;
    });
    await setProgram(program);
}

export async function getRecordByApplicant(applicantId, isRefresh = false) {
    const applicant = await getApplicant(applicantId, isRefresh);
    // console.log('getRecordByApplicant get applicantId:', applicantId, 'applicant:', applicant)
    const recordIDs = Object.keys(applicant.Programs).map(programID => {
        return applicantId + '|' + programID;
    }).flat();
    return getRecordByRecordIDs(recordIDs, isRefresh);
}

// export async function setRecordByApplicant(applicantId, records) {
//     records = {data: records, Date: Date.now()};
//     await localforage.setItem(`records-${applicantId}`, records)
// }

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

    let expiredRecords = {data: {}};
    if (expiredIDs.length > 0) {
        const response = await fetch(GET_RECORD_BY_RECORD_IDs, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({IDs: expiredIDs}),
        });
        await handleErrors(response);
        expiredRecords = await response.json()
        await Promise.all(expiredIDs.map(async (recordId) => {
            await setRecord(expiredRecords['data'][recordId])
        }));
    }
    return {
        ...expiredRecords['data'],
        ...unexpiredRecords
    };
}

export async function setRecord(record) {
    const recordID = record.RecordID;
    record = {data: record, Date: Date.now()};
    await localforage.setItem(`record-${recordID}`, record)
}

export async function removeRecord(recordId) {
    const response = await fetch(REMOVE_RECORD, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({
            RecordID: recordId,
        }),
    });
    await handleErrors(response);

    await localforage.removeItem(`record-${recordId}`);

    const applicantID = recordId.split('|')[0];
    const programID = recordId.split('|')[1];
    const removeApplicantProgram = async (applicant) => {
        applicant.Programs = Object.keys(applicant.Programs).filter(program =>
            program !== programID).reduce((obj, key) => {
            obj[key] = applicant.Programs[key];
            return obj;
        }, {});
        return applicant;
    }

    let applicant = await getApplicant(applicantID);
    applicant = await removeApplicantProgram(applicant);
    await setApplicant(applicant);

    let program = await getProgram(programID);
    program.Applicants = program.Applicants.map(applicant => {
        if (applicant.ApplicantID === applicantID) {
            applicant = removeApplicantProgram(applicant);
        }
        return applicant;
    });
    await setProgram(program);
}