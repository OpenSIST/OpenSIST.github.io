import {
    Box,
    Button, Checkbox,
    Divider,
    FormControl,
    Grid,
    InputLabel, ListItemText,
    MenuItem,
    Paper,
    TextField
} from "@mui/material";
import React, {useState} from "react";
import {
    authorOrderOptions,
    exchangeDurationOptions, exchangeUnivList,
    publicationStatusOptions,
    publicationTypeOptions, recommendationTypeOptions
} from "../../../../Data/Schemas";
import {Add, Remove} from "@mui/icons-material";
import Select from "@mui/material/Select";
import "../AddModifyApplicant.css";

function SoftBackground({formValues, handleBack, handleChange}) {
    const [exchanges, setExchanges] = useState(formValues.Exchange ?? []);
    const handleAddExchange = () => {
        const newExchanges = [...exchanges, { University: "", Duration: "", Detail: "" }];
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
        const newPublications = [...publications, { Type: "", Name: "", AuthorOrder: "", Status: "", Detail: "" }];
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
        const newRecommendations = [...recommendations, { Type: [], Detail: "" }];
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

    return (
        <Paper variant='outlined' sx={{width: '70%'}}>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>3+1经历</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Button
                    onClick={handleAddExchange}
                    variant="contained"
                    sx={{marginBottom: '15px'}}
                >
                    <Add/>
                </Button>
                {exchanges.map((exchange, index) => (
                    <Grid
                        container
                        spacing={2}
                        sx={{width: '80%', marginBottom: '10px'}}
                        key={index}
                    >
                        <Grid item xs={12} md={3.5}>
                            <FormControl fullWidth>
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
                        </Grid>
                        <Grid item xs={12} md={3.5}>
                            <FormControl fullWidth>
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
                        </Grid>
                        <Grid item xs={12} md={3.5}>
                            <TextField
                                fullWidth
                                name="Detail"
                                label="具体描述"
                                value={exchange.Detail}
                                onChange={(event) => handleExchangeChange(index, event)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={1.5}>
                            <Button fullWidth variant="contained" color="error" onClick={() => handleRemoveExchange(index)}>
                                <Remove/>
                            </Button>
                        </Grid>
                    </Grid>
                ))}
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>科研经历</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="ResearchFocus"
                            label="研究领域"
                            variant="outlined"
                            size="small"
                            value={formValues.ResearchFocus ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            name="DomesticResearchNum"
                            label="国内科研经历段数"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={formValues.DomesticResearchNum ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            name="DomesticResearchDetail"
                            label="具体描述"
                            variant="outlined"
                            size="small"
                            value={formValues.DomesticResearchDetail ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            name="InternationalResearchNum"
                            label="海外科研经历段数"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={formValues.InternationalResearchNum ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            name="InternationalResearchDetail"
                            label="具体描述"
                            variant="outlined"
                            size="small"
                            value={formValues.InternationalResearchDetail ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>实习经历</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            name="DomesticInternNum"
                            label="国内实习经历段数"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={formValues.DomesticInternNum ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            name="DomesticInternDetail"
                            label="具体描述"
                            variant="outlined"
                            size="small"
                            value={formValues.DomesticInternDetail ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            name="InternationalInternNum"
                            label="海外实习经历段数"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={formValues.InternationalInternNum ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            name="InternationalInternDetail"
                            label="具体描述"
                            variant="outlined"
                            size="small"
                            value={formValues.InternationalInternDetail ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>论文发表</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Button
                    onClick={handleAddPublication}
                    variant="contained"
                    sx={{marginBottom: '15px'}}
                >
                    <Add/>
                </Button>
                {publications.map((publication, index) => (
                    <Grid
                        container
                        spacing={2}
                        sx={{width: '80%', marginBottom: '20px'}}
                        key={index}
                    >
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
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
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                name="Name"
                                label="期刊/会议名称（简写）"
                                value={publication.Name}
                                onChange={(event) => handlePublicationChange(index, event)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
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
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
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
                        </Grid>
                        <Grid item xs={12} md={10.5}>
                            <TextField
                                fullWidth
                                name="Detail"
                                label="具体描述"
                                value={publication.Detail}
                                onChange={(event) => handlePublicationChange(index, event)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={1.5}>
                            <Button fullWidth variant="contained" color="error" onClick={() => handleRemovePublication(index)}>
                                <Remove/>
                            </Button>
                        </Grid>
                    </Grid>
                ))}
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>推荐信</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Button
                    onClick={handleAddRecommendation}
                    variant="contained"
                    sx={{marginBottom: '15px'}}
                >
                    <Add/>
                </Button>
                {recommendations.map((recommendation, index) => (
                    <Grid
                        container
                        spacing={2}
                        sx={{width: '80%', marginBottom: '15px'}}
                        key={index}
                    >
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
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
                        </Grid>
                        <Grid item xs={12} md={6.5}>
                            <TextField
                                fullWidth
                                name="Detail"
                                label="具体描述"
                                value={recommendation.Detail}
                                onChange={(event) => handleRecommendationChange(index, event)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={1.5}>
                            <Button fullWidth variant="contained" color="error" onClick={() => handleRemoveRecommendation(index)}>
                                <Remove/>
                            </Button>
                        </Grid>
                    </Grid>
                ))}
            </Box>
            <Divider
                textAlign="center"
                variant='middle'
                sx={{marginTop: '10px', fontSize: 20}}
            >
                <b>竞赛经历</b>
            </Divider>
            <Box className='AddModifyForm'>
                <Grid
                    container
                    spacing={2}
                    sx={{width: '80%', marginBottom: '10px'}}
                >
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="Competition"
                            label="竞赛经历描述"
                            variant="outlined"
                            size="small"
                            value={formValues.Competition ?? ""}
                            onChange={(event) => {handleChange(event)}}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", margin: 3 }}>
                <Button
                    sx={{ mr: 1 }}
                    variant='contained'
                    onClick={handleBack}
                >
                    上一步
                </Button>
                <Button
                    sx={{ mr: 1 }}
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