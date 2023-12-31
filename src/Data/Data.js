async function fetch_url(url) {
    return {
        "MIT": [
            {
                name: 'MSCSE',
                description: '# Hi there!\n `code block`\n MSCSE is super hard for all applicants from mainland china!',
            },
        ],
        "Stanford": [
            {
                name: 'MSCS',
                description: '# Master of Science in Computer Science at Stanford University\n' +
                    '\n' +
                    'The Master of Science in Computer Science (MSCS) at Stanford University is a comprehensive and challenging graduate program that offers students the opportunity to deepen their understanding of computer science while developing specialized skills in their areas of interest.\n' +
                    '\n' +
                    '## Program Overview\n' +
                    '\n' +
                    'The MSCS program is designed to provide students with a broad background in computer science while also offering the flexibility to explore specific areas in greater depth. The program includes core courses in areas such as:\n' +
                    '\n' +
                    '- Algorithms and Complexity\n' +
                    '- Computer and Network Security\n' +
                    '- Machine Learning\n' +
                    '- Artificial Intelligence\n' +
                    '- Human-Computer Interaction\n' +
                    '\n' +
                    '## Admission Requirements\n' +
                    '\n' +
                    'Applicants to the MSCS program should have a bachelor\'s degree in computer science or a related field. They should also have a strong academic record and should submit GRE scores, letters of recommendation, a statement of purpose, and a resume or CV.\n' +
                    '\n' +
                    '## Career Opportunities\n' +
                    '\n' +
                    'Graduates of the MSCS program have gone on to successful careers in academia, industry, and government. They work in a variety of roles, including software engineers, data scientists, and systems analysts.\n' +
                    '\n' +
                    'For more information about the MSCS program at Stanford University, please visit the [official website](https://www.stanford.edu/).',
            },
            {
                name: 'MSEE',
                description: 'test info for frontend',
            },
        ],
        "UCB": [
            {
                name: 'MSCS',
                description: 'test info for frontend',
            },
            {
                name: 'EECS MEng',
                description: 'test info for frontend',
            },
        ],
        "CMU": [
            {
                name: 'MSCS',
                description: 'test info for frontend',
            },
            {
                name: 'MSR',
                description: 'test info for frontend',
            },
            {
                name: 'MLT',
                description: 'test info for frontend',
            },
            {
                name: 'MSCV',
                description: 'test info for frontend',
            },
            {
                name: 'MSML',
                description: 'test info for frontend',
            },
            {
                name: 'MSDS',
                description: 'test info for frontend',
            },
            {
                name: 'MSAII',
                description: 'test info for frontend',
            },
            {
                name: 'MIIS',
                description: 'test info for frontend',
            },
        ],
        "CMU1": [
            {
                name: 'MSCS',
                description: 'test info for frontend',
            },
            {
                name: 'MSR',
                description: 'test info for frontend',
            },
            {
                name: 'MLT',
                description: 'test info for frontend',
            },
            {
                name: 'MSCV',
                description: 'test info for frontend',
            },
            {
                name: 'MSML',
                description: 'test info for frontend',
            },
            {
                name: 'MSDS',
                description: 'test info for frontend',
            },
            {
                name: 'MSAII',
                description: 'test info for frontend',
            },
            {
                name: 'MIIS',
                description: 'test info for frontend',
            },
        ],
        "CMU2": [
            {
                name: 'MSCS',
                description: 'test info for frontend',
            },
            {
                name: 'MSR',
                description: 'test info for frontend',
            },
            {
                name: 'MLT',
                description: 'test info for frontend',
            },
            {
                name: 'MSCV',
                description: 'test info for frontend',
            },
            {
                name: 'MSML',
                description: 'test info for frontend',
            },
            {
                name: 'MSDS',
                description: 'test info for frontend',
            },
            {
                name: 'MSAII',
                description: 'test info for frontend',
            },
            {
                name: 'MIIS',
                description: 'test info for frontend',
            },
        ],

    };
}

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

export {fetch_url};
