import univList from "./univ_list.json";


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

export const majorList = ['CS', 'EE', 'IE'];
export const majorOptions = list2Options(majorList);

export const degreeList = ['Master', 'PhD'];
export const degreeOptions = list2Options(degreeList);

export const regionList = ['US', 'CA', 'EU', 'UK', 'HK', 'SG', 'Others']
export const regionOptions = list2Options(regionList);

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

export const EnglishExamMapping = {
    GRE: {
        'Total': 'GRE 总分',
        'V': 'GRE 语文',
        'Q': 'GRE 数学',
        'W': 'GRE 写作',
    },
    TOEFL: {
        'Total': 'TOEFL 总分',
        'R': 'TOEFL 阅读',
        'L': 'TOEFL 听力',
        'S': 'TOEFL 口语',
        'W': 'TOEFL 写作',
    },
    IELTS: {
        'Total': 'IELTS 总分',
        'R': 'IELTS 阅读',
        'L': 'IELTS 听力',
        'S': 'IELTS 口语',
        'W': 'IELTS 写作',
    }
}