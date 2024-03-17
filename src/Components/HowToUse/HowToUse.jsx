import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Box, Button, Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, ListItem, ListItemButton, Typography
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, {useState} from "react";
import profile from "../../Assets/imgs/profile.png";
import applicant from "../../Assets/imgs/applicant.png";
import newApplicant from "../../Assets/imgs/new-applicant.png";
import record from "../../Assets/imgs/record.png";
import program from "../../Assets/imgs/program.png";
import {Link, useLoaderData} from "react-router-dom";
import {Link as MuiLink} from '@mui/material';
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Grid2 from "@mui/material/Unstable_Grid2";


export function HowToUse() {
    const loaderData = useLoaderData();
    return (
        <div style={{width: '90%'}}>
            <h1 style={{textAlign: 'center'}}>OpenSIST使用指南</h1>
            <Graduated loaderData={loaderData}/>
            <Current/>
        </div>
    )
}

function Graduated({loaderData}) {
    const applicantIDs = loaderData.metaData.ApplicantIDs;
    const [open, setOpen] = useState(false);
    return (
        <Accordion sx={{bgcolor: '#448aff1a'}}>
            <AccordionSummary
                expandIcon={<ArrowDropDownIcon/>}
                sx={{bgcolor: 'rgba(13,60,136,0.1)'}}
            >
                <h2 style={{margin: 0}}><b>毕业生或大四研三请阅读：</b></h2>
            </AccordionSummary>
            <AccordionDetails>
                <h3><b>我来这个网站应该干什么？</b></h3>
                <h5 style={{marginTop: '2rem'}}>
                    <b>为了给SIST学弟学妹们提供更多海外申请的信息，我们希望你能抽出宝贵的一点时间，按个人意愿来做至多四件事情：</b>
                </h5>
                <Box sx={{width: '90%', margin: '2rem 0 0 0'}}>
                    <Grid2 container columnSpacing={7} rowSpacing={3}>
                        <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <Typography variant='h5' sx={{
                                alignSelf: 'center',
                                fontWeight: 'bold'
                            }}>填写你申请时的个人背景（可匿名）</Typography>
                            <Typography variant='body1'
                                        sx={{alignSelf: 'center'}}>考虑到有的人也许会有多于一年的申请经历，因此每个用户可添加多个申请人，以申请年份作区分</Typography>
                            <Button component={Link} to='/profile/new-applicant' variant='contained'>
                                添加申请人
                            </Button>
                        </Grid2>
                        <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <Typography variant='h5' sx={{
                                alignSelf: 'center',
                                fontWeight: 'bold'
                            }}>填写申请项目admit/reject的情况</Typography>
                            <Typography variant='body1'
                                        sx={{alignSelf: 'center'}}>尽可能多地填写自己的申请记录，也就是你申请的各个项目的admit/reject的结果</Typography>
                            <Button variant='contained' onClick={() => setOpen(true)}>
                                添加申请记录
                            </Button>
                        </Grid2>
                        <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <Typography variant='h5' sx={{
                                alignSelf: 'center',
                                fontWeight: 'bold'
                            }}>分享你所了解的海外硕博项目细节</Typography>
                            <Typography variant='body1'
                                        sx={{alignSelf: 'center'}}>如果你对某些项目有着很深入的了解，我们希望你把你了解到的给写上，这样能为学弟学妹们提供更多insight</Typography>
                            <Button component={Link} to='/programs' variant='contained'>
                                添加项目信息
                            </Button>
                        </Grid2>
                        <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <Typography variant='h5' sx={{
                                alignSelf: 'center',
                                fontWeight: 'bold'
                            }}>分享你的申请经验</Typography>
                            <Typography variant='body1'
                                        sx={{alignSelf: 'center'}}>在本站发布申请分享帖，分享你申请过程中的心得体会，包括但不限于选校、套磁、申请总结等方面</Typography>
                            <Button component={Link} to='/posts' variant='contained'>
                                申请分享帖
                            </Button>
                        </Grid2>
                    </Grid2>
                    {/*<Grid2 container columnSpacing={7} rowSpacing={2}>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', justifyContent: 'center'}}>*/}
                    {/*        <Typography variant='h5' sx={{*/}
                    {/*            alignSelf: 'center',*/}
                    {/*            fontWeight: 'bold',*/}
                    {/*            width: '80%'*/}
                    {/*        }}>填写你申请时的<br/>个人背景（可匿名）</Typography>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', justifyContent: 'center'}}>*/}
                    {/*        <Typography variant='h5' sx={{*/}
                    {/*            alignSelf: 'center',*/}
                    {/*            fontWeight: 'bold',*/}
                    {/*            width: '80%'*/}
                    {/*        }}>填写申请项目admit/reject的情况</Typography>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', justifyContent: 'center'}}>*/}
                    {/*        <Typography variant='h5' sx={{*/}
                    {/*            alignSelf: 'center',*/}
                    {/*            fontWeight: 'bold',*/}
                    {/*            width: '80%'*/}
                    {/*        }}>分享你所了解的海外硕博项目细节</Typography>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', justifyContent: 'center'}}>*/}
                    {/*        <Typography variant='h5' sx={{*/}
                    {/*            alignSelf: 'center',*/}
                    {/*            fontWeight: 'bold',*/}
                    {/*            width: '80%'*/}
                    {/*        }}>分享你申请的心得和经验</Typography>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', justifyContent: 'center'}}>*/}
                    {/*        <Typography variant='body1'*/}
                    {/*                    sx={{width: '80%'}}>考虑到有的人也许会有多于一年的申请经历，因此每个用户可添加多个申请人，以申请年份作区分</Typography>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', justifyContent: 'center'}}>*/}
                    {/*        <Typography variant='body1'*/}
                    {/*                    sx={{width: '80%'}}>尽可能多地填写自己的申请记录，也就是你申请的各个项目的admit/reject的结果，最终呈现出来的就像在一亩三分地或opencs上浏览申请结果一样</Typography>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', justifyContent: 'center'}}>*/}
                    {/*        <Typography variant='body1'*/}
                    {/*                    sx={{width: '80%'}}>如果你对某些项目有着很深入的了解，我们希望你把你了解到的给写上，这样能为学弟学妹们提供更多insight</Typography>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', justifyContent: 'center'}}>*/}
                    {/*        <Typography variant='body1'*/}
                    {/*                    sx={{width: '80%'}}>分享帖的内容包括但不限于选校、套磁、申请总结等</Typography>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>*/}
                    {/*        <Button component={Link} to='/profile/new-applicant' variant='contained' sx={{width: '80%'}}>*/}
                    {/*            添加申请人*/}
                    {/*        </Button>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>*/}
                    {/*        <Button variant='contained' onClick={() => setOpen(true)} sx={{width: '80%'}}>*/}
                    {/*            添加申请记录*/}
                    {/*        </Button>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>*/}
                    {/*        <Button component={Link} to='/programs' variant='contained' sx={{width: '80%'}}>*/}
                    {/*            添加项目信息*/}
                    {/*        </Button>*/}
                    {/*    </Grid2>*/}
                    {/*    <Grid2 xs={12} sm={6} md={3} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>*/}
                    {/*        <Button component={Link} to='/posts/new' variant='contained' sx={{width: '80%'}}>*/}
                    {/*            添加帖子*/}
                    {/*        </Button>*/}
                    {/*    </Grid2>*/}
                    {/*</Grid2>*/}
                </Box>
                <Dialog open={open} onClose={() => {
                    setOpen(false);
                }}>
                    <DialogTitle>请选择要添加记录的申请人</DialogTitle>
                    <DialogContent>
                        {applicantIDs.length > 0 ? applicantIDs.map((applicantID, index) => {
                            return (
                                <ListItem key={index}>
                                    <ListItemButton component={Link} to={`/profile/${applicantID}/new-record`}
                                                    sx={{justifyContent: 'center'}}>
                                        <PersonOutlineIcon/> {applicantID}
                                    </ListItemButton>
                                </ListItem>
                            )
                        }) : <DialogContentText>您还没有申请人，请先添加申请人信息</DialogContentText>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setOpen(false);
                        }}>
                            取消
                        </Button>
                    </DialogActions>
                </Dialog>
                <h3><b>申请人信息和申请记录的添加和修改：</b></h3>
                <ol style={{paddingLeft: '1rem'}}>
                    <li>点击右上角头像，在下拉菜单中选择Profile。</li>
                    <li>
                        在Profile页面，下图介绍了该页面的一些按钮功能，你也可以阅读页面右侧使用指南来获取更详细的信息。
                        <img src={profile} alt='profile' width='100%'/>
                    </li>
                    <li>
                        点击左侧“添加申请人”按钮，可以在右侧界面填写你的申请人信息。
                        <img src={newApplicant} alt='new-applicant' width='100%'/>
                    </li>
                    <li>
                        添加完申请人信息后，你可以打开自己的申请人信息页，添加自己的申请记录。
                        <img src={applicant} alt='applicant' width='100%'/>
                        <img src={record} alt='add-modify-record' width='100%'/>
                    </li>
                </ol>
                <h3><b>海外graduate program的添加和修改：</b></h3>
                <ol style={{paddingLeft: '1rem'}}>
                    <li>点击顶部导航栏的“项目信息表”按钮，即可前往查看各个项目。使用前请先阅读该页面的使用指南。</li>
                    <li>下图展示了该页面的项目添加和修改功能：</li>
                    <img src={program} alt='program' width='100%'/>
                </ol>
            </AccordionDetails>
        </Accordion>
    )
}

function Current() {
    return (
        <Accordion sx={{bgcolor: 'rgba(164,245,177,0.5)'}} disableGutters>
            <AccordionSummary
                expandIcon={<ArrowDropDownIcon/>}
            >
                <h2 style={{margin: 0}}><b>非毕业年级本硕同学请阅读：</b></h2>
            </AccordionSummary>
            <AccordionDetails>
                <h3><b>这个网站是干什么的？</b></h3>
                <h5>这是一个面向上科大信息学院的出国申请信息共享平台，收集了往届学长学姐海外硕博项目的申请案例，以及各个项目的介绍。</h5>
                <h3><b>我该如何使用这个网站？</b></h3>
                <h5><b>该网站分为两大版块：申请季数据汇总与项目信息表。下面将会为你详细介绍两个板块的功能。</b></h5>
                <h4><b>申请季数据汇总表</b></h4>
                <h6>可点击顶部导航栏的<MuiLink href='/datapoints'>申请季数据汇总</MuiLink>按钮跳转到该页面。</h6>
                <ol>
                    <li>
                        该表详细展示了每个项目下面都有谁申请、申请结果如何、申请时间线如何等信息。
                    </li>
                    <li>
                        你可以通过点击申请人和申请项目单元格右侧的扩展按钮，查看当前申请人或项目的信息。
                    </li>
                    <li>
                        表格上方有筛选栏，你可以筛选出你感兴趣的项目或申请人。
                    </li>
                </ol>
            </AccordionDetails>
        </Accordion>
    )
}