import {PROGRAM_LIST, PROGRAM_DESC, ADD_MODIFY_PROGRAM} from "../APIs/APIs"
export async function fetchProgramList(forceFetch = false) {
    const cacheName = 'programListCache';
    const cache = await caches.open(cacheName);
    let response = await cache.match(PROGRAM_LIST);

    if (forceFetch || !response || (Date.now() - Date.parse(response.headers.get('Date'))) > 24 * 60 * 60 * 1000) {
        response = await fetch(PROGRAM_LIST, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        await cache.put(PROGRAM_LIST, response.clone());
    }
    return (await response.json())['data'];
}

export async function fetchProgramDesc({
                                           session = "",
                                           ProgramID = "",
                                           forceFetch = false
                                       }) {
    const cacheUrl = `${PROGRAM_DESC}?ProgramID=${ProgramID}`;
    const cacheName = 'programDescCache';
    const cache = await caches.open(cacheName);
    let response = await cache.match(cacheUrl);

    if (forceFetch || !response || (Date.now() - Date.parse(response.headers.get('Date'))) > 24 * 60 * 60 * 1000) {
        response = await fetch(PROGRAM_DESC, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session}`,
            },
            body: JSON.stringify({'ProgramID': ProgramID}),
        });
        await cache.put(cacheUrl, response.clone());
    }
    return (await response.json())['description'];
}

export async function addModifyProgram({
                                           session = "",
                                           data
                                       }) {
    return await fetch(ADD_MODIFY_PROGRAM, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`,
        },
        body: JSON.stringify(data),
    });
}
