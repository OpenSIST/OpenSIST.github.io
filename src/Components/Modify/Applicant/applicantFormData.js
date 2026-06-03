import {blobToBase64} from "../../../Data/Common";
import {addModifyFile, removeFile} from "../../../Data/FileData";

function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

function numberOr(value, fallback) {
    return hasValue(value) ? Number(value) : fallback;
}

function compactObjectList(items = []) {
    return items.filter(item => Object.values(item).some(hasValue));
}

function createEnglishProficiency(formValues) {
    const {EnglishOption, EnglishTotal, R, W, L, S} = formValues;
    if (!EnglishOption || ![EnglishTotal, R, W, L, S].every(hasValue)) {
        return {};
    }
    return {
        [EnglishOption]: {
            Total: Number(EnglishTotal),
            R: Number(R),
            W: Number(W),
            L: Number(L),
            S: Number(S),
        },
    };
}

export function createApplicantRequestBody(formValues, actionType, applicantId) {
    const {
        Gender,
        CurrentDegree,
        ApplicationYear,
        Major,
        GPA,
        Ranking,
        ResearchFocus,
        DomesticResearchNum,
        DomesticResearchDetail,
        InternationalResearchNum,
        InternationalResearchDetail,
        DomesticInternNum,
        DomesticInternDetail,
        InternationalInternNum,
        InternationalInternDetail,
        Competition,
        Final,
        Programs,
    } = formValues;
    const gre = {
        Total: numberOr(formValues.GRETotal, 260),
        V: numberOr(formValues.V, 130),
        Q: numberOr(formValues.Q, 130),
        AW: numberOr(formValues.AW, 0),
    };
    const exchange = compactObjectList(formValues.Exchange);
    const publication = compactObjectList(formValues.Publication);
    const recommendation = compactObjectList(formValues.Recommendation);
    const isNewApplicant = actionType === 'new';

    return {
        newApplicant: isNewApplicant,
        content: {
            ApplicantID: applicantId,
            Gender,
            CurrentDegree,
            ApplicationYear,
            Major,
            GPA: Number(GPA),
            Ranking,
            ...((gre.Total !== 260 || gre.V !== 130 || gre.Q !== 130 || gre.AW !== 0) && {GRE: gre}),
            EnglishProficiency: createEnglishProficiency(formValues),
            ...(exchange.length > 0 && {Exchange: exchange}),
            ...(publication.length > 0 && {Publication: publication}),
            Research: {
                Focus: ResearchFocus ?? "",
                Domestic: {
                    Num: numberOr(DomesticResearchNum, 0),
                    Detail: DomesticResearchDetail ?? "",
                },
                International: {
                    Num: numberOr(InternationalResearchNum, 0),
                    Detail: InternationalResearchDetail ?? "",
                },
            },
            Internship: {
                Domestic: {
                    Num: numberOr(DomesticInternNum, 0),
                    Detail: DomesticInternDetail ?? "",
                },
                International: {
                    Num: numberOr(InternationalInternNum, 0),
                    Detail: InternationalInternDetail ?? "",
                },
            },
            ...(recommendation.length > 0 && {Recommendation: recommendation}),
            ...(Competition !== undefined && {Competition}),
            Programs: isNewApplicant ? {} : Programs,
            Final: Final ?? "",
            Posts: isNewApplicant ? [] : (formValues.Posts ?? []),
        },
    };
}

export function createInitialApplicantFormValues(applicant, cvPost, sopPost) {
    if (!applicant) {
        return {};
    }
    return {
        Gender: applicant.Gender,
        CurrentDegree: applicant.CurrentDegree,
        ApplicationYear: applicant.ApplicationYear,
        Major: applicant.Major,
        GPA: applicant.GPA,
        Ranking: applicant.Ranking,
        V: applicant.GRE?.V,
        Q: applicant.GRE?.Q,
        AW: applicant.GRE?.AW,
        GRETotal: applicant.GRE?.Total,
        ...(applicant.EnglishProficiency?.TOEFL && {
            EnglishOption: 'TOEFL',
            EnglishTotal: applicant.EnglishProficiency.TOEFL.Total,
            R: applicant.EnglishProficiency.TOEFL.R,
            W: applicant.EnglishProficiency.TOEFL.W,
            L: applicant.EnglishProficiency.TOEFL.L,
            S: applicant.EnglishProficiency.TOEFL.S,
        }),
        ...(applicant.EnglishProficiency?.IELTS && {
            EnglishOption: 'IELTS',
            EnglishTotal: applicant.EnglishProficiency.IELTS.Total,
            R: applicant.EnglishProficiency.IELTS.R,
            W: applicant.EnglishProficiency.IELTS.W,
            L: applicant.EnglishProficiency.IELTS.L,
            S: applicant.EnglishProficiency.IELTS.S,
        }),
        ResearchFocus: applicant.Research?.Focus,
        DomesticResearchNum: applicant.Research?.Domestic?.Num,
        DomesticResearchDetail: applicant.Research?.Domestic?.Detail,
        InternationalResearchNum: applicant.Research?.International?.Num,
        InternationalResearchDetail: applicant.Research?.International?.Detail,
        DomesticInternNum: applicant.Internship?.Domestic?.Num,
        DomesticInternDetail: applicant.Internship?.Domestic?.Detail,
        InternationalInternNum: applicant.Internship?.International?.Num,
        InternationalInternDetail: applicant.Internship?.International?.Detail,
        Competition: applicant.Competition,
        Programs: applicant.Programs,
        Exchange: applicant.Exchange,
        Publication: applicant.Publication,
        Recommendation: applicant.Recommendation,
        Final: applicant.Final,
        Posts: applicant.Posts,
        CV: {
            PostID: cvPost?.PostID,
            Title: cvPost?.Title,
        },
        SoP: {
            PostID: sopPost?.PostID,
            Title: sopPost?.Title,
        },
    };
}

export async function syncApplicantFile({applicantId, fileType, formData, formValues, posts}) {
    const postId = formValues[fileType]?.PostID;
    const title = formValues[fileType]?.Title;
    const hasStoredFile = posts.includes(postId);

    if (hasStoredFile && !title) {
        await removeFile(postId, applicantId);
        return;
    }

    const file = formData.get(fileType);
    if (!title || !file?.name) {
        return;
    }

    const content = await blobToBase64(file);
    if (hasStoredFile) {
        await addModifyFile({
            PostID: postId,
            content: {Title: title, Content: content},
        }, 'edit');
        return;
    }

    await addModifyFile({
        ApplicantID: applicantId,
        content: {type: fileType, Title: title, Content: content},
    }, 'new');
}
