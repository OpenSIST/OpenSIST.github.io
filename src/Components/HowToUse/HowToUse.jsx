import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Button, Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, ListItem, ListItemButton
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
            >
                <h3 style={{margin: 0}}><b>毕业生或毕业年级请阅读：</b></h3>
            </AccordionSummary>
            <AccordionDetails>
                <h4><b>我来这个网站应该干啥？</b></h4>
                <h5><b>为了给SIST学弟学妹们提供更多海外申请的信息，我们希望你能做三件事情：</b></h5>
                <ol>
                    <li>
                        <b>添加自己的申请人信息（可选匿名）</b>，也就是你在申请海外院校时候的申请背景。考虑到有的人也许会申请两次，因此每个用户可添加多个申请人，以申请年份作区分。
                    </li>
                    <li>
                        <b>添加自己的申请记录</b>，也就是你申请的各个项目的admit/reject的结果，最终呈现出来的就像在一亩三分地或opencs上浏览申请结果一样。
                    </li>
                    <li>
                        <b>添加或修改海外graduate program信息</b>，如果你对某些项目有着很深入的了解，我们希望你把你了解到的给写上，这样能为学弟学妹们提供更多insight。
                    </li>
                </ol>
                <h4><b>上面说的这三件事该咋做？</b></h4>
                <h5><b>申请人信息和申请记录的添加和修改：</b></h5>
                <h6><b>如果您懒得读下面的详细教程，可以直接前往<MuiLink href='/profile/new-applicant'>添加申请人</MuiLink>。</b></h6>
                <h6>
                    <b style={{display: 'flex'}}>
                        添加完申请人之后，可进一步为该申请人<MuiLink component='button' onClick={() => setOpen(true)}>添加申请记录</MuiLink>。
                    </b>
                </h6>
                <Dialog open={open} onClose={() => {
                    setOpen(false);
                }}>
                    <DialogTitle>请选择要为哪位申请人添加申请记录？</DialogTitle>
                    <DialogContent>
                        {applicantIDs.length > 0 ? applicantIDs.map((applicantID, index) => {
                            return (
                                <ListItem key={index}>
                                    <ListItemButton component={Link} to={`/profile/${applicantID}/new-record`} sx={{justifyContent: 'center'}}>
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
                <h5><b>海外graduate program的添加和修改：</b></h5>
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
                <h3 style={{margin: 0}}><b>非毕业年级本硕同学请阅读：</b></h3>
            </AccordionSummary>
            <AccordionDetails>
                先别看，还没做完
            </AccordionDetails>
        </Accordion>
    )
}