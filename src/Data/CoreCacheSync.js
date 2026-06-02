import {getApplicants} from "./ApplicantData";
import {BACKGROUND_PRIORITY, CACHE_CLEARED_EVENT, CACHE_EXPIRATION, getCacheEpoch} from "./CacheStore";
import {getProgramDesc, getPrograms} from "./ProgramData";
import {getRecordByRecordIDs} from "./RecordData";
import {getAvatar, getDisplayName, getMetadata} from "./UserData";

let active = false;
let idleHandle = null;
let syncTimer = null;
let syncRunning = false;

const DESCRIPTION_BATCH_SIZE = 8;
const PROFILE_BATCH_SIZE = 8;

function collectRecordIds(programs, applicants) {
    const recordIds = new Set();
    Object.values(programs ?? {}).flat().forEach((program) => {
        (program.Applicants ?? []).forEach((applicantId) => {
            recordIds.add(`${applicantId}|${program.ProgramID}`);
        });
    });
    (applicants ?? []).forEach((applicant) => {
        Object.keys(applicant.Programs ?? {}).forEach((programId) => {
            recordIds.add(`${applicant.ApplicantID}|${programId}`);
        });
    });
    return [...recordIds];
}

function collectProgramIds(programs) {
    return Object.values(programs ?? {}).flat()
        .map((program) => program.ProgramID)
        .filter(Boolean);
}

function addApplicantDisplayName(displayNames, applicantId) {
    const displayName = applicantId?.split("@")[0];
    if (displayName) {
        displayNames.add(displayName);
    }
}

function collectProfileDisplayNames(displayName, metadata, applicants) {
    const displayNames = new Set();
    if (displayName) {
        displayNames.add(displayName);
    }
    (metadata?.ApplicantIDs ?? []).forEach((applicantId) => addApplicantDisplayName(displayNames, applicantId));
    (applicants ?? []).forEach((applicant) => addApplicantDisplayName(displayNames, applicant.ApplicantID));
    return [...displayNames];
}

function shouldContinue(syncEpoch) {
    return active && navigator.onLine && syncEpoch === getCacheEpoch();
}

function waitForIdle(syncEpoch) {
    return new Promise((resolve) => {
        if (!shouldContinue(syncEpoch)) {
            resolve();
            return;
        }
        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(resolve, {timeout: 2000});
        } else {
            window.setTimeout(resolve, 0);
        }
    });
}

async function loadSafely(load) {
    try {
        return await load();
    } catch {
        return null;
    }
}

async function prefetchInBatches(items, batchSize, syncEpoch, load) {
    for (let index = 0; index < items.length && shouldContinue(syncEpoch); index += batchSize) {
        await waitForIdle(syncEpoch);
        await Promise.all(items.slice(index, index + batchSize).map((item) => loadSafely(() => load(item))));
    }
}

async function prefetchProgramDescriptions(programIds, syncEpoch) {
    await prefetchInBatches(programIds, DESCRIPTION_BATCH_SIZE, syncEpoch, (programId) => (
        getProgramDesc(programId, false, {priority: BACKGROUND_PRIORITY})
    ));
}

async function prefetchProfiles(displayNames, syncEpoch) {
    await prefetchInBatches(displayNames, PROFILE_BATCH_SIZE, syncEpoch, async (displayName) => {
        const metadata = await getMetadata(displayName, false, {priority: BACKGROUND_PRIORITY});
        await getAvatar(metadata?.Avatar, displayName, false, {priority: BACKGROUND_PRIORITY});
    });
}

async function syncCoreCache() {
    if (syncRunning || !navigator.onLine) {
        return;
    }
    syncRunning = true;
    const syncEpoch = getCacheEpoch();
    try {
        const [displayName, programs, applicants] = await Promise.all([
            loadSafely(() => getDisplayName(false, {priority: BACKGROUND_PRIORITY})),
            loadSafely(() => getPrograms(false, {}, "cs_rank", {priority: BACKGROUND_PRIORITY})),
            loadSafely(() => getApplicants(false, {priority: BACKGROUND_PRIORITY})),
        ]);
        if (!shouldContinue(syncEpoch)) {
            return;
        }
        const metadata = displayName
            ? await loadSafely(() => getMetadata(displayName, false, {priority: BACKGROUND_PRIORITY}))
            : null;
        if (!shouldContinue(syncEpoch)) {
            return;
        }
        await prefetchProfiles(collectProfileDisplayNames(displayName, metadata, applicants), syncEpoch);
        await prefetchProgramDescriptions(collectProgramIds(programs), syncEpoch);
        const recordIds = collectRecordIds(programs, applicants);
        if (shouldContinue(syncEpoch)) {
            await getRecordByRecordIDs(recordIds, false, {priority: BACKGROUND_PRIORITY});
        }
    } finally {
        syncRunning = false;
        if (active && syncEpoch !== getCacheEpoch()) {
            scheduleSync();
        }
    }
}

function scheduleSync() {
    if (!active || idleHandle !== null) {
        return;
    }
    const run = () => {
        idleHandle = null;
        void syncCoreCache().catch(() => {});
    };
    if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(run, {timeout: 5000});
    } else {
        idleHandle = window.setTimeout(run, 1000);
    }
}

export function startCoreCacheSync() {
    if (active) {
        return stopCoreCacheSync;
    }
    active = true;
    scheduleSync();
    syncTimer = window.setInterval(scheduleSync, CACHE_EXPIRATION);
    window.addEventListener("online", scheduleSync);
    window.addEventListener(CACHE_CLEARED_EVENT, stopCoreCacheSync);
    return stopCoreCacheSync;
}

export function stopCoreCacheSync() {
    active = false;
    if (idleHandle !== null) {
        if ("cancelIdleCallback" in window) {
            window.cancelIdleCallback(idleHandle);
        } else {
            window.clearTimeout(idleHandle);
        }
        idleHandle = null;
    }
    if (syncTimer !== null) {
        window.clearInterval(syncTimer);
        syncTimer = null;
    }
    window.removeEventListener("online", scheduleSync);
    window.removeEventListener(CACHE_CLEARED_EVENT, stopCoreCacheSync);
}
