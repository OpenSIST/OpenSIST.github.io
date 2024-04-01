import React from "react";
import "./Agreement.css";
import {OpenSIST} from "../common";

export default function Agreement() {
    return (
        <div className="Agreement">
            <AgreementContent/>
        </div>
    );
}

export function AgreementContent() {
    return (
        <>
            <h1 style={{textAlign: 'center'}}><OpenSIST props={{variant: 'h4'}}/>隐私条款及用户守则</h1>
            <div>
                <h2>隐私条款</h2>
                <ol>
                    <li>填写个人信息时，您有自由选择匿名或公开自己联系方式的权利。</li>
                    <li>您所填写的个人信息，包括申请时的背景信息、申请学校被录取的信息等，其访问权限将仅限于拥有上海科技大学教育邮箱的个人。任何第三方机构或个人无权阅读、获取、传播OpenSIST内部的信息。
                    </li>
                    <li>您填写的个人信息将由OpenSIST开发者保存在后端数据库当中，且该数据库对外保密。</li>
                    <li>OpenSIST为非盈利的项目，您所填写的个人信息将不会被OpenSIST开发者以任何形式用于盈利目的。</li>
                </ol>
                <h2>用户守则</h2>
                <ol>
                    <li>
                        <b>我不会将OpenSIST站点上的上科大校友申请信息主动泄露给任何与上科大无关的第三方，包括但不限于<i>中介机构、家长群</i>等。</b>
                    </li>
                    <li>我不会发布任何宣扬暴力、色情、仇恨、政治敏感或包含欺诈信息等违反国家相关法律法规的内容。</li>
                    <li>我不会发布任何侵犯任何第三方的版权、商标或其他知识产权的内容。</li>
                    <li>如果您认为有需要保护的知识产权、商业秘密、肖像权，请勿上传本系统，但一经上传，默认在本系统内可以合理使用上述材料。</li>
                    <li>如果您违反上述承诺，OpenSIST平台将有权对您的OpenSIST账户做封禁处理，您将失去访问OpenSIST的权利。</li>
                </ol>
            </div>
        </>
    )
}