import {GET_RECORD_BY_APPLICANT} from "../APIs/APIs";
import {handleErrors, headerGenerator} from "./Common";
import localforage from "localforage";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min

export async function getRecordByApplicant(applicantId, isRefresh = false) {
    // await localforage.removeItem(`records-${applicantId}`)  //TODO: remove this line
    let records = await localforage.getItem(`records-${applicantId}`)
    if (isRefresh || records === null || (Date.now() - records.Date) > CACHE_EXPIRATION) {
        const response = await fetch(GET_RECORD_BY_APPLICANT, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({ApplicantID: applicantId}),
        });
        await handleErrors(response);
        records = await response.json()
        await setRecordByApplicant(applicantId['data'], records)
    }
    return records['data'];
}

export async function setRecordByApplicant(applicantId, records) {
    records = {data: records, Date: Date.now()};
    await localforage.setItem(`records-${applicantId}`, records)
}