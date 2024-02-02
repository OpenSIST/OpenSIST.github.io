import univList from "./univ_list.json";


export const DescriptionTemplate = `## 项目介绍

## 项目介绍

## 其他注意事项

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