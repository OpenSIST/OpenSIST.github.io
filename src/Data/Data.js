export async function fetchProgramList(url = "https://opensist-auth.caoster.workers.dev/api/static_data/programs") {
    const cacheName = 'programListCache';
    const cache = await caches.open(cacheName);
    await cache.delete(url); // TODO: delete this
    let response = await cache.match(url);

    if (!response || (Date.now() - Date.parse(response.headers.get('Date'))) > 24 * 60 * 60 * 1000) {
        response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        await cache.put(url, response.clone());
    }
    return (await response.json())['data'];
}

export async function fetchProgramDesc({
                                           url = "https://opensist-auth.caoster.workers.dev/api/query/program_description",
                                           session= "",
                                           ProgramID = ""
                                       }) {
    const cacheUrl = `${url}?ProgramID=${ProgramID}`;
    const cacheName = 'programDescCache';
    const cache = await caches.open(cacheName);
    await cache.delete(cacheUrl); // TODO: delete this
    let response = await cache.match(cacheUrl);

    if (!response || (Date.now() - Date.parse(response.headers.get('Date'))) > 24 * 60 * 60 * 1000) {
        response = await fetch(url, {
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
                                           url = "https://opensist-auth.caoster.workers.dev/api/mutating/new_modify_program",
                                           session= "",
                                           data
                                       }) {
    return await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`,
        },
        body: JSON.stringify(data),
    });
}
