import localforage from "localforage";
import {ADD_MODIFY_PROGRAM, MODIFY_PROGRAM_ID, PROGRAM_DESC, PROGRAM_LIST, REMOVE_PROGRAM} from "../APIs/APIs";
import {handleErrors, headerGenerator, univAbbrFullNameMapping} from "./Common";
import univListOrder from "./UnivList.json";
import {deleteRecord, getRecordByProgram} from "./RecordData";
import {getApplicants} from "./ApplicantData";

const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 min
// const CACHE_EXPIRATION = 1; // 10 min

/*
* All functions started with 'set' -> Offline operation to set items to local cache
* All functions started with 'get' -> Optionally online operation to get data
* All functions started with 'delete' -> Offline operation to remove items from local cache
* All functions starred with other words -> Online operation to corresponding backend APIs
*/

export async function getPrograms(isRefresh = false, query = {}) {
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
    query.r = query.r?.split(',') || query.r;
    query.d = query.d?.split(',') || query.d;
    query.m = query.m?.split(',') || query.m;
    let programs = await localforage.getItem('programs');

    if (isRefresh || programs === null || (Date.now() - programs.Date) > CACHE_EXPIRATION) {
        const response = await fetch(PROGRAM_LIST, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
        });
        await handleErrors(response)
        programs = (await response.json());
        await setPrograms(programs['data'])
    }

    programs = programs['data'];

    const univAbbrOrder = univListOrder.map((univ) => univ.abbr);
    programs = Object.entries(programs).sort(([univ1, _], [univ2, __]) => {
        return univAbbrOrder.indexOf(univ1) - univAbbrOrder.indexOf(univ2);
    }).reduce((acc, [univ, programs]) => {
        acc[univ] = programs;
        return acc;
    }, {});

    const search_keys = Object.keys(programs).filter((univName) => {
        const fullNameResults = univAbbrFullNameMapping[univName].toLowerCase().includes(query.u?.toLowerCase() ?? '');
        const abbrResults = univName.toLowerCase().includes(query.u?.toLowerCase() ?? '');
        return fullNameResults || abbrResults;
    })

    const search_programs = {}
    search_keys.forEach((key) => {
        search_programs[key] = programs[key]
    })


    const filteredEntries = Object.entries(search_programs).map(([university, programs]) => {
        const filteredPrograms = programs.filter(program =>
            (!query.d || query.d.some(degree => program.Degree === degree)) &&
            (!query.m || query.m.some(major => program.TargetApplicantMajor.includes(major))) &&
            (!query.r || query.r.some(region => program.Region.includes(region)))
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

export async function getProgram(programId, isRefresh = false) {
    /*
    * Get the program (without description) from the server or local storage by programId
    * @param programId [String]: programId
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: program (without description)
    */
    const programs = await getPrograms(isRefresh);
    const univName = programId.split('@')[1]
    // To prevent user's meaningless query
    if (!programs[univName]) {
        throw new Response("", {
                status: 404,
                statusText: "Program not found",
            }
        );
    }
    return programs[univName].find(program => program.ProgramID === programId);
}

export async function getProgramDesc(programId, isRefresh = false) {
    /*
    * Get the description of the program from the server or local storage by programId
    * @param programId [String]: programId
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: description of the program
    */
    // await localforage.removeItem(`${programId}-Desc`) //TODO: remove this line
    let programDesc = await localforage.getItem(`${programId}-Desc`);
    if (isRefresh || programDesc === null || (Date.now() - programDesc.Date) > CACHE_EXPIRATION) {
        const response = await fetch(PROGRAM_DESC, {
            method: 'POST',
            credentials: 'include',
            headers: await headerGenerator(true),
            body: JSON.stringify({'ProgramID': programId}),
        });
        try {
            await handleErrors(response);
        } catch (e) {
            if (e.status === 404) {
                await getPrograms(true);
            }
            throw e;
        }
        programDesc = (await response.json());
        await setProgramDesc(programId, programDesc['description'])
    }
    return programDesc['description'];
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
    programs = {'data': programs, 'Date': Date.now()};
    await localforage.setItem('programs', programs);
}

export async function setProgram(program) {
    /*
    * Set the program (without description) to the local storage (i.e. localforage.getItem('programs'))
    * @param program [Object]: program (without description)
    */
    if (!program) {
        return;
    }
    const programs = await getPrograms(true);
    const univName = program.University;
    if (programs[univName] === undefined) {
        programs[univName] = []
    }
    if (programs[univName].find(p => p.ProgramID === program.ProgramID) !== undefined) {
        programs[univName][programs[univName].indexOf(program)] = program;
    } else {
        programs[univName].push(program);
    }
    await setPrograms(programs);
}

export async function setProgramDesc(programId, programDesc) {
    /*
    * Set the description of the program to the local storage (i.e. localforage.getItem(`${programId}-Desc`))
    * @param programId [String]: programId
    * @param programDesc [String]: description of the program
    */
    if (!programDesc) {
        return;
    }
    programDesc = {'description': programDesc, 'Date': Date.now()}
    await localforage.setItem(`${programId}-Desc`, programDesc);
}

export async function setProgramContent(program) {
    /*
    * Set the program (with description) to the local storage (i.e. localforage.getItem('programs') and localforage.getItem(`${programId}-Desc`))
    * @param program [Object]: program (with description)
    */
    if (!program) {
        return;
    }
    await setProgram(program);
    await setProgramDesc(program.ProgramID, program.Description);
}

export async function deleteProgramDesc(programId) {
    /*
    * Remove the description of the program from the local storage (i.e. localforage.getItem(`${programId}-Desc`))
    * @param programId [String]: programId
    */
    await localforage.removeItem(`${programId}-Desc`);
}

export async function addModifyProgram(requestBody) {
    /*
    * Set the program (with description) to the local storage (i.e. localforage.getItem('programs') and localforage.getItem(`${programId}-Desc`), and post to the server.
    * @param program [Object]: program (with description)
    */

    const response = await fetch(ADD_MODIFY_PROGRAM, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({
            newProgram: requestBody.newProgram,
            content: {...(requestBody.content), Applicants: []},
        }),
    });
    await handleErrors(response)
    await setProgramContent(requestBody.content);
}

export async function removeProgram(programId) {
    /*
    * Remove the program from the local storage and the server.
    * @param programId [String]: programId
    */
    const response = await fetch(REMOVE_PROGRAM, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify({
            ProgramID: programId,
        }),
    });

    await handleErrors(response)
    await deleteProgramDesc(programId);
    const records = await getRecordByProgram(programId);
    const programs = await getPrograms();
    const univName = programId.split('@')[1]
    programs[univName] = programs[univName].filter(p => p.ProgramID !== programId);
    await setPrograms(programs);
    // Since the backend forbids the deletion of the program with applicants, the following code is not necessary actually...
    for (const recordID of Object.keys(records)) {
        await deleteRecord(recordID);
    }

}

export async function modifyProgramID(requestBody) {
    /*
    * Modify the programId of the program from the local storage and the server.
    * @param requestBody [Object]: {
    *   'ProgramID': [String]: old programId,
    *   'NewProgramID': [String]: new programId,
    * }
    */
    const response = await fetch(MODIFY_PROGRAM_ID, {
        method: 'POST',
        credentials: 'include',
        headers: await headerGenerator(true),
        body: JSON.stringify(requestBody),
    });
    await handleErrors(response)
    const oldProgramID = requestBody.ProgramID;
    const records = await getRecordByProgram(oldProgramID);

    for (const recordID of Object.keys(records)) {
        await deleteRecord(recordID);
    }
    await deleteProgramDesc(oldProgramID);
    await getPrograms(true);
    await getApplicants(true);

}