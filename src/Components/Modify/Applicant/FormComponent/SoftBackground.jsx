import {
    Box,
    Button, Checkbox,
    Divider,
    FormControl, IconButton,
    InputLabel, ListItemText,
    MenuItem,
    Paper,
    TextField
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React, {useRef, useState} from "react";
import {
    authorOrderOptions,
    exchangeDurationOptions, exchangeUnivList,
    publicationStatusOptions,
    publicationTypeOptions, recommendationTypeOptions
} from "../../../../Data/Schemas";
import {Add} from "@mui/icons-material";
import Select from "@mui/material/Select";
import "../AddModifyApplicant.css";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {useNavigate} from "react-router-dom";
import {useSmallPage} from "../../../common";

function SoftBackground({formValues, handleBack, handleChange, loaderData}) {
    const navigate = useNavigate();

    const [exchanges, setExchanges] = useState(formValues.Exchange ?? []);
    const handleAddExchange = () => {
        const newExchanges = [...exchanges, {University: "", Duration: "", Detail: ""}];
        setExchanges(newExchanges);
        handleChange(undefined, newExchanges, "Exchange");
    };
    const handleRemoveExchange = (index) => {
        const newExchanges = exchanges.filter((_, i) => i !== index);
        setExchanges(newExchanges);
        handleChange(undefined, newExchanges, "Exchange");
    };
    const handleExchangeChange = (index, event) => {
        const values = [...exchanges];
        values[index][event.target.name] = event.target.value;
        setExchanges(values);
        handleChange(undefined, values, "Exchange");
    };

    const [publications, setPublications] = useState(formValues.Publication ?? []);
    const handleAddPublication = () => {
        const newPublications = [...publications, {Type: "", Name: "", AuthorOrder: "", Status: "", Detail: ""}];
        setPublications(newPublications);
        handleChange(undefined, newPublications, "Publication");
    };
    const handleRemovePublication = (index) => {
        const newPublications = publications.filter((_, i) => i !== index);
        setPublications(newPublications);
        handleChange(undefined, newPublications, "Publication");
    };
    const handlePublicationChange = (index, event) => {
        const values = [...publications];
        values[index][event.target.name] = event.target.value;
        setPublications(values);
        handleChange(undefined, values, "Publication");
    };

    const [recommendations, setRecommendations] = useState(formValues.Recommendation ?? []);
    const handleAddRecommendation = () => {
        const newRecommendations = [...recommendations, {Type: [], Detail: ""}];
        setRecommendations(newRecommendations);
        handleChange(undefined, newRecommendations, "Recommendation");
    };
    const handleRemoveRecommendation = (index) => {
        const newRecommendations = recommendations.filter((_, i) => i !== index);
        setRecommendations(newRecommendations);
        handleChange(undefined, newRecommendations, "Recommendation");
    };
    const handleRecommendationChange = (index, event) => {
        const values = [...recommendations];
        values[index][event.target.name] = event.target.value;
        setRecommendations(values);
        handleChange(undefined, values, "Recommendation");
    };
    const recommendationTypeOptionsMap = recommendationTypeOptions.reduce((acc, option) => {
        acc[option.value] = option.label;
        return acc;
    }, {});

    const smallPage = useSmallPage();

    const CVNodeRef = useRef(loaderData.cvPost?.Content);
    const SoPNodeRef = useRef(loaderData.sopPost?.Content);
    const checkPDFValidity = (event, fileType) => {
        // console.log(event.target.files)
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert("文件大小不能超过10MB!");
                return;
            }
            if (!(/^[\x00-\x7F]*$/.test(file.name))) {
                alert("文件名不能包含中文!");
                return;
            }
            if (file.type !== 'application/pdf') {
                alert("文件格式必须为PDF!");
                return;
            }
            let status = formValues[fileType].Status;
            if (formValues[fileType].Status === 'delete' && file.name) {
                status = 'exist';
            }
            handleChange(event, {
                Title: `${file.name}`,
                PostID: formValues[fileType].PostID,
                InitStatus: formValues[fileType].InitStatus,
                Status: status
            }, `${fileType}`);
        }
    };

    return (
        <Paper variant='outlined' sx={{width: smallPage ? '90%' : '80%'}}>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>3+1经历</b>
            </Divider>
            <Box className='AddModifyForm'>
                {exchanges.map((exchange, index) => (
                    <Grid2
                        container
                        sx={{width: '80%', marginBottom: '15px'}}
                        key={index}
                    >
                        <Grid2 container spacing={2} xs={10} sm={11}>
                            <Grid2 xs={12} lg={4}>
                                <FormControl fullWidth required>
                                    <InputLabel size="small">交换学校</InputLabel>
                                    <Select
                                        name="University"
                                        size="small"
                                        label="交换学校"
                                        value={exchange.University}
                                        onChange={(event) => handleExchangeChange(index, event)}
                                        style={{textAlign: 'left'}}
                                    >
                                        {exchangeUnivList.map((univ) => (
                                            <MenuItem key={univ} value={univ}>
                                                {univ}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 xs={12} lg={4}>
                                <FormControl fullWidth required>
                                    <InputLabel size="small">交换时长</InputLabel>
                                    <Select
                                        name="Duration"
                                        size="small"
                                        label="交换时长"
                                        value={exchange.Duration}
                                        onChange={(event) => handleExchangeChange(index, event)}
                                        style={{textAlign: 'left'}}
                                    >
                                        {exchangeDurationOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 xs={12} lg={4}>
                                <TextField
                                    fullWidth
                                    name="Detail"
                                    label="具体描述"
                                    value={exchange.Detail}
                                    onChange={(event) => handleExchangeChange(index, event)}
                                    size="small"
                                    // multiline
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2 sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }} xs={2} sm={1}>
                            <IconButton variant="contained" color='error'
                                        onClick={() => handleRemoveExchange(index)}>
                                <DeleteIcon/>
                            </IconButton>
                        </Grid2>
                    </Grid2>
                ))}
                <Grid2
                    container
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12}>
                        <Button
                            onClick={handleAddExchange}
                            variant="contained"
                            fullWidth
                        >
                            <Add/>
                        </Button>
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>科研经历</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12}>
                        <TextField
                            fullWidth
                            name="ResearchFocus"
                            label="研究领域"
                            variant="outlined"
                            size="small"
                            // multiline
                            value={formValues.ResearchFocus ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={4}>
                        <TextField
                            fullWidth
                            name="DomesticResearchNum"
                            label="国内科研经历段数"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={formValues.DomesticResearchNum ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={8}>
                        <TextField
                            fullWidth
                            name="DomesticResearchDetail"
                            label="具体描述"
                            variant="outlined"
                            size="small"
                            // multiline
                            // InputProps={{
                            //     maxRows: 10,
                            //     multiline: true,
                            //     inputComponent: 'textarea'
                            // }}
                            value={formValues.DomesticResearchDetail ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={4}>
                        <TextField
                            fullWidth
                            name="InternationalResearchNum"
                            label="海外科研经历段数"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={formValues.InternationalResearchNum ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={8}>
                        <TextField
                            fullWidth
                            name="InternationalResearchDetail"
                            label="具体描述"
                            variant="outlined"
                            size="small"
                            // multiline
                            value={formValues.InternationalResearchDetail ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>实习经历</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12} sm={4}>
                        <TextField
                            fullWidth
                            name="DomesticInternNum"
                            label="国内实习经历段数"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={formValues.DomesticInternNum ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={8}>
                        <TextField
                            fullWidth
                            name="DomesticInternDetail"
                            label="具体描述"
                            variant="outlined"
                            size="small"
                            // multiline
                            value={formValues.DomesticInternDetail ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={4}>
                        <TextField
                            fullWidth
                            name="InternationalInternNum"
                            label="海外实习经历段数"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={formValues.InternationalInternNum ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={8}>
                        <TextField
                            fullWidth
                            name="InternationalInternDetail"
                            label="具体描述"
                            variant="outlined"
                            size="small"
                            // multiline
                            value={formValues.InternationalInternDetail ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>论文发表（包含在投）</b>
            </Divider>
            <Box className='AddModifyForm'>
                {publications.map((publication, index) => (
                    <Grid2
                        container
                        sx={{width: '80%', marginBottom: '15px'}}
                        key={index}
                    >
                        <Grid2 container spacing={2} xs={10} sm={11}>
                            <Grid2 xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel size="small">发表在</InputLabel>
                                    <Select
                                        name="Type"
                                        size="small"
                                        label="发表在"
                                        value={publication.Type}
                                        onChange={(event) => handlePublicationChange(index, event)}
                                        style={{textAlign: 'left'}}
                                    >
                                        {publicationTypeOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    name="Name"
                                    label="期刊/会议名称简写"
                                    // multiline
                                    value={publication.Name}
                                    onChange={(event) => handlePublicationChange(index, event)}
                                    size="small"
                                    required
                                />
                            </Grid2>
                            <Grid2 xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel size="small">作者顺次</InputLabel>
                                    <Select
                                        name="AuthorOrder"
                                        size="small"
                                        label="作者顺次"
                                        value={publication.AuthorOrder}
                                        onChange={(event) => handlePublicationChange(index, event)}
                                        style={{textAlign: 'left'}}
                                    >
                                        {authorOrderOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel size="small">录用状态</InputLabel>
                                    <Select
                                        name="Status"
                                        size="small"
                                        label="录用状态"
                                        value={publication.Status}
                                        onChange={(event) => handlePublicationChange(index, event)}
                                        style={{textAlign: 'left'}}
                                    >
                                        {publicationStatusOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 xs={12}>
                                <TextField
                                    fullWidth
                                    name="Detail"
                                    label="具体描述"
                                    // multiline
                                    value={publication.Detail}
                                    onChange={(event) => handlePublicationChange(index, event)}
                                    size="small"
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2 sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }} xs={2} sm={1}>
                            <IconButton variant="contained" color='error'
                                        onClick={() => handleRemovePublication(index)}>
                                <DeleteIcon/>
                            </IconButton>
                        </Grid2>
                    </Grid2>
                ))}
                <Grid2
                    container
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12}>
                        <Button
                            onClick={handleAddPublication}
                            variant="contained"
                            fullWidth
                        >
                            <Add/>
                        </Button>
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>推荐信</b>
            </Divider>
            <Box className='AddModifyForm'>
                {recommendations.map((recommendation, index) => (
                    <Grid2
                        container
                        sx={{width: '80%', marginBottom: '15px'}}
                        key={index}
                    >
                        <Grid2 container spacing={2} xs={10} sm={11}>
                            <Grid2 xs={12} sm={4}>
                                <FormControl fullWidth required>
                                    <InputLabel size="small">推荐信类型</InputLabel>
                                    <Select
                                        multiple
                                        name="Type"
                                        size="small"
                                        label="推荐信类型"
                                        value={recommendation.Type}
                                        onChange={(event) => handleRecommendationChange(index, event)}
                                        renderValue={(selected) => selected.map(value => recommendationTypeOptionsMap[value]).join(' + ')}
                                        style={{textAlign: 'left'}}
                                    >
                                        {recommendationTypeOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                <Checkbox checked={recommendation.Type.indexOf(option.value) > -1}/>
                                                <ListItemText primary={option.label}/>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>
                            <Grid2 xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    name="Detail"
                                    label="具体描述（推荐人、强度等）"
                                    // multiline
                                    value={recommendation.Detail}
                                    onChange={(event) => handleRecommendationChange(index, event)}
                                    size="small"
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2 sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }} xs={2} sm={1}>
                            <IconButton variant="contained" color='error'
                                        onClick={() => handleRemoveRecommendation(index)}>
                                <DeleteIcon/>
                            </IconButton>
                        </Grid2>
                    </Grid2>
                ))}
                <Grid2
                    container
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12}>
                        <Button
                            onClick={handleAddRecommendation}
                            variant="contained"
                            fullWidth
                        >
                            <Add/>
                        </Button>
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>竞赛经历</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={12}>
                        <TextField
                            fullWidth
                            name="Competition"
                            label="竞赛经历描述"
                            variant="outlined"
                            size="small"
                            // multiline
                            value={formValues.Competition ?? ""}
                            onChange={(event) => {
                                handleChange(event)
                            }}
                        />
                    </Grid2>
                </Grid2>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>上传申请材料（仅支持PDF）</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid2
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid2 xs={10} sm={11}>
                        <Button
                            component='label'
                            variant="contained"
                            fullWidth
                            startIcon={<CloudUploadIcon/>}
                            sx={{textTransform: 'none'}}
                        >
                            {formValues.CV.Title ?? 'Upload CV/Resume'}
                            <input
                                hidden
                                type='file'
                                name='CV'
                                accept='application/pdf'
                                ref={CVNodeRef}
                                onChange={(event) => checkPDFValidity(event, 'CV')}
                            />
                        </Button>
                    </Grid2>
                    <Grid2 xs={2} sm={1} sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <IconButton
                            variant='contained'
                            color='error'
                            sx={{textTransform: 'none'}}
                            disabled={!formValues.CV.Title}
                            onClick={() => {
                                handleChange(undefined, {
                                    Title: undefined,
                                    PostID: formValues.CV.PostID ?? undefined,
                                    InitStatus: formValues.CV.InitStatus,
                                    Status: 'delete'
                                }, 'CV');
                                if (CVNodeRef.current) {
                                    CVNodeRef.current.value = null;
                                }
                            }}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </Grid2>
                    <Grid2 xs={10} sm={11}>
                        <Button
                            component='label'
                            variant="contained"
                            fullWidth
                            startIcon={<CloudUploadIcon/>}
                            sx={{textTransform: 'none'}}
                        >
                            {formValues.SoP.Title ?? 'Upload PS/SoP'}
                            <input
                                hidden
                                type='file'
                                name='SoP'
                                accept='application/pdf'
                                ref={SoPNodeRef}
                                onChange={(event) => checkPDFValidity(event, 'SoP')}
                            />
                        </Button>
                    </Grid2>
                    <Grid2 xs={2} sm={1} sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <IconButton
                            variant='contained'
                            color='error'
                            sx={{textTransform: 'none'}}
                            disabled={!formValues.SoP.Title}
                            onClick={() => {
                                handleChange(undefined, {
                                    Title: undefined,
                                    PostID: formValues.SoP.PostID ?? undefined,
                                    InitStatus: formValues.SoP.InitStatus,
                                    Status: 'delete'
                                }, 'SoP');
                                if (SoPNodeRef.current) {
                                    SoPNodeRef.current.value = null;
                                }
                            }}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </Grid2>
                </Grid2>
            </Box>
            <Box sx={{display: "flex", justifyContent: "flex-end", margin: 3}}>
                <Button
                    sx={{mr: 1}}
                    variant='contained'
                    onClick={() => navigate(-1)}
                >
                    取消
                </Button>
                <Button
                    sx={{mr: 1}}
                    variant='contained'
                    onClick={handleBack}
                >
                    上一步
                </Button>
                <Button
                    sx={{mr: 2}}
                    variant='contained'
                    type="submit"
                    color="success"
                >
                    提交
                </Button>
            </Box>
        </Paper>
    )
}

export default SoftBackground;