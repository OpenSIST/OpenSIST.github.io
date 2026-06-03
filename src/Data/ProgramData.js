import {ADD_MODIFY_PROGRAM, PROGRAM_DESC_BATCH, PROGRAM_LIST} from "../APIs/APIs";
import {apiJson, apiRequest, univAbbrFullNameMapping} from "./Common";
import {
    BACKGROUND_PRIORITY,
    beginCacheRequests,
    getCacheEpoch,
    isCacheEntryExpired,
    loadCachedValue,
    readCacheEntry,
    writeCacheValue
} from "./CacheStore";
import univListOrder from "./UnivList.json";

/*
* All functions started with 'set' -> Offline operation to set items to local cache
* All functions started with 'get' -> Optionally online operation to get data
* All functions started with 'delete' -> Offline operation to remove items from local cache
* All functions starred with other words -> Online operation to corresponding backend APIs
*/

export async function getPrograms(isRefresh = false, query = {}, ranking = "cs_rank", {priority = "foreground"} = {}) {
    /*
    * Get the list of programs (without description) from the server or local storage
    * @param isRefresh [Boolean]: whether to refresh the data
    * @param query [Object]: {
    *   'u': [String]: university name,
    *   (NO PROGRAM) [Delete] 'p': [String]: program name [Delete],
    *   'd': [String]: degree,
    *   'm': [String]: major,
    *   'r': [String]: region,
    * }
    * @return: list of programs (without description)
    */
    const filters = {
        ...query,
        r: normalizeQueryValues(query.r),
        d: normalizeQueryValues(query.d),
        m: normalizeQueryValues(query.m),
    };
    let programs = await loadCachedValue({
        key: "programs",
        legacyFields: ["data"],
        forceRefresh: isRefresh,
        priority,
        load: async () => {
            const response = await apiJson(PROGRAM_LIST, {
                fetchPriority: priority === BACKGROUND_PRIORITY ? "low" : undefined,
            });
            return response.data;
        },
    });
    if (!programs) {
        return {};
    }
    const univAbbrOrder = univListOrder.reduce((acc, univ) => {
        acc[univ.abbr] = univ[ranking || 'cs_rank'];
        return acc;
    }, {});
    programs = Object.entries(programs).sort(([univ1], [univ2]) => {
        return univAbbrOrder[univ1] - univAbbrOrder[univ2];
    }).reduce((acc, [univ, programs]) => {
        acc[univ] = programs;
        return acc;
    }, {});

    const searchTerm = filters.u?.toLowerCase() ?? '';
    const searchPrograms = Object.keys(programs).reduce((matchingPrograms, univName) => {
        const fullNameResults = (univAbbrFullNameMapping[univName] ?? '').toLowerCase().includes(searchTerm);
        const abbrResults = univName.toLowerCase().includes(searchTerm);
        const programResults = programs[univName].filter((programInfo) => {
            return programInfo.Program.toLowerCase().includes(searchTerm);
        })
        if (fullNameResults || abbrResults || programResults.length > 0) {
            matchingPrograms[univName] = programResults.length > 0 ? programResults : programs[univName];
        }
        return matchingPrograms;
    }, {})

    const filteredEntries = Object.entries(searchPrograms).map(([university, programs]) => {
        const filteredPrograms = programs.filter(program =>
            (!filters.d || filters.d.some(degree => program.Degree === degree)) &&
            (!filters.m || filters.m.some(major => program.TargetApplicantMajor.includes(major))) &&
            (!filters.r || filters.r.some(region => program.Region.includes(region)))
        );
        return [university, filteredPrograms];
    });

    return filteredEntries.reduce((acc, [university, programs]) => {
        if (programs.length > 0) {
            acc[university] = programs;
        }
        return acc;
    }, {});
}

export async function getProgram(programId, isRefresh = false, options = {}) {
    /*
    * Get the program (without description) from the server or local storage by programId
    * @param programId [String]: programId
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: program (without description)
    */
    const programs = await getPrograms(isRefresh, {}, "cs_rank", options);
    const univName = programId.split('@')[1]
    if (!programs[univName]) {
        throw new Response("", {
                status: 404,
                statusText: "Program not found",
            }
        );
    }
    const program = programs[univName].find(currentProgram => currentProgram.ProgramID === programId);
    if (!program) {
        throw new Response("", {
            status: 404,
            statusText: "Program not found",
        });
    }
    return program;
}

export async function getProgramDesc(programId, isRefresh = false, {priority = "foreground"} = {}) {
    /*
    * Get the description of the program from the server or local storage by programId
    * @param programId [String]: programId
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: description of the program
    */
    const descriptions = await getProgramDescs([programId], isRefresh, {priority});
    return descriptions[programId];
}

export async function getProgramDescs(programIds, isRefresh = false, {priority = "foreground"} = {}) {
    const uniqueProgramIds = [...new Set(programIds)].filter(Boolean);
    const requestEpoch = getCacheEpoch();
    const entries = await Promise.all(uniqueProgramIds.map((programId) => (
        readCacheEntry(programDescCacheKey(programId), {legacyFields: ["description"], requestEpoch})
    )));
    if (requestEpoch !== getCacheEpoch()) {
        return {};
    }

    const cachedDescriptions = Object.fromEntries(uniqueProgramIds.flatMap((programId, index) => (
        entries[index] ? [[programId, entries[index].value]] : []
    )));
    const expiredProgramIds = uniqueProgramIds.filter((programId, index) => (
        isCacheEntryExpired(entries[index], isRefresh)
    ));
    const request = beginCacheRequests(expiredProgramIds.map(programDescCacheKey), priority, requestEpoch);
    const requestProgramIds = request.keys.map(programIdFromDescCacheKey);

    if (requestProgramIds.length === 0) {
        return cachedDescriptions;
    }

    try {
        const response = await apiJson(PROGRAM_DESC_BATCH, {
            body: {ProgramIDs: requestProgramIds},
            fetchPriority: priority === BACKGROUND_PRIORITY ? "low" : undefined,
        });
        const refreshedDescriptions = requestProgramIds.reduce((descriptions, programId) => ({
            ...descriptions,
            [programId]: response.data?.[programId] ?? null,
        }), {});
        const cacheWrites = requestProgramIds.map((programId) => {
            const key = programDescCacheKey(programId);
            return writeCacheValue(key, refreshedDescriptions[programId], {
                requestEpoch: request.epoch,
                requestVersion: request.versionFor(key),
            });
        });
        if (priority === BACKGROUND_PRIORITY) {
            await Promise.all(cacheWrites);
        } else {
            cacheWrites.forEach((cacheWrite) => void cacheWrite.catch(() => {}));
        }
        return {
            ...cachedDescriptions,
            ...refreshedDescriptions,
        };
    } finally {
        request.release();
    }
}

export async function getProgramContent(programId, isRefresh = false) {
    /*
    * Get the program (with description) from the server or local storage by programId
    * @param programId [String]: programId
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: program (with description)
    */
    const program = await getProgram(programId, isRefresh);
    const programDesc = await getProgramDesc(programId, isRefresh);
    return {...program, 'description': programDesc};
}

export async function setPrograms(programs) {
    /*
    * Set the list of programs (without description) to the local storage (i.e. localforage.getItem('programs'))
    * @param programs [Array]: list of programs (without description)
    */
    if (!programs) {
        return;
    }
    await writeCacheValue("programs", programs);
}

export async function setProgram(program) {
    /*
    * Set the program (without description) to the local storage (i.e. localforage.getItem('programs'))
    * @param program [Object]: program (without description)
    */
    if (!program) {
        return;
    }
    const programs = await getPrograms();
    const univName = program.University;
    const universityPrograms = programs[univName] ?? [];
    const updatedUniversityPrograms = universityPrograms.some(p => p.ProgramID === program.ProgramID)
        ? universityPrograms.map(currentProgram => currentProgram.ProgramID === program.ProgramID ? program : currentProgram)
        : [...universityPrograms, program];
    await setPrograms({...programs, [univName]: updatedUniversityPrograms});
}

export async function setProgramDesc(programId, programDesc) {
    /*
    * Set the description of the program to the local storage (i.e. localforage.getItem(`${programId}-Desc`))
    * @param programId [String]: programId
    * @param programDesc [String]: description of the program
    */
    if (programDesc === null || programDesc === undefined) {
        return;
    }
    await writeCacheValue(programDescCacheKey(programId), programDesc);
}

export async function setProgramContent(program) {
    /*
    * Set the program (with description) to the local storage (i.e. localforage.getItem('programs') and localforage.getItem(`${programId}-Desc`))
    * @param program [Object]: program (with description)
    */
    if (!program) {
        return;
    }
    const {Description, ...summary} = program;
    await setProgramDesc(program.ProgramID, Description);
    await setProgram(summary);
}

export async function addModifyProgram(requestBody) {
    /*
    * Set the program (with description) to the local storage (i.e. localforage.getItem('programs') and localforage.getItem(`${programId}-Desc`), and post to the server.
    * @param program [Object]: program (with description)
    */
    let content = requestBody.content;
    if (!requestBody.newProgram) {
        const originalProgram = await getProgram(content.ProgramID);
        content = {...content, Applicants: originalProgram.Applicants};
    }
    await apiRequest(ADD_MODIFY_PROGRAM, {
        body: {
            newProgram: requestBody.newProgram,
            content,
        },
    });
    await setProgramContent(content);
}

function normalizeQueryValues(value) {
    return typeof value === 'string' ? value.split(',') : value;
}

function programDescCacheKey(programId) {
    return `${programId}-Desc`;
}

function programIdFromDescCacheKey(key) {
    return key.slice(0, -"-Desc".length);
}
