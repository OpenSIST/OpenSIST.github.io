import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {InlineTypography} from "../common";
import {FilterAltOff, OpenInFull, Refresh} from "@mui/icons-material";
import React from "react";
import profile from "../../Assets/imgs/profile.png";
import applicant from "../../Assets/imgs/applicant.png";
import newApplicant from "../../Assets/imgs/new-applicant.png";
import record from "../../Assets/imgs/record.png";
import program from "../../Assets/imgs/program.png";

export function HowToUse() {
    return (
        <div style={{width: '80%'}}>
            <h1 style={{textAlign: 'center'}}>OpenSIST使用指南</h1>
            <h3>在您使用OpenSIST之前，请仔细阅读本页，了解OpenSIST基本的运作逻辑。</h3>
            <Graduated/>
            <Current/>
            {/*<h3>OpenSIST包含以下功能：</h3>*/}
            {/*<ul>*/}
            {/*    <li>查看信息学院往年申请数据</li>*/}
            {/*    <li>添加/查看海外高校硕博项目简介</li>*/}
            {/*    <li>创建自己的申请人、编辑申请人信息、添加/修改/删除申请人信息下的申请记录（仅对参加过海外申请的同学而言）</li>*/}
            {/*    <li>开启/关闭用户匿名功能，以保障用户的个人隐私权</li>*/}
            {/*</ul>*/}
            {/*<h3>查看信息学院往年申请数据</h3>*/}
            {/*<p>点击顶部导航栏的“申请季数据汇总”按钮，即可前往申请数据一览表。使用前请先阅读表格顶部的使用指南。</p>*/}
            {/*<h3>添加/查看海外高校硕博项目简介</h3>*/}
            {/*<p>点击顶部导航栏的“项目信息表”按钮，即可前往查看各个项目。使用前请先阅读该页面的使用指南。</p>*/}
            {/*<h3><b>申请人、申请记录的添加与编辑</b></h3>*/}
            {/*<p>*/}
            {/*    每个OpenSIST用户都可以拥有自己的申请人与申请记录。<b>点击右上角头像，在下拉菜单当中点击“Profile”按钮即可前往个人信息页面。</b>*/}
            {/*    使用该功能之前，<b>请务必阅读该页面的使用指南。</b>*/}
            {/*</p>*/}
        </div>
    )
}

function Graduated() {
    return (
        <Accordion sx={{bgcolor: '#448aff1a'}}>
            <AccordionSummary
                expandIcon={<ArrowDropDownIcon/>}
            >
                <h3 style={{margin: 0}}><b>上科大毕业生或大四、研三同学请阅读：</b></h3>
            </AccordionSummary>
            <AccordionDetails>
                <h4><b>我来这个网站应该干啥？</b></h4>
                <h5><b>为了给SIST学弟学妹们提供更多海外申请的信息，我们希望你能做三件事情：</b></h5>
                <ol>
                    <li>
                        <b>添加自己的申请人信息</b>，也就是你在申请海外院校时候的申请背景。
                    </li>
                    <li>
                        <b>添加自己的申请记录</b>，也叫datapoints，也就是你申请的各个项目的admit/reject的结果，最终呈现出来的就像在一亩三分地或opencs上浏览申请结果一样。
                    </li>
                    <li>
                        <b>添加或修改海外graduate program信息</b>，如果你对某些项目有着很深入的了解，我们希望你把你了解到的给写上，这样能为学弟学妹们提供更多insight。
                    </li>
                </ol>
                <h4><b>上面说的这三件事该咋做啊？</b></h4>
                <h5><b>申请人信息和申请记录的添加和修改：</b></h5>
                <ol style={{paddingLeft: '1rem'}}>
                    <li>点击右上角头像，在下拉菜单中选择Profile栏。</li>
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
                <h3><b>上科大非毕业年级本硕同学请阅读：</b></h3>
            </AccordionSummary>
            <AccordionDetails>
                <ol>
                    <li>
                        <InlineTypography>
                            对于<b>申请人</b>和<b>申请项目</b>这两列，可点击单元格右侧<OpenInFull sx={{fontSize: "1rem"}}/>按钮查看申请人或项目的详细信息。
                        </InlineTypography>
                    </li>
                    <li>本页面为只读模式，想要编辑自己的申请人信息或添加/删除/修改所申请的项目，请点击右上角头像下拉菜单中Profile页面编辑相应信息。</li>
                    <li>
                        <InlineTypography>
                            可通过表格上部的filter来进行关键信息筛选。可点击左上角<FilterAltOff/>按钮重置所有筛选。
                        </InlineTypography>
                    </li>
                    <li>
                        <InlineTypography>
                            表格会每十分钟自动从服务器获取一次最新数据，您也可以可点击左上角<Refresh/>按钮手动获取。
                        </InlineTypography>
                    </li>
                </ol>
            </AccordionDetails>
        </Accordion>
    )
}