import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Avatar, List, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {useSmallPage} from "../common";

async function getUser(usernames) {
    return Promise.all(usernames.map(username => fetch(`https://api.github.com/users/${username}`)
        .then(response => response.json())
        .then(response => {
            return response;
        })))
}

export function AboutUs() {
    const [developers, setDevelopers] = useState([]);
    useEffect(() => {
        getUser(['boynextdoor-cze', 'cuttle-fish-my', 'caoster', 'Fan-Runming']).then(users => {
            setDevelopers(users);
        })
    }, []);
    // console.log(developers)

    const displayRealName = (username) => {
        switch (username) {
            case 'boynextdoor-cze':
                return '迟择恩'
            case 'cuttle-fish-my':
                return '李炳楠'
            case 'caoster':
                return '陈溯汀'
            case 'Fan-Runming':
                return '范润铭'
            default:
                return '未知'
        }
    }

    const displayMajor = (username) => {
        switch (username) {
            case 'boynextdoor-cze':
                return '2020级CS本科生 - 前端开发'
            case 'cuttle-fish-my':
                return '2020级CS本科生 - 前端开发'
            case 'caoster':
                return '2020级CS本科生 - 后端开发'
            case 'Fan-Runming':
                return '2021级创艺本科生 - 设计师'
            default:
                return '未知'
        }
    }

    const smallPage = useSmallPage();

    return (
        <div style={{width: '70%'}}>
            <h1 style={{textAlign: 'center'}}><b>关于我们</b></h1>
            <h3>我们是谁？</h3>
            <List sx={{display: 'flex', flexDirection: smallPage ? 'column' : 'row', justifyContent: 'center'}}>
                {developers.map(developer =>
                    <ListItem key={developer.login} component={Link} to={developer.html_url}>
                        <ListItemAvatar>
                            <Avatar alt={developer.login} src={developer.avatar_url} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={displayRealName(developer.login)}
                            secondary={displayMajor(developer.login)}
                        />
                    </ListItem>
                )}
            </List>
            <h3>为何创立OpenSIST？</h3>
            <p>
                上科大作为一所新兴高校，在我们开发这个项目的时候仅有6届本科毕业生，其中出国申请的人每届有1/3左右。尽管学院负责学生生涯发展的倪鹤南老师近几年为搭建信息学院出国留学信息交流平台做出过努力，例如组建出国交流群、统计出国留学去向等，上道书院从2023年开始也推出了飞跃手册，但这些努力由于一些客观因素，仍然未能很大程度上解决同学们申请季的痛点：<b>往年信院申请admit/reject情况不明朗。</b>
                因此针对这个问题，我们借鉴<a href='https://opencs.app/'>OpenCS</a>和<a
                href='https://global-cs-application.github.io/'>Global CS</a>的设计，希望能够为学弟学妹们提供专属于上科大的更加透明的申请信息平台，让大家能够更加清晰地了解往届学生的申请情况，从而更好地规划自己的申请策略。
            </p>
            <h3>联系我们</h3>
            <p><b>如果您愿意参与OpenSIST后续的前端/后端维护工作，欢迎加入<a href='https://qm.qq.com/q/NyTIRw8PGC'>开发者QQ群：766590153</a>联系我们，大二以上非毕业生优先（包括研究生）</b></p>
            <p>如果您在使用中遇到了问题，欢迎前往<a href='https://github.com/OpenSIST/OpenSIST.github.io/issues'>GitHub
                Official Repository</a>中提出Issue。</p>
        </div>
    )
}