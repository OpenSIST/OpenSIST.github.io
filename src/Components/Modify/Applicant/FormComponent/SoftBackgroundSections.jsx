import {
    Button,
    Checkbox,
    FormControl,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    TextField
} from "@mui/material";
import Grid2 from "@mui/material/Grid";
import Select from "@mui/material/Select";
import {Add, CloudUpload, Delete} from "@mui/icons-material";
import {
    authorOrderOptions,
    exchangeDurationOptions,
    exchangeUnivList,
    publicationStatusOptions,
    publicationTypeOptions,
    recommendationTypeOptions
} from "../../../../Data/Schemas";
import {FormSection, sectionGridSx} from "./ApplicantFormShared";

const recommendationTypeOptionsMap = recommendationTypeOptions.reduce((options, option) => {
    options[option.value] = option.label;
    return options;
}, {});

function updateListItem(items, index, event) {
    return items.map((item, itemIndex) => (
        itemIndex === index ? {...item, [event.target.name]: event.target.value} : item
    ));
}

export function createListController(items, handleChange, fieldName, createItem) {
    return {
        items,
        add: () => handleChange(undefined, [...items, createItem()], fieldName),
        remove: (index) => handleChange(undefined, items.filter((_, itemIndex) => itemIndex !== index), fieldName),
        update: (index, event) => handleChange(undefined, updateListItem(items, index, event), fieldName),
    };
}

function AddListButton({onClick}) {
    return (
        <Grid2 container sx={sectionGridSx}>
            <Grid2 size={12}>
                <Button
                    onClick={onClick}
                    variant="outlined"
                    fullWidth
                    startIcon={<Add/>}
                    sx={{
                        py: 0.75,
                        color: 'text.secondary',
                        borderColor: 'divider',
                        borderStyle: 'dashed',
                        '&:hover': {borderStyle: 'dashed', borderColor: 'primary.main', color: 'primary.main', bgcolor: 'transparent'},
                    }}
                >
                    添加
                </Button>
            </Grid2>
        </Grid2>
    );
}

function RemoveListItemButton({onClick}) {
    return (
        <Grid2
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            size={{
                xs: 2,
                sm: 1
            }}>
            <IconButton color='error' onClick={onClick}>
                <Delete/>
            </IconButton>
        </Grid2>
    );
}

export function ExchangeSection({controller}) {
    return (
        <FormSection title="3+1经历">
            {controller.items.map((exchange, index) => (
                <Grid2
                    container
                    sx={{width: '80%', marginBottom: '15px'}}
                    key={index}
                >
                    <Grid2 container spacing={2} size={{xs: 10, sm: 11}}>
                        <Grid2 size={{xs: 12, lg: 4}}>
                            <FormControl fullWidth required>
                                <InputLabel size="small">交换学校</InputLabel>
                                <Select
                                    name="University"
                                    size="small"
                                    label="交换学校"
                                    value={exchange.University ?? ""}
                                    onChange={(event) => controller.update(index, event)}
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
                        <Grid2 size={{xs: 12, lg: 4}}>
                            <FormControl fullWidth required>
                                <InputLabel size="small">交换时长</InputLabel>
                                <Select
                                    name="Duration"
                                    size="small"
                                    label="交换时长"
                                    value={exchange.Duration ?? ""}
                                    onChange={(event) => controller.update(index, event)}
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
                        <Grid2 size={{xs: 12, lg: 4}}>
                            <TextField
                                fullWidth
                                name="Detail"
                                label="具体描述"
                                value={exchange.Detail ?? ""}
                                onChange={(event) => controller.update(index, event)}
                                size="small"
                            />
                        </Grid2>
                    </Grid2>
                    <RemoveListItemButton onClick={() => controller.remove(index)}/>
                </Grid2>
            ))}
            <AddListButton onClick={controller.add}/>
        </FormSection>
    );
}

export function ExperienceSection({formValues, handleChange, research = false}) {
    const fieldType = research ? 'Research' : 'Intern';
    const title = research ? '科研经历' : '实习经历';
    const label = research ? '科研经历' : '实习经历';
    const fields = [
        [`Domestic${fieldType}Num`, `国内${label}段数`, 4, 'number'],
        [`Domestic${fieldType}Detail`, '具体描述', 8],
        [`International${fieldType}Num`, `海外${label}段数`, 4, 'number'],
        [`International${fieldType}Detail`, '具体描述', 8],
    ];
    return (
        <FormSection title={title}>
            <Grid2 container spacing={2} sx={sectionGridSx}>
                {research ? <Grid2 size={12}>
                    <TextField
                        fullWidth
                        name="ResearchFocus"
                        label="研究领域"
                        variant="outlined"
                        size="small"
                        value={formValues.ResearchFocus ?? ""}
                        onChange={handleChange}
                    />
                </Grid2> : null}
                {fields.map(([name, fieldLabel, size, type]) => (
                    <Grid2 key={name} size={{xs: 12, sm: size}}>
                        <TextField
                            fullWidth
                            name={name}
                            label={fieldLabel}
                            type={type}
                            variant="outlined"
                            size="small"
                            value={formValues[name] ?? ""}
                            onChange={handleChange}
                        />
                    </Grid2>
                ))}
            </Grid2>
        </FormSection>
    );
}

export function PublicationSection({controller}) {
    return (
        <FormSection title="论文发表（包含在投）">
            {controller.items.map((publication, index) => (
                <Grid2
                    container
                    sx={{width: '80%', marginBottom: '15px'}}
                    key={index}
                >
                    <Grid2 container spacing={2} size={{xs: 10, sm: 11}}>
                        <Grid2 size={{xs: 12, sm: 6}}>
                            <FormControl fullWidth required>
                                <InputLabel size="small">发表在</InputLabel>
                                <Select
                                    name="Type"
                                    size="small"
                                    label="发表在"
                                    value={publication.Type ?? ""}
                                    onChange={(event) => controller.update(index, event)}
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
                        <Grid2 size={{xs: 12, sm: 6}}>
                            <TextField
                                fullWidth
                                name="Name"
                                label="期刊/会议名称简写"
                                value={publication.Name ?? ""}
                                onChange={(event) => controller.update(index, event)}
                                size="small"
                                required
                            />
                        </Grid2>
                        <Grid2 size={{xs: 12, sm: 6}}>
                            <FormControl fullWidth required>
                                <InputLabel size="small">作者顺次</InputLabel>
                                <Select
                                    name="AuthorOrder"
                                    size="small"
                                    label="作者顺次"
                                    value={publication.AuthorOrder ?? ""}
                                    onChange={(event) => controller.update(index, event)}
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
                        <Grid2 size={{xs: 12, sm: 6}}>
                            <FormControl fullWidth required>
                                <InputLabel size="small">录用状态</InputLabel>
                                <Select
                                    name="Status"
                                    size="small"
                                    label="录用状态"
                                    value={publication.Status ?? ""}
                                    onChange={(event) => controller.update(index, event)}
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
                        <Grid2 size={12}>
                            <TextField
                                fullWidth
                                name="Detail"
                                label="具体描述"
                                value={publication.Detail ?? ""}
                                onChange={(event) => controller.update(index, event)}
                                size="small"
                            />
                        </Grid2>
                    </Grid2>
                    <RemoveListItemButton onClick={() => controller.remove(index)}/>
                </Grid2>
            ))}
            <AddListButton onClick={controller.add}/>
        </FormSection>
    );
}

export function RecommendationSection({controller}) {
    return (
        <FormSection title="推荐信">
            {controller.items.map((recommendation, index) => (
                <Grid2
                    container
                    sx={{width: '80%', marginBottom: '15px'}}
                    key={index}
                >
                    <Grid2 container spacing={2} size={{xs: 10, sm: 11}}>
                        <Grid2 size={{xs: 12, sm: 4}}>
                            <FormControl fullWidth required>
                                <InputLabel size="small">推荐信类型</InputLabel>
                                <Select
                                    multiple
                                    name="Type"
                                    size="small"
                                    label="推荐信类型"
                                    value={recommendation.Type ?? []}
                                    onChange={(event) => controller.update(index, event)}
                                    renderValue={(selected) => selected.map(value => recommendationTypeOptionsMap[value]).join(' + ')}
                                    style={{textAlign: 'left'}}
                                >
                                    {recommendationTypeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Checkbox checked={recommendation.Type?.includes(option.value) ?? false}/>
                                            <ListItemText primary={option.label}/>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{xs: 12, sm: 8}}>
                            <TextField
                                fullWidth
                                name="Detail"
                                label="具体描述（推荐人、强度等）"
                                value={recommendation.Detail ?? ""}
                                onChange={(event) => controller.update(index, event)}
                                size="small"
                            />
                        </Grid2>
                    </Grid2>
                    <RemoveListItemButton onClick={() => controller.remove(index)}/>
                </Grid2>
            ))}
            <AddListButton onClick={controller.add}/>
        </FormSection>
    );
}

export function CompetitionSection({competition, handleChange}) {
    return (
        <FormSection title="竞赛经历">
            <Grid2 container spacing={2} sx={sectionGridSx}>
                <Grid2 size={12}>
                    <TextField
                        fullWidth
                        name="Competition"
                        label="竞赛经历描述"
                        variant="outlined"
                        size="small"
                        value={competition ?? ""}
                        onChange={handleChange}
                    />
                </Grid2>
            </Grid2>
        </FormSection>
    );
}

function PdfUploadField({fileType, inputRef, label, onRemove, onUpload, value}) {
    return (
        <>
            <Grid2 size={{xs: 10, sm: 11}}>
                <Button
                    component='label'
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudUpload/>}
                    sx={{textTransform: 'none', justifyContent: 'flex-start'}}
                >
                    {value?.Title ?? label}
                    <input
                        hidden
                        type='file'
                        name={fileType}
                        accept='application/pdf'
                        ref={inputRef}
                        onChange={(event) => onUpload(event, fileType)}
                    />
                </Button>
            </Grid2>
            <Grid2
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                size={{xs: 2, sm: 1}}>
                <IconButton
                    color='error'
                    disabled={!value?.Title}
                    onClick={() => onRemove(fileType, inputRef)}
                >
                    <Delete/>
                </IconButton>
            </Grid2>
        </>
    );
}

export function ApplicantMaterialsSection({cvInputRef, formValues, onPdfRemove, onPdfUpload, sopInputRef}) {
    return (
        <FormSection title="上传申请材料（仅支持PDF）">
            <Grid2 container spacing={2} sx={sectionGridSx}>
                <PdfUploadField fileType='CV' inputRef={cvInputRef} label='Upload CV/Resume'
                                onRemove={onPdfRemove} onUpload={onPdfUpload} value={formValues.CV}/>
                <PdfUploadField fileType='SoP' inputRef={sopInputRef} label='Upload PS/SoP'
                                onRemove={onPdfRemove} onUpload={onPdfUpload} value={formValues.SoP}/>
            </Grid2>
        </FormSection>
    );
}
