import {Link} from "react-router-dom";
import {
    Avatar, Box,
    Card,
    CardActionArea,
    CardHeader, Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {OpenSIST} from "../common";

export function AboutUs() {
    const developers = ['cst', 'cze', 'frm', 'lbn'];

    const displayRealName = (username) => {
        switch (username) {
            case 'cze':
                return '迟择恩 - 前端开发'
            case 'lbn':
                return '李炳楠 - 前端开发'
            case 'cst':
                return '陈溯汀 - 后端开发'
            case 'frm':
                return '范润铭 - 设计师'
            default:
                return '未知'
        }
    }

    const displayMajor = (username) => {
        switch (username) {
            case 'cze':
                return '2020级CS本科生'
            case 'lbn':
                return '2020级CS本科生'
            case 'cst':
                return '2020级CS本科生'
            case 'frm':
                return '2021级创艺本科生'
            default:
                return '未知'
        }
    }

    const getHyperlink = (username) => {
        switch (username) {
            case 'cze':
                return 'https://www.harrychi.com';
            case 'lbn':
                return 'https://www.bingnanli.com';
            case 'cst':
                return 'https://github.com/caoster';
            case 'frm':
                return 'https://github.com/Fan-runming';
            default:
                return 'https://sist.shanghaitech.edu.cn';
        }
    }

    return (
        <Box sx={{width: '70%', p: '1rem'}}>
            <Typography variant="h4" sx={{textAlign: 'center'}}>关于我们</Typography>
            <Typography variant='h5'>我们是谁？（按姓氏排序）</Typography>
            <Grid2
                container
                spacing={2}
            >
                {developers.map(developer =>
                    <Grid2 key={developer} xs={12} sm={6} lg={3}>
                        <Card>
                            <CardActionArea
                                component={Link}
                                to={getHyperlink(developer)}
                            >
                                <CardHeader
                                    avatar={
                                        <Avatar alt={developer} src={developer === 'frm' ? `/avatars/${developer}.png` : `/avatars/${developer}.jpeg`}/>}
                                    title={displayRealName(developer)}
                                    subheader={displayMajor(developer)}
                                />
                            </CardActionArea>
                        </Card>
                    </Grid2>
                )}
            </Grid2>
            <Typography variant='h5' sx={{mt: '0.9rem'}}>为何创立<OpenSIST props={{variant: 'h5'}}/>？</Typography>
            <p>
                上科大作为一所新兴高校，在我们开发这个项目的时候仅有6届本科毕业生，其中出国申请的人每届有1/3左右。尽管学院负责学生生涯发展的倪鹤南老师近几年为搭建信息学院出国留学信息交流平台做出过努力，例如组建出国交流群、统计出国留学去向等，上道书院从2023年开始也推出了飞跃手册，但这些努力由于一些客观因素，仍然未能很大程度上解决同学们申请季的痛点：<b>往年信院申请admit/reject情况不明朗。</b>
                因此针对这个问题，我们借鉴<a href='https://opencs.app/'>OpenCS</a>和<a
                href='https://global-cs-application.github.io/'>Global CS</a>的设计，希望能够为学弟学妹们提供专属于上科大的更加透明的申请信息平台，让大家能够更加清晰地了解往届学生的申请情况，从而更好地规划自己的申请策略。
            </p>
            <Typography variant='h5'>联系我们</Typography>
            <p><b>如果您愿意参与OpenSIST后续的前端/后端维护工作，欢迎加入<a href='https://qm.qq.com/q/NyTIRw8PGC'>开发者QQ群：766590153</a>联系我们，大二以上非毕业生优先（包括研究生）</b></p>
            <p>如果您在使用中遇到了问题，欢迎前往<a href='https://github.com/OpenSIST/OpenSIST.github.io/issues'>GitHub
                Official Repository</a>中提出Issue。</p>
        </Box>
    )
}