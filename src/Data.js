async function fetch_url(url) {
    return {
        "MIT": {
            'MSCSE': {'test info for frontend': {}},
        },
        "Stanford": {
            'MSCS': {'test info for frontend': {}},
            'MSEE': {'test info for frontend': {}}
        },
        "UCB": {
            'MSCS': {'test info for frontend': {}},
            'MEng': {'test info for frontend': {}}
        },
        "CMU": {
            'MSCS': {'test info for frontend': {}},
            'MSR': {'test info for frontend': {}},
            'MLT': {'test info for frontend': {}},
            'MSCV': {'test info for frontend': {}},
            'MSML': {'test info for frontend': {}},
            'MSDS': {'test info for frontend': {}},
            'MSAII': {'test info for frontend': {}},
            'MIIS': {'test info for frontend': {}},
        }
    };
}

const Applicant = {
    "Email": "XiaomingLi",
    "Gender": "Female", // Female / Male / Others
    "CurrentDegree": "Undergraduate", // Undergraduate / Master
    "Year": "2024",
    "Semester": "Fall",
    "Major": "CS", // CS / EE / IE
    "GPA": "3.99",
    "Ranking": {
        "Rank": "1",
        "Total": "200", // Total number of students in the MAJOR
    },
    "GRE": { // Example :) Not me...
        "Total": "335",
        "V": "165",
        "Q": "170",
        "W": "5.5",
    },
    "EnglishProficiency": {
        "TOEFL": {
            "Total": "116",
            "S": "29",
            "R": "29",
            "L": "29",
            "W": "29",
        },
        "IELTS": {
            "Total": "7.0",
            "S": "6.0",
            "R": "6.5",
            "L": "8.0",
            "W": "8.0",
        },
    },
    "Exchange": [
        {
            "University": "University of California, Berkeley",
            "TimeLine": {
                "Start": "2021-01-01",
                "End": "2021-01-01",
            },
            "Detail": "I have done an exchange program in UC Berkeley for 1 year.",
        },
        {
            "University": "Massachusetts Institute of Technology",
            "TimeLine": {
                "Start": "2021-01-01",
                "End": "2021-01-01",
            },
            "Detail": "I have done an exchange program in UC Berkeley for 1 year.",
        }
    ],
    "Publication": [
        {
            "Type": "Conference", // Conference / Journal
            "Name": "CVPR",
            "AuthorOrder": "I am the first author", // Describe by yourself
            "Status": "Accepted", // Accepted / Rejected / UnderReview
            "Detail": "I am the first author of this paper.",
        },
    ],
    "Research": {
        "Focus": "Computer Vision",
        "Domestic": {
            "Num": "2",
            "Detail": "I have done research in the field of computer vision for 2 years. I have published 2 papers in CVPR and 1 paper in ICCV. I have also done 2 internships in the field of computer vision.",
        },
        "International": {
            "Num": "1",
            "Detail": "I have done research in the field of computer vision for 1 year. I have published 1 paper in CVPR and 1 paper in ICCV. I have also done 1 internship in the field of computer vision.",
        },
    },
    "Internship": {
        "Domestic": {
            "Num": "2",
            "Detail": "I have done 2 internships in the field of computer vision.",
        },
        "International": {
            "Num": "1",
            "Detail": "I have done 1 internship in the field of computer vision.",
        },
    },
    "Recommendation": [
        {
            "Type": ["Course", "TA"], // Research / Course / TA / Internship
            "Detail": "A strong letter from a bigwig professor in the field of computer vision.",
        },
    ],
    "Results": ["Record ID 1", "Record ID 2"], // Can only record programID, but subject to change
    "Contact": "homepage/email/others"
}

const Program = {
    "University": "Name",
    "TargetApplicantMajor": "CS", // CS / EE / IE
    "ID": "MSCS@Name",
    "Description": "This is description.",
    "Applicants": ["id1", "id2"],
}

const Record = {
    "RecordID": "XiaomingLi|MSCS@Name", // ApplicantID|ProgramID
    "ApplicantID": "XiaomingLi",
    "ProgramID": "MSCS@Name",
    "Year": "2024",
    "Semester": "Fall",
    "Status": "Admit", // Admit / Reject / Waitlist
    "TimeLine": {
        "Submit": "2021-01-01",
        "Interview": "2021-01-01",
        "Decision": "2021-01-01",
    },
    "Detail": "Include sth like deferred to this semester",
}

export default fetch_url;