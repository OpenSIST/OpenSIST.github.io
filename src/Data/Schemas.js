import univList from "./univ_list.json";


export const DescriptionTemplate = `## 项目介绍（如果是Master项目）

### 概况

* 项目时长：xx年/xx月
* 课业压力：
* 是否需要毕业论文：是/否
* 是否强制实习：是/否
* 奖学金情况：有/无
* 有其他的想法可以继续填。。。

### 详细说明

* 例：120学分项目，毕业通常需要两年半到三年
* 可以对上面的任何内容做详细阐述

## 项目介绍（如果是PhD项目）

### 概况

* 强Prof还是强Committee？
* 录取后是不是流转模式
* 奖学金+stipend情况：xxx
* 有其他想法可以自己填。。。

### 详细说明

* 可以对上面的任何内容做详细阐述

## 录取偏好/条件

例：偏好有一篇CV顶会一作+强connection

## 其他注意事项

例：网申材料/套磁`

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