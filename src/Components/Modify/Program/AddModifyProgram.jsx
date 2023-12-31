import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import "./AddModifyProgram.css";
import {addModifyProgram} from "../../../Data/Data";
import {DescriptionTemplate, ProgramTargetApplicantMajorChoices,
    ProgramRegionChoices} from "../../../Data/Schemas";

function getListChoices(choices) {
    return Array.from(choices).map(
        (choice) => {
            if (choice.checked) {
                return choice.value;
            }
        }
    ).filter((choice) => choice !== undefined);
}


function AddModifyProgram({isShow, setIsShow, className, originData = null}) {

    // console.log(originData)

    const [Description, setDescription] = useState(originData === null ? DescriptionTemplate : originData.Description);
    const [view, setView] = useState('write');
    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    }

    const handleWriteClick = () => {
        setView('write');
    }

    const handlePreviewClick = () => {
        setView('preview');
    }

    const mode = originData === null ? 'Add' : 'Modify';

    const handleSubmit = async (event) => {
        event.preventDefault();
        const University = event.target.University.value;
        const Program = event.target.Program.value;
        const targetApplicantMajor = getListChoices(event.target.TargetApplicantMajor);
        const Region = getListChoices(event.target.Region);
        const Description = event.target.Description.value;

        const data = {
            'newProgram': false,
            'content': {
                'ProgramID': `${Program}@${University}`,
                'University': University,
                'Program': Program,
                'Region': Region,
                'Degree': event.target.Degree.value,
                'TargetApplicantMajor': targetApplicantMajor,
                'Description': Description,
                'Applicants': []
            }
        };
        try {
            const response = await addModifyProgram({session: localStorage.getItem('token'), data: data});
            if (response.status === 200) {
                alert(`Program ${mode} Successfully!`);
                setIsShow(false);
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    }

    if (!isShow) {
        return null;
    }

    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className='ProgramForm'>
                <h1 id="Title">{`${mode} Program`}</h1>

                <h4 className='Subtitle'>University Name</h4>
                <input type="text" id="University" name="University"
                       defaultValue={originData === null ? '' : originData.University}
                       placeholder="University Name" required/>

                <h4 className='Subtitle'>Program Name</h4>
                <input type="text" id="Program" name="Program"
                       defaultValue={originData === null ? '' : originData.Program}
                       placeholder="Program Name" required/>

                <h4 className='Subtitle'>Program Degree</h4>
                <SingleChoice
                    choices={['Master', 'PhD']}
                    defaultValue={originData === null ? 'Master' : originData.Degree}
                    name={'Degree'}
                />

                <h4 className='Subtitle'>Target Applicant Major (Multi-choices)</h4>
                <MultiChoice
                    choices={ProgramTargetApplicantMajorChoices}
                    defaultValue={originData === null ? [] : originData.TargetApplicantMajor}
                    name="TargetApplicantMajor"
                />

                <h4 className='Subtitle'>Program Region (Multi-choices)</h4>
                <MultiChoice
                    choices={ProgramRegionChoices}
                    defaultValue={originData === null ? [] : originData.Region}
                    name="Region"
                />

                <h4 className='Subtitle'>Program Description</h4>
                <div id='WritePreviewButtonGroup'>
                    <button type="button" onClick={handleWriteClick}>Write</button>
                    <button type="button" onClick={handlePreviewClick}>Preview</button>
                </div>

                {view === 'write' ? (
                    <textarea id="Description" name="Description" placeholder="Program Description"
                              defaultValue={Description}
                              required onChange={handleDescriptionChange}
                              rows="20" cols="50"
                              style={{display: view === 'write' ? 'block' : 'none'}}
                    />
                ) : (
                    <div className="markdown-preview" style={{display: view === 'preview' ? 'block' : 'none'}}>
                        <ReactMarkdown>{Description === '' ? 'Nothing here yet' : Description}</ReactMarkdown>
                    </div>
                )}

                <div id='SaveCancelButtonGroup'>
                    <button type="submit">Save</button>
                    <button onClick={() => {
                        setDescription(DescriptionTemplate)
                        setIsShow(false)
                    }}>Cancel
                    </button>
                </div>
            </form>
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