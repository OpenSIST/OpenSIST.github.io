import {useRef} from "react";
import {Box, Button, Paper} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {ApplicantMaterialsSection, CompetitionSection, createListController, ExchangeSection, ExperienceSection, PublicationSection, RecommendationSection} from "./SoftBackgroundSections";
import "../AddModifyApplicant.css";

function SoftBackground({formValues, handleBack, handleChange}) {
    const navigate = useNavigate();
    const cvInputRef = useRef(null);
    const sopInputRef = useRef(null);
    const exchangeController = createListController(
        formValues.Exchange ?? [],
        handleChange,
        "Exchange",
        () => ({University: "", Duration: "", Detail: ""})
    );
    const publicationController = createListController(
        formValues.Publication ?? [],
        handleChange,
        "Publication",
        () => ({Type: "", Name: "", AuthorOrder: "", Status: "", Detail: ""})
    );
    const recommendationController = createListController(
        formValues.Recommendation ?? [],
        handleChange,
        "Recommendation",
        () => ({Type: [], Detail: ""})
    );

    function onPdfUpload(event, fileType) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        let errorMessage;
        if (file.size > 10 * 1024 * 1024) {
            errorMessage = "文件大小不能超过10MB!";
        } else if (!(/^[\u0020-\u007e]*$/.test(file.name))) {
            errorMessage = "文件名不能包含中文!";
        } else if (file.type !== 'application/pdf') {
            errorMessage = "文件格式必须为PDF!";
        }
        if (errorMessage) {
            alert(errorMessage);
            event.target.value = '';
            return;
        }
        handleChange(event, {
            Title: `Uploaded_${file.name}`,
            PostID: formValues[fileType]?.PostID,
        }, fileType);
    }

    function onPdfRemove(fileType, inputRef) {
        handleChange(undefined, {
            Title: undefined,
            PostID: formValues[fileType]?.PostID,
        }, fileType);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    return (
        <Paper
            variant='elevation'
            sx={{
                width: '100%',
                bgcolor: (theme) => theme.palette.surface,
                borderRadius: 3,
                pb: 1,
            }}
            elevation={0}
        >
            <ExchangeSection controller={exchangeController}/>
            <ExperienceSection formValues={formValues} handleChange={handleChange} research/>
            <ExperienceSection formValues={formValues} handleChange={handleChange}/>
            <PublicationSection controller={publicationController}/>
            <RecommendationSection controller={recommendationController}/>
            <CompetitionSection competition={formValues.Competition} handleChange={handleChange}/>
            <ApplicantMaterialsSection cvInputRef={cvInputRef} sopInputRef={sopInputRef}
                                       formValues={formValues} onPdfRemove={onPdfRemove}
                                       onPdfUpload={onPdfUpload}/>
            <Box sx={{display: "flex", justifyContent: "flex-end", margin: 3}}>
                <Button sx={{mr: 1}} variant='contained' onClick={() => navigate("..")}>
                    取消
                </Button>
                <Button sx={{mr: 1}} variant='contained' onClick={handleBack}>
                    上一步
                </Button>
                <Button sx={{mr: 2}} variant='contained' type="submit" color="success">
                    提交
                </Button>
            </Box>
        </Paper>
    );
}

export default SoftBackground;
