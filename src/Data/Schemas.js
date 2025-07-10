import univList from "./UnivList.json";

export const DescriptionTemplate = `## 项目介绍

* 待补充

## 录取偏好/条件

* 待补充

## 其他注意事项

* 例：网申材料、套磁等
`

export function list2Options(list) {
    return list.map((item) => {
        return {
            value: item,
            label: item
        }
    })
}

export function dict2Options(dict) {
    return Object.entries(dict).map(([key, value]) => {
        return {
            value: key,
            label: value
        }
    })
}

export const majorList = ['CS', 'EE', 'IE', 'BME', 'SCA', 'BioSci', 'BioTech'];
export const majorOptions = list2Options(majorList);

export const degreeList = ['Master', 'PhD'];
export const degreeOptions = list2Options(degreeList);

export const regionList = ['US', 'CA', 'EU', 'UK', 'HK', 'SG', 'Others']

const sortedUnivList = [...univList].sort((a, b) => {
    return a['fullName'].localeCompare(b['fullName']);
});

export const univOptions = sortedUnivList.map((univ) => {
    return {
        value: univ['abbr'],
        label: univ['fullName'] === univ['abbr'] ? `${univ['fullName']}` : `${univ['fullName']} (${univ['abbr']})`,
        region: univ['region'],
    }
});

export const genderMapping = {
    'Male': '男',
    'Female': '女',
    'Others': '非二元性别',
    'PNTS': '不愿透露'
}

export const genderOptions = dict2Options(genderMapping);

export const currentDegreeMapping = {
    'Undergraduate': '本科生',
    'Master': '硕士生',
}
export const currentDegreeOptions = dict2Options(currentDegreeMapping);

export const applicationYearOptions = Array.from({length: 12}, (_, i) => {
    const year = 2016 + i;
    return {value: year, label: `${year}`};
}).reverse();

export const rankPercentOptions = [
    {value: '1', label: 'Top 1%'},
    {value: '3', label: 'Top 3%'},
    {value: '5', label: 'Top 5%'},
    {value: '10', label: 'Top 10%'},
    {value: '15', label: 'Top 15%'},
    {value: '20', label: 'Top 20%'},
    {value: '30', label: 'Top 30%'},
    {value: '40', label: 'Top 40%'},
    {value: '50', label: 'Top 50%'},
    {value: '50+', label: 'Top 50%+'},
];

export const rankPercentSliderValueMapping = {
    '1': 95,
    '3': 90,
    '5': 85,
    '10': 80,
    '15': 75,
    '20': 70,
    '30': 60,
    '40': 50,
    '50': 40,
    '50+': 30,
}

export const SliderValueRankStringMapping = {
    95: "Top 1%",
    90: "Top 3%",
    85: "Top 5%",
    80: "Top 10%",
    75: "Top 15%",
    70: "Top 20%",
    60: "Top 30%",
    50: "Top 40%",
    40: "Top 50%",
    30: "Top 50%+",
}

export const englishOptions = list2Options(['TOEFL', 'IELTS']);

export const exchangeDurationMapping = {
    'Semester': '一学期',
    'Year': '一学年'
}
export const exchangeDurationOptions = dict2Options(exchangeDurationMapping);

export const exchangeUnivFullNameMapping = {
    MIT: 'Massachusetts Institute of Technology (MIT)',
    UCB: 'University of California, Berkeley (UCB)',
    UMich: 'University of Michigan, Ann Arbor (UMich)',
    Cornell: 'Cornell University (Cornell)',
    "UW-Madison": 'University of Wisconsin-Madison (UW-Madison)',
    UPenn: 'University of Pennsylvania (UPenn)',
    Yale: 'Yale University (Yale)',
    Harvard: 'Harvard University (Harvard)',
    UIUC: 'University of Illinois at Urbana-Champaign (UIUC)',
    UChicago: 'University of Chicago (UChicago)',
    Hebrew: 'Hebrew University of Jerusalem (Hebrew)',
    Drexel: 'Drexel University (Drexel)',
    Padua: 'University of Padua (Padua)'
}

export const exchangeUnivList = [
    'MIT',
    'UCB',
    'UMich',
    'Cornell',
    'UW-Madison',
    'UPenn',
    'Yale',
    'Harvard',
    'UIUC',
    'UChicago',
    'Hebrew',
    'Drexel',
    'Padua'
]

export const publicationTypeMapping = {
    'Journal': '期刊',
    'Conference': '会议',
    'Workshop': 'Workshop'
}

export const publicationTypeOptions = dict2Options(publicationTypeMapping);

export const publicationStatusMapping = {
    'Accepted': '已录用',
    'UnderReview': '在投'
}
export const publicationStatusOptions = dict2Options(publicationStatusMapping);

export const authorOrderMapping = {
    'First': '第一作者',
    'Co-first': '共同第一作者',
    'Second': '第二作者',
    'Co-second': '共同第二作者',
    'Other': '三作及以后'
}
export const authorOrderOptions = dict2Options(authorOrderMapping);


export const recommendationTypeMapping = {
    'Research': '科研推',
    'Course': '课程推',
    'TA': 'TA推',
    'Internship': '实习推',
    'Competition': '竞赛推'
}
export const recommendationTypeOptions = dict2Options(recommendationTypeMapping);
export const recordStatusList = ['Admit', 'Reject', 'Waitlist', 'Defer']
export const recordStatusOptions = list2Options(recordStatusList);

export const recordSemesterList = ['Fall', 'Spring', 'Summer', 'Winter']
export const recordSemesterOptions = list2Options(recordSemesterList);

export const EnglishExamMapping = {
    GRE: {
        'Total': '总分',
        'V': '语文',
        'Q': '数学',
        'AW': '写作',
    },
    TOEFL: {
        'Total': 'TOEFL 总分',
        'R': '阅读',
        'L': '听力',
        'S': '口语',
        'W': '写作',
    },
    IELTS: {
        'Total': 'IELTS 总分',
        'R': '阅读',
        'L': '听力',
        'S': '口语',
        'W': '写作',
    },
    "语言成绩": {
        'Total': '总分',
        'R': '阅读',
        'L': '听力',
        'S': '口语',
        'W': '写作',
    }
}

export const RecordStatusPalette = {
    'Admit': 'admit',
    'Reject': 'reject',
    'Waitlist': 'default',
    'Defer': 'defer',
}
export const SemesterPalette = {
    'Fall': 'fall',
    'Spring': 'spring',
    'Summer': 'secondary',
    'Winter': 'info',
}
export const regionFlagMapping = {
    "US": "\u{1F1FA}\u{1F1F8}",
    "EU": "\u{1F1EA}\u{1F1FA}",
    "UK": "\u{1F1EC}\u{1F1E7}",
    "CA": "\u{1F1E8}\u{1F1E6}",
    "HK": "\u{1F1ED}\u{1F1F0}",
    "SG": "\u{1F1F8}\u{1F1EC}",
    'Others': ''
}
