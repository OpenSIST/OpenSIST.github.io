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
        ]
    };
}

export async function fetchProgramList(url = "https://opensist-auth.caoster.workers.dev/api/list/program", session = null) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`,
        },
    });
    return response.json();
}

export async function addModifyProgram(data, url = "https://opensist-auth.caoster.workers.dev/api/mutating/new_modify_program", session = null) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`,
        },
        body: JSON.stringify(data),
    });
    return response;
}

export default fetch_url;