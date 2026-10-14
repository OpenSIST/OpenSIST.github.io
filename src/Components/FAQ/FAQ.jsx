import React, {useMemo, useState} from "react";
import {Accordion, AccordionDetails, AccordionSummary, Box, InputAdornment, Link as MuiLink, List, ListItem, Paper, Tab, Tabs, TextField, Typography} from "@mui/material";
import {ExpandMore, SearchRounded} from "@mui/icons-material";
import {AboutUs} from "./AboutUs";
import {AgreementContent} from "../Agreement/Agreement";

const faqItems = [
    {
        question: "为什么要强制使用上科大邮箱进行用户注册？",
        answer: (
            <Typography>
                我们建立OpenSIST时，希望只有上科大的内部人员（在校生/校友/教授/职工等）才能使用OpenSIST。
                因此我们强制使用上科大邮箱进行用户注册，以保证OpenSIST的数据安全性，防止外部人员直接获取网站数据，从而保护校内人员的隐私。
            </Typography>
        ),
    },
    {
        question: "我目前是一名大四/研三的学生，并且使用了上科大邮箱注册了账号，当我毕业之后，上科大邮箱失效，我的账号会怎么样？",
        answer: (
            <Typography>
                OpenSIST的数据（申请数据等）只绑定邮箱前缀，所以不论是@shanghaitech.edu.cn还是@alumni.shanghaitech.edu.cn，
                只要邮箱前缀相同，两个邮箱均可自动绑定到同一用户。毕业之后继续使用OpenSIST时，只需要使用alumni邮箱重新注册，即可继承原用户信息。
            </Typography>
        ),
    },
    {
        question: "为什么往年录取数据汇总中的用户显示为邮箱前缀@申请年份，不方便认出申请者的姓名？",
        answer: (
            <Typography>
                OpenSIST的初衷是帮助未来上科大的学弟学妹进行更好的留学规划，并不是满足同学之间的八卦和好奇。
                网站提供的申请者信息已经足够用户进行选校定位，申请人的真实姓名对于选校而言并不重要。
                如果申请者自愿提供联系方式，用户可以在往年录取数据汇总的申请人信息中找到联系方式并点击复制。
            </Typography>
        ),
    },
    {
        question: "我在OpenSIST上看到了一些错误的信息，我可以直接修改吗？",
        answer: (
            <List dense sx={{listStyleType: 'disc', pl: 3, '& .MuiListItem-root': {display: 'list-item', px: 0}}}>
                <ListItem>项目信息表数据来源于用户创建。我们鼓励用户创建更多项目信息；如果发现错误，可以点击项目描述中的修改按钮直接修改。</ListItem>
                <ListItem>对于往年录取数据汇总和申请分享贴的数据，用户只能修改自己创建的信息，不能直接修改其他用户创建的信息。</ListItem>
                <ListItem>
                    对于其他错误信息，可以前往GitHub提出&nbsp;
                    <MuiLink href="https://github.com/OpenSIST/OpenSIST.github.io/issues" target="_blank" rel="noopener noreferrer">
                        issue
                    </MuiLink>
                    ，我们会尽快处理。
                </ListItem>
            </List>
        ),
    },
    {
        question: "我在添加项目信息时，找不到我的项目所属的学校，怎么办？",
        answer: (
            <Typography>
                如果项目所属的学校不在学校列表中，请到GitHub的&nbsp;
                <MuiLink href="https://github.com/orgs/OpenSIST/discussions/23" target="_blank" rel="noopener noreferrer">
                    Discussion
                </MuiLink>
                &nbsp;中提出需要添加的学校名称，我们会尽快处理。
            </Typography>
        ),
    },
    {
        question: "我是一名小白，我觉得网站上数据不足够帮助我选校，希望能够咨询一些学长学姐，怎么办？",
        answer: (
            <Typography>
                我们提供了QQ群，你可以加入QQ群进行交流。群号：
                <MuiLink
                    href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=8WAM3ZWxdfZYR0RsfOYBkvqyZMGIe6OY&authKey=wdhr9%2FDihgHL4iFbUTjw8x0h6R2SNyVNfxszrzKtRMV3Ytr10IC8kZpPU7e%2Bwdwx&noverify=0&group_code=132055126"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    132055126
                </MuiLink>
                。
            </Typography>
        ),
    },
];

const glossarySections = [
    {
        title: "网站 / 申请相关",
        terms: [
            "dp: datapoints",
            "IE: 信息学院的研究生专业，全称Information Engineering",
            "SCA: 创意与艺术学院的简称，全称School of Creativity and Art",
            "AD: Admission",
            "Rej: Rejection",
            "PoI: Professor of Interest",
            "LoR: Letter of Recommendation",
            "Pub: Publication",
            "ap: assistant professor",
            "STEM: Science, Technology, Engineering, and Math",
            "SDE: Software Development Engineer",
            "MLE: Machine Learning Engineer",
            "DS: Data Science",
            "CSE: 有时指Computer Science and Engineering，有时指Computational Science and Engineering",
            "MS/MSc: Master of Science",
            "MSE: 一般指Master of Science and Engineering，少数情况指Master of Software Engineering",
            "MASc: Master of Applied Science",
            "MEng: Master of Engineering",
            "ScM: Science Master",
            "MPhil: Master of Philosophy",
            "PhD: Doctor of Philosophy",
            "deposit: 接offer后要交的押金，俗称占位费，正式入学后会抵扣等额的学费",
            "TA: Teaching Assistant",
            "RA: Research Assistant",
            "bar: 项目录取的准入门槛",
            "co-op: Cooperative education，学期内官方带薪实习。",
            "GPA: Grade Point Average，平均绩点",
            "GRE: Graduate Record Examination，美国研究生入学标化考试",
            "TOEFL: 托福，英语水平考试",
            "IELTS: 雅思，英语水平考试",
            "DET: Duolingo English Test，多邻国英语测试",
            "SoP: Statement of Purpose，目的陈述（学术动机文书）",
            "PS: Personal Statement，个人陈述",
            "CV: Curriculum Vitae，学术简历",
            "WES: World Education Services，成绩单/学历认证机构",
            "offer: 录取通知",
            "WL: Waitlist，候补名单",
            "rolling: 滚动录取，先到先审、招满为止",
            "conditional offer: 有条件录取，需满足特定条件后正式入学",
            "safety/target/reach: 保底/匹配/冲刺，选校档次的划分",
            "funding/fully-funded: 资助/全额资助，通常免学费并发放津贴",
            "fellowship: 奖学金，通常免学费并发放津贴且无工作义务",
            "stipend: 津贴/生活补助",
        ],
    },
    {
        title: "签证 / 身份 / 求职相关",
        terms: [
            "I20: 接offer之后学校签发的文件，是维持在美国学生身份的唯一合法文件，办签证必带",
            "F-1: 美国的学生签证",
            "J-1: 美国的访问学者签证，一般用于暑研等用途",
            "OPT: Optional Practical Training，美国高校毕业后的临时工作身份，时长一年，STEM专业的毕业生可以申请延期两年，共三年",
            "CPT: Curricular Practical Training，学期内的实习许可身份",
            "H1B: 美国的工作签证，一般需要公司帮助申请，目前是每年3月份抽签，一人每年只能抽一次，一共可以抽三年；如果抽中，就获得了在美国正式的工作许可，且可以让公司担保办理绿卡",
            "CBP: Customs and Border Protection，美国海关与边境保护局，负责入境出境的检查",
            "IRCC: 加拿大移民局，负责加拿大签证的审核和签发",
            "NG: New Grad，是美国就业市场中的概念，对应着国内的应届毕业生的概念",
            "BCPNP: 加拿大不列颠哥伦比亚省提名移民计划",
            "ONIP: 加拿大安大略省提名移民计划",
            "GC: Green Card，美国绿卡（永久居留权）",
            "PR: Permanent Resident，永久居民（加拿大等）",
            "EAD: Employment Authorization Document，美国工作许可卡",
            "SSN: Social Security Number，美国社会安全号",
            "SIN: Social Insurance Number，加拿大社会保险号",
            "DS-160: 美国非移民签证在线申请表",
            "SEVIS: 学生与交流访问者信息系统，缴纳SEVIS费后由学校签发",
            "PGWP: Post-Graduation Work Permit，加拿大毕业后工签",
            "EE: Express Entry，加拿大快速通道移民",
            "NIW: National Interest Waiver，美国国家利益豁免（职业移民绿卡途径）",
        ],
    },
];

function splitTerm(s) {
    const i = s.indexOf(": ");
    return i < 0 ? {term: s, def: ""} : {term: s.slice(0, i), def: s.slice(i + 2)};
}

function FaqAccordion({question, children}) {
    return (
        <Accordion
            disableGutters
            elevation={0}
            square
            sx={{
                bgcolor: 'transparent',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:before': {display: 'none'},
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMore sx={{color: 'primary.main'}}/>}
                sx={{px: 0.5, '& .MuiAccordionSummary-content': {my: 1.75}}}
            >
                <Typography sx={{fontWeight: 600}}>{question}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{px: 0.5, pb: 2.5, color: 'text.secondary'}}>
                {children}
            </AccordionDetails>
        </Accordion>
    );
}

function GlossaryPanel() {
    const [query, setQuery] = useState("");
    const q = query.trim().toLowerCase();
    const sections = useMemo(() => glossarySections
        .map((section) => ({
            title: section.title,
            terms: section.terms
                .map(splitTerm)
                .filter(({term, def}) => !q || term.toLowerCase().includes(q) || def.toLowerCase().includes(q)),
        }))
        .filter((section) => section.terms.length > 0), [q]);

    return (
        <Box>
            <TextField
                size="small"
                placeholder="搜索缩写或释义…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{mb: 3, width: '100%', maxWidth: 360}}
                InputProps={{startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small"/></InputAdornment>}}
            />
            {sections.length === 0 && <Typography color="text.secondary">未找到匹配的词条</Typography>}
            {sections.map((section) => (
                <Box key={section.title} sx={{mb: 3.5}}>
                    <Typography sx={{fontWeight: 600, color: 'text.secondary', fontSize: 13, letterSpacing: '0.04em', mb: 1}}>
                        {section.title}
                    </Typography>
                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, columnGap: 4, rowGap: 0}}>
                        {section.terms.map(({term, def}) => (
                            <Box
                                key={term}
                                sx={{
                                    display: 'flex',
                                    gap: 1.5,
                                    alignItems: 'baseline',
                                    py: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography
                                    component="span"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        fontFamily: '"SF Mono", ui-monospace, Menlo, monospace',
                                        fontSize: 13,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        minWidth: 56,
                                    }}
                                >
                                    {term}
                                </Typography>
                                <Typography component="span" variant="body2" sx={{color: 'text.secondary'}}>
                                    {def}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export default function FAQ() {
    const [tab, setTab] = useState(0);
    return (
        <Paper
            elevation={0}
            sx={{
                bgcolor: (theme) => theme.palette.background.default,
                overflowY: "auto",
                width: "100%",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Box sx={{width: "100%", maxWidth: 980, px: {xs: 2, sm: 3}, py: 3}}>
                <Typography variant="h4" sx={{fontWeight: 600, mb: 0.5}}>帮助中心</Typography>
                <Typography sx={{color: "text.secondary", mb: 2}}>常见问题、名词缩写、关于我们与用户协议</Typography>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{mb: 3, borderBottom: "1px solid", borderColor: "divider", "& .MuiTab-root": {textTransform: "none", fontSize: 15}}}
                >
                    <Tab label="常见问题"/>
                    <Tab label="名词缩写"/>
                    <Tab label="关于我们"/>
                    <Tab label="用户协议"/>
                </Tabs>

                {tab === 0 && (
                    <Box>
                        {faqItems.map((item) => (
                            <FaqAccordion key={item.question} question={item.question}>
                                {item.answer}
                            </FaqAccordion>
                        ))}
                    </Box>
                )}
                {tab === 1 && <GlossaryPanel/>}
                {tab === 2 && <AboutUs sx={{width: "100%", p: 0}}/>}
                {tab === 3 && <Box sx={{color: "text.secondary"}}><AgreementContent/></Box>}
            </Box>
        </Paper>
    );
}
