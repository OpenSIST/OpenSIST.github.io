import React, {useState} from 'react';
import "./AddModifyProgram.css";
import {
    DescriptionTemplate,
    ProgramTargetApplicantMajorChoices,
    ProgramRegionChoices
} from "../../../Data/Schemas";
import MarkDownEditor from "./MarkDownEditor/MarkDownEditor";
import {useLoaderData, useNavigate, redirect, Form} from "react-router-dom";
import {setProgramContent} from "../../../Data/ProgramData";
import {faMarkdown} from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Select from "react-select";
import univList from "../../../Data/univ_list.json";
import {getSelectorStyle} from "../../common";
import {colorMapping, regionMapping} from "../../../Data/Common";

export async function action({request}) {
    const formData = await request.formData();
    const University = formData.get('University');
    const Program = formData.get('Program');
    const ProgramID = `${Program}@${University}`;
    const targetApplicantMajor = formData.getAll('TargetApplicantMajor');
    const Region = formData.getAll('Region');
    const Degree = formData.get('Degree');
    const Description = formData.get('Description');
    const requestBody = {
        'newProgram': false,
        'content': {
            'ProgramID': ProgramID,
            'University': University,
            'Program': Program,
            'Region': Region,
            'Degree': Degree,
            'TargetApplicantMajor': targetApplicantMajor,
            'Description': Description,
        }
    };
    // console.log(requestBody)
    await setProgramContent(requestBody)
    return redirect(`/programs/${ProgramID}`)
}

function AddModifyProgram() {
    const navigate = useNavigate();
    const loaderData = useLoaderData();
    const programContent = loaderData?.programContent;
    const AddMode = !programContent;
    const OriginDesc = AddMode ? DescriptionTemplate : programContent.description;
    const [Description, setDescription] = useState(OriginDesc);
    const mode = AddMode ? 'Add' : 'Modify';

    const sortedUnivList = [...univList].sort((a, b) => {
        return a['fullName'].localeCompare(b['fullName']);
    });

    const univOptions = sortedUnivList.map((univ) => {
        return {
            value: univ['abbr'],
            label: univ['fullName'] === univ['abbr'] ? `${univ['fullName']}` : `${univ['fullName']} (${univ['abbr']})`,
            info: univ
        }
    });

    // const [selectedUniv, setSelectedUniv] = useState('');
    const [univRegion, setUnivRegion] = useState('');
    const [programDegree, setProgramDegree] = useState(programContent?.Degree ? {
        value: programContent?.Degree,
        label: programContent?.Degree
    } : '');
    const colors = getComputedStyle(document.body);

    const univSelectorStyle = getSelectorStyle();
    univSelectorStyle.control = (provided) => {
        const isDisabled = !AddMode;
        return {
            ...provided,
            backgroundColor: isDisabled ? '#ddd' : colors.getPropertyValue('--input-bg-color'),
            color: isDisabled ? '#666' : colors.getPropertyValue('--color'),
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            borderRadius: '5px',
            border: `1px solid ${colors.getPropertyValue('--border-color')}`,
        }
    };

    const detailSelectorStyle = getSelectorStyle();
    detailSelectorStyle.control = (provided) => ({
        ...provided,
        backgroundColor: colors.getPropertyValue('--input-bg-color'),
        color: colors.getPropertyValue('--color'),
        cursor: 'pointer',
        borderRadius: '5px',
        border: `1px solid ${colors.getPropertyValue('--border-color')}`,
    });
    detailSelectorStyle.container = (provided) => ({
        ...provided,
        width: '250px',
    });
    detailSelectorStyle.multiValueLabel = (provided, state) => {
        const color = colorMapping.find(x => x.label === state.data.label)?.color;
        let backgroundColor = color.replace(/rgb/i, "rgba");
        backgroundColor = backgroundColor.replace(/\)/i, ',0.1)');
        return {
            ...provided,
            color: color,
            fontWeight: 'bold',
            backgroundColor: backgroundColor,
            paddingLeft: '7px',
            display: 'flex',
            alignSelf: 'center',
        }
    }
    detailSelectorStyle.multiValueRemove = (provided, state) => {
        const color = colorMapping.find(x => x.label === state.data.label)?.color;
        let backgroundColor = color.replace(/rgb/i, "rgba");
        backgroundColor = backgroundColor.replace(/\)/i, ',0.1)');
        return {
            ...provided,
            color: color,
            backgroundColor: backgroundColor,
            textAlign: 'center',
            padding: 0,
            '&:hover': {
                backgroundColor: color,
                color: 'white',
            },
            svg: {
                padding: '5px',
            },
        }
    }

    return (
        <div className='ProgramContent'>
            <Form method="post" className='ProgramForm'>
                <h1 id="Title">{`${mode} Program`}</h1>

                <h4 className='Subtitle'>University Name</h4>
                <Select
                    components={{
                        DropdownIndicator: null,
                        IndicatorSeparator: null
                    }}
                    id='University'
                    isClearable
                    name='University'
                    onChange={(newUniv) => {
                        // setSelectedUniv(newUniv);
                        let newRegion = sortedUnivList[sortedUnivList.indexOf(newUniv?.info)]?.region;
                        if (newRegion) {
                            if (JSON.stringify(newRegion) !== JSON.stringify(['others'])) {
                                newRegion = newRegion.map((region) => {
                                    return regionMapping[region.toUpperCase()];
                                });
                            } else {
                                newRegion = ['Others'];
                            }
                        }
                        setUnivRegion(newRegion);
                    }}
                    options={univOptions}
                    placeholder={"Search..."}
                    styles={univSelectorStyle}
                    defaultValue={univOptions.find((univ) => univ.value === programContent?.University)}
                    required
                />

                <h4 className='Subtitle'>Program Name</h4>
                <input type="text" id="Program" name="Program"
                       defaultValue={programContent?.Program}
                       placeholder="Use abbreviation, e.g. MSCS, EECS PhD, etc."
                       required
                       className={AddMode ? "" : "disabled"}
                />

                <h4 className='Subtitle'>Program Degree</h4>
                <Select
                    isClearable
                    options={[
                        {value: 'Master', label: 'Master'},
                        {value: 'PhD', label: 'PhD'},
                    ]}
                    name='Degree'
                    styles={detailSelectorStyle}
                    placeholder={"Select Degree"}
                    value={programDegree}
                    onChange={(newDegree) => {
                        setProgramDegree(newDegree);
                    }}
                    required
                />

                <h4 className='Subtitle'>Target Applicant Major (Multi-choices)</h4>
                <Select
                    closeMenuOnSelect={false}
                    isClearable
                    isMulti
                    placeholder={"Select Major(s)"}
                    options={ProgramTargetApplicantMajorChoices.map((major) => {
                        return {value: major, label: major};
                    })}
                    defaultValue={programContent?.TargetApplicantMajor.map((major) => {
                        return {value: major, label: major};
                    }) || []}
                    name="TargetApplicantMajor"
                    styles={detailSelectorStyle}
                    required
                />

                <div hidden>
                    <h4 className='Subtitle'>Program Region</h4>
                    <MultiChoice
                        choices={ProgramRegionChoices}
                        defaultValue={programContent?.Region || univRegion || []}
                        name="Region"
                    />
                </div>

                <h4 className='Subtitle'>Program Description <FontAwesomeIcon icon={faMarkdown}/></h4>
                <MarkDownEditor OriginDesc={OriginDesc} Description={Description} setDescription={setDescription}/>
                <textarea id='Description' name='Description' hidden={true} value={Description} readOnly/>
                <div id='SaveCancelButtonGroup'>
                    <button type="submit">Submit</button>
                    <button onClick={() => navigate(-1)}>Cancel</button>
                </div>
            </Form>
        </div>
    )
}

function MultiChoice({choices, defaultValue, name}) {
    return (
        <div className="MultiChoice">
            {choices.map((choice) => (
                <div className="MultiChoiceOption" key={choice}>
                    <input type="checkbox" id={choice} name={name} value={choice}
                           checked={defaultValue.includes(choice)} onChange={() => {
                    }}/>
                    <label htmlFor={choice}>{choice}</label>
                </div>
            ))}
        </div>
    )
}

export default AddModifyProgram;