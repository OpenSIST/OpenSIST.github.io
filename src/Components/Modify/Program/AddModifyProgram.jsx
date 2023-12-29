import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import "./AddModifyProgram.css";
import {addModifyProgram} from "../../../Data";

const DescriptionTemplate = `# Program Name

## Overview
Write a brief overview of the program here.

## Structure
Describe the structure of the program here.

## Curriculum
Detail the curriculum of the program here.

## Faculty
List and describe the faculty involved in the program here.

## Research
Describe the research opportunities and ongoing projects in the program here.

## Admission
Detail the admission process and requirements for the program here.

## Contact
Provide contact information for inquiries about the program here.
`

function AddModifyProgram({isShow, setIsShow, className, originData = null}) {
    const [description, setDescription] = useState(originData === null ? DescriptionTemplate : originData.Description);
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
        const university = event.target.university.value;
        const program = event.target.program.value;
        const targetApplicantMajor = Array.from(event.target.TargetApplicantMajor).map(
            (option) => {
                if (option.checked) {
                    return option.value;
                }
            }
        ).filter((option) => option !== undefined);
        const description = event.target.description.value;
        const data = {
            'newProgram': false,
            'content': {
                'ProgramID': `${program}@${university}`,
                'University': university,
                'TargetApplicantMajor': targetApplicantMajor,
                'Description': description,
                'Applicants': []
            }
        }
        try {
            const response = await addModifyProgram({session: localStorage.getItem('token'), data: data});
            if (response.success) {
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
                <input type="text" id="university" name="university"
                       defaultValue={originData === null ? '' : originData.University}
                       placeholder="University Name" required/>
                <h4 className='Subtitle'>Program Name</h4>
                <input type="text" id="program" name="program"
                       defaultValue={originData === null ? '' : originData.ProgramID.split('@')[0]}
                       placeholder="Program Name" required/>
                <h4 className='Subtitle'>Target Applicant Major (Multi-options)</h4>
                <div className="TargetApplicantMajorOption">
                    <input type="checkbox" id="CS" name="TargetApplicantMajor"
                           defaultChecked={originData === null ? false : originData.TargetApplicantMajor.includes('CS')}
                           value="CS"/>
                    <label htmlFor="CS">CS</label>
                </div>
                <div className="TargetApplicantMajorOption">
                    <input type="checkbox" id="EE" name="TargetApplicantMajor"
                           defaultChecked={originData === null ? false : originData.TargetApplicantMajor.includes('EE')}
                           value="EE"/>
                    <label htmlFor="EE">EE</label>
                </div>
                <div className="TargetApplicantMajorOption">
                    <input type="checkbox" id="IE" name="TargetApplicantMajor"
                           defaultChecked={originData === null ? false : originData.TargetApplicantMajor.includes('IE')}
                           value="IE"/>
                    <label htmlFor="IE">IE</label>
                </div>
                <h4 className='Subtitle'>Program Description</h4>
                <div id='WritePreviewButtonGroup'>
                    <button type="button" onClick={handleWriteClick}>Write</button>
                    <button type="button" onClick={handlePreviewClick}>Preview</button>
                </div>
                {view === 'write' ? (
                    <textarea id="description" name="description" placeholder="Program Description"
                              defaultValue={description}
                              required onChange={handleDescriptionChange}
                              rows="20" cols="50"
                              style={{display: view === 'write' ? 'block' : 'none'}}
                    />
                ) : (
                    <div className="markdown-preview" style={{display: view === 'preview' ? 'block' : 'none'}}>
                        <ReactMarkdown>{description === '' ? 'Nothing here yet' : description}</ReactMarkdown>
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

export default AddModifyProgram;