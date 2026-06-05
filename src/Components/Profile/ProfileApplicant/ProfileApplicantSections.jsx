import {Fragment} from "react";
import {Divider, List, Typography} from "@mui/material";
import ArticleIcon from '@mui/icons-material/Article';
import BiotechIcon from '@mui/icons-material/Biotech';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import ShutterSpeedIcon from '@mui/icons-material/ShutterSpeed';
import WorkIcon from '@mui/icons-material/Work';
import {authorOrderMapping, exchangeDurationMapping, exchangeUnivFullNameMapping, publicationStatusMapping, publicationTypeMapping, recommendationTypeMapping} from "../../../Data/Schemas";
import {BoldTypography} from "../../common";
import {BaseItemBlock, BaseListItem, ContentCenteredGrid} from "./ProfileApplicantShared";

export function ExchangeBlock({exchanges}) {
    const displayExchanges = exchanges?.length > 0 ? exchanges : [{
        "University": "暂无",
        "Duration": "暂无",
        "Detail": "暂无"
    }];
    return (
        <BaseItemBlock className="ExchangeBlock" checkpointProps={{xs: 12, lg: 4}}>
            <ContentCenteredGrid size={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>交换经历</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {displayExchanges.map((exchange, index) => {
                    return (
                        <Fragment key={index}>
                            <BaseListItem
                                Icon={<SchoolIcon/>}
                                primary={exchangeUnivFullNameMapping[exchange.University] ?? "暂无"}
                                secondary={{
                                    "交换时长": exchangeDurationMapping[exchange.Duration] ?? "暂无",
                                    "具体描述": exchange.Detail || '暂无'
                                }}
                            />
                            {index !== displayExchanges.length - 1 ? <Divider/> : null}
                        </Fragment>
                    )
                })}
            </List>
        </BaseItemBlock>
    )
}

export function ResearchBlock({research}) {
    const domestic = research?.Domestic ?? {};
    const international = research?.International ?? {};
    return (
        <BaseItemBlock className="ResearchBlock" checkpointProps={{xs: 12, lg: 4}}>
            <ContentCenteredGrid size={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>科研经历</BoldTypography>
                <Typography variant="subtitle1">{research?.Focus || "暂无"}</Typography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    Icon={<BiotechIcon/>}
                    primary={`国内${domestic.Num ?? 0}段研究经历`}
                    secondary={domestic.Detail || '具体描述：暂无'}
                />
                <Divider/>
                <BaseListItem
                    Icon={<BiotechIcon/>}
                    primary={`国外${international.Num ?? 0}段研究经历`}
                    secondary={international.Detail || '具体描述：暂无'}
                />
            </List>
        </BaseItemBlock>
    )
}

export function InternshipBlock({internships}) {
    const domestic = internships?.Domestic ?? {};
    const international = internships?.International ?? {};
    return (
        <BaseItemBlock className="InternshipBlock" checkpointProps={{xs: 12, lg: 4}}>
            <ContentCenteredGrid size={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>实习经历</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    Icon={<WorkIcon/>}
                    primary={`国内${domestic.Num ?? 0}段实习经历`}
                    secondary={domestic.Detail || '具体描述：暂无'}
                />
                <Divider/>
                <BaseListItem
                    Icon={<WorkIcon/>}
                    primary={`国外${international.Num ?? 0}段实习经历`}
                    secondary={international.Detail || '具体描述：暂无'}
                />
            </List>
        </BaseItemBlock>
    )
}

export function PublicationBlock({publications}) {
    const displayPublications = publications?.length > 0 ? publications : [{
        "Type": "暂无",
        "Name": "暂无",
        "AuthorOrder": "暂无",
        "Status": "暂无",
        "Detail": "暂无"
    }];
    return (
        <BaseItemBlock className="PublicationBlock" checkpointProps={{xs: 12, lg: 4}}>
            <ContentCenteredGrid size={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>发表论文</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {displayPublications.map((publication, index) => {
                    const publicationType = publicationTypeMapping[publication.Type] ?? "";
                    return (
                        <Fragment key={index}>
                            <BaseListItem
                                Icon={<ArticleIcon/>}
                                primary={`${publication.Name ?? "暂无"} ${publicationType}`.trim()}
                                secondary={{
                                    "作者顺序": authorOrderMapping[publication.AuthorOrder] ?? "暂无",
                                    "状态": publicationStatusMapping[publication.Status] ?? "暂无",
                                    "具体描述": publication.Detail || '暂无'
                                }}
                            />
                            {index !== displayPublications.length - 1 ? <Divider/> : null}
                        </Fragment>
                    )
                })}
            </List>
        </BaseItemBlock>
    )
}

export function RecommendationBlock({recommendations}) {
    const displayRecommendations = recommendations?.length > 0 ? recommendations : [{
        "Type": ["暂无"],
        "Detail": "暂无"
    }];
    return (
        <BaseItemBlock className="RecommendationBlock" checkpointProps={{xs: 12, lg: 4}}>
            <ContentCenteredGrid size={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>推荐信</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                {displayRecommendations.map((recommendation, index) => {
                    const types = Array.isArray(recommendation.Type) ? recommendation.Type : [];
                    const primary = types.map((type) => recommendationTypeMapping[type] ?? type).join('+') || '暂无';
                    return (
                        <Fragment key={index}>
                            <BaseListItem
                                Icon={<EmailIcon/>}
                                primary={primary}
                                secondary={recommendation.Detail || '具体描述：暂无'}
                            />
                            {index !== displayRecommendations.length - 1 ? <Divider/> : null}
                        </Fragment>
                    )
                })}
            </List>
        </BaseItemBlock>
    )
}

export function CompetitionBlock({competition}) {
    return (
        <BaseItemBlock className="CompetitionBlock" checkpointProps={{xs: 12, lg: 4}}>
            <ContentCenteredGrid size={12} sx={{flexDirection: 'column', alignItems: 'flex-start'}}>
                <BoldTypography variant='h6'>竞赛</BoldTypography>
            </ContentCenteredGrid>
            <List sx={{width: '100%'}}>
                <BaseListItem
                    Icon={<ShutterSpeedIcon/>}
                    primary="竞赛经历"
                    secondary={competition || '具体描述：暂无'}
                />
            </List>
        </BaseItemBlock>
    )
}
