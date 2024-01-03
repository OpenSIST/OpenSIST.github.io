import localforage from "localforage";
import {ADD_MODIFY_PROGRAM, PROGRAM_DESC, PROGRAM_LIST} from "../APIs/APIs";
import {handleErrors} from "./Common";


export async function getPrograms(isRefresh = false) {
    /*
    * Get the list of programs (without description) from the server or local storage
    * @param isRefresh [Boolean]: whether to refresh the data
    * @return: list of programs (without description)
     */
    let programs = await localforage.getItem('programs');
    if (isRefresh || programs === null || (Date.now() - programs.Date) > 24 * 60 * 60 * 1000) {
        const response = await fetch(PROGRAM_LIST, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        await handleErrors(response)
        programs = (await response.json());
        await setPrograms(programs['data'])
    }
    return programs['data'];
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
    if (isRefresh || programDesc === null || (Date.now() - programDesc.Date) > 24 * 60 * 60 * 1000) {
        const session = await localforage.getItem('session')
        const response = await fetch(PROGRAM_DESC, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session}`,
            },
            body: JSON.stringify({'ProgramID': programId}),
        });
        await handleErrors(response)

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
    programs = {'data': programs, 'Date': Date.now()}
    await localforage.setItem('programs', programs);
}

export async function setProgram(program) {
    /*
    * Set the program (without description) to the local storage (i.e. localforage.getItem('programs'))
    * @param program [Object]: program (without description)
     */
    const programs = await getPrograms();
    const univName = program.ProgramID.split('@')[1]
    if (programs[univName] === undefined) {
        programs[univName] = []
    }
    programs[univName] = programs[univName].filter(p => p.ProgramID !== program.ProgramID);
    programs[univName].push(program);
    await setPrograms(programs);
}

export async function setProgramDesc(programId, programDesc) {
    /*
    * Set the description of the program to the local storage (i.e. localforage.getItem(`${programId}-Desc`))
    * @param programId [String]: programId
    * @param programDesc [String]: description of the program
     */
    programDesc = {'description': programDesc, 'Date': Date.now()}
    await localforage.setItem(`${programId}-Desc`, programDesc);
}

export async function setProgramContent(requestBody) {
    /*
    * Set the program (with description) to the local storage (i.e. localforage.getItem('programs') and localforage.getItem(`${programId}-Desc`), and post to the server.
    * @param program [Object]: program (with description)
     */

    const response = await fetch(ADD_MODIFY_PROGRAM, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await localforage.getItem('session')}`,
        },
        body: JSON.stringify({
            newProgram: requestBody.newProgram,
            content: {...(requestBody.content), Applicants: []},
        }),
    });

    await handleErrors(response)

    const program = requestBody.content;
    await setProgram(program);
    await setProgramDesc(program.ProgramID, program.Description);
}
