import React, {useState} from 'react';
import "./AddModifyProgram.css";
import {
    DescriptionTemplate,
    ProgramTargetApplicantMajorChoices,
    ProgramRegionChoices
} from "../../../Data/Schemas";
import MarkDownEditor from "./MarkDownEditor/MarkDownEditor";
import {useLoaderData, useNavigate, redirect, Form, useNavigation} from "react-router-dom";
import {setProgramContent} from "../../../Data/ProgramData";

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

    return (
        <div className='ProgramContent'>
            <Form method="post" className='ProgramForm'>
                <h1 id="Title">{`${mode} Program`}</h1>

                <h4 className='Subtitle'>University Name</h4>
                <input type="text" id="University" name="University"
                       defaultValue={programContent?.University}
                       placeholder="University Name" required
                       className={AddMode ? '' : 'disabled'}
                />

                <h4 className='Subtitle'>Program Name</h4>
                <input type="text" id="Program" name="Program"
                       defaultValue={programContent?.Program}
                       placeholder="Program Name" required
                       className={AddMode ? '' : 'disabled'}
                />

                <h4 className='Subtitle'>Program Degree</h4>
                <SingleChoice
                    choices={['Master', 'PhD']}
                    defaultValue={programContent?.Degree || 'Master'}
                    name='Degree'
                />

                <h4 className='Subtitle'>Target Applicant Major (Multi-choices)</h4>
                <MultiChoice
                    choices={ProgramTargetApplicantMajorChoices}
                    defaultValue={programContent?.TargetApplicantMajor || []}
                    name="TargetApplicantMajor"
                />

                <h4 className='Subtitle'>Program Region (Multi-choices)</h4>
                <MultiChoice
                    choices={ProgramRegionChoices}
                    defaultValue={programContent?.Region || []}
                    name="Region"
                />

                <h4 className='Subtitle'>Program Description (The editor supports MarkDown syntax)</h4>
                <MarkDownEditor OriginDesc={OriginDesc} Description={Description} setDescription={setDescription}/>
                <textarea id='Description' name='Description' hidden={true} value={Description} readOnly/>
                <div id='SaveCancelButtonGroup'>
                    <button type="submit" className='Button'>Submit</button>
                    <button onClick={() => navigate(-1)} className='Button'>Cancel</button>
                </div>
            </Form>
        </div>
    )
}

function SingleChoice({choices, defaultValue, name}) {
    return (
        <select defaultValue={defaultValue} name={name}>
            {choices.map((choice) => (
                <option value={choice} key={choice}>{choice}</option>
            ))}
        </select>
    )
}

function MultiChoice({choices, defaultValue, name}) {
    return (
        <div className="MultiChoice">
            {choices.map((choice) => (
                <div className="MultiChoiceOption" key={choice}>
                    <input type="checkbox" id={choice} name={name} value={choice}
                           defaultChecked={defaultValue.includes(choice)}/>
                    <label htmlFor={choice}>{choice}</label>
                </div>
            ))}
        </div>
    )
}

export default AddModifyProgram;