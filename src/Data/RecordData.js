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
    if (!program.Applicants.includes(applicantID)) {
        program.Applicants.push(applicantID);
    }
    await setProgram(program);
}

export async function getRecordByApplicant(applicantId, isRefresh = false) {
    const applicant = await getApplicant(applicantId, isRefresh);
    const recordIDs = Object.keys(applicant.Programs).map(programID => {
        return applicantId + '|' + programID;
    }).flat();
    return getRecordByRecordIDs(recordIDs, isRefresh);
}

export async function getRecordByProgram(programId, isRefresh = false) {
    const program = await getProgram(programId, isRefresh);
    const recordIDs = program.Applicants.map(applicantID => {
        return applicantID + '|' + programId;
    }).flat();
    return getRecordByRecordIDs(recordIDs, isRefresh);
}

export async function getRecordByRecordIDs(recordIDs, isRefresh = false) {
    const cacheRecords = await Promise.all(recordIDs.map(async (recordId) => {
        return await localforage.getItem(`record-${recordId}`);
    }));
    const expiredIDs = recordIDs.filter((recordId, index) => {
        return isRefresh || cacheRecords[index] === null || (Date.now() - cacheRecords[index].Date) > CACHE_EXPIRATION;
    });
    const unexpiredIDs = recordIDs.filter((recordId) => {
        return !expiredIDs.includes(recordId);
    });

    const unexpiredRecords = {};
    unexpiredIDs.forEach((recordId) => {
        unexpiredRecords[recordId] = cacheRecords[recordIDs.indexOf(recordId)]['data'];
    })
    let expiredRecords = {data: {}};
    if (expiredIDs.length > 0) {
        let responses = []
        const batch_size = 6;
        for (let i = 0; i < expiredIDs.length; i += batch_size) {
            responses.push(fetch(GET_RECORD_BY_RECORD_IDs, {
                method: 'POST',
                credentials: 'include',
                headers: await headerGenerator(true),
                body: JSON.stringify({IDs: expiredIDs.slice(i, i + batch_size)}),
            }));
        }
        responses = await Promise.all(responses);
        await Promise.all(responses.map(async (response) => {
            await handleErrors(response);
        }));
        expiredRecords = await Promise.all(responses.map(async (response) => {
            return await response.json();
        }));
        expiredRecords.data = expiredRecords.reduce((obj, response) => {
            return {...obj, ...response.data};
        }, {});
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
    if (!record) {
        return;
    }
    const recordID = record.RecordID;
    record = {data: record, Date: Date.now()};
    await localforage.setItem(`record-${recordID}`, record)
}

export async function removeRecord(recordId) {
    /* Remove recode from server and localforage
     */
    const response = await fetch(REMOVE_RECORD, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({
            RecordID: recordId,
        }),
    });
    await handleErrors(response);
    await deleteRecord(recordId);
    //
    // await localforage.removeItem(`record-${recordId}`);
    //
    // const applicantID = recordId.split('|')[0];
    // const programID = recordId.split('|')[1];
    //
    // let applicant = await getApplicant(applicantID);
    // applicant.Programs = Object.entries(applicant.Programs).reduce((obj, [key, value]) => {
    //     if (key !== programID) {
    //         obj[key] = value;
    //     }
    //     return obj;
    // }, {});
    // await setApplicant(applicant);
    //
    // let program = await getProgram(programID);
    // program.Applicants = program.Applicants.filter(applicant => applicant !== applicantID);
    // await setProgram(program);
}

export async function deleteRecord(recordId) {
    /* Remove recode from localforage
     */
    await localforage.removeItem(`record-${recordId}`);

    const applicantID = recordId.split('|')[0];
    const programID = recordId.split('|')[1];

    let applicant = await getApplicant(applicantID);
    applicant.Programs = Object.entries(applicant.Programs).reduce((obj, [key, value]) => {
        if (key !== programID) {
            obj[key] = value;
        }
        return obj;
    }, {});
    if (applicant.Final === programID) {
        applicant.Final = "";
    }
    await setApplicant(applicant);

    let program = await getProgram(programID);
    program.Applicants = program.Applicants.filter(applicant => applicant !== applicantID);
    await setProgram(program);
}