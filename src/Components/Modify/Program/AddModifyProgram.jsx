import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import "./AddModifyProgram.css";
import {addModifyProgram} from "../../../Data";

function AddModifyProgram({addProgram, setAddProgram, className}) {
    const [description, setDescription] = useState('');
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
            const response = await addModifyProgram(data);
            if (response.success) {
                alert("Program Added/Modified Successfully!");
                setAddProgram(false);
            } else {
                const content = await response.json();
                alert(`${content.error}, Error code: ${response.status}`);
            }
        } catch (e) {
            alert(e)
        }
    }

    if (!addProgram) {
        return null;
    }

    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className='ProgramForm'>
                <h1 id="Title">Add or Modify Program</h1>
                <h4 className='Subtitle'>Add University Name</h4>
                <input type="text" id="university" name="university" placeholder="University Name" required/>
                <h4 className='Subtitle'>Add Program Name</h4>
                <input type="text" id="program" name="program" placeholder="Program Name" required/>
                    <h4 className='Subtitle'>Add Target Applicant Major (Multi-options)</h4>
                <div className="TargetApplicantMajorOption">
                    <input type="checkbox" id="CS" name="TargetApplicantMajor" value="CS"/>
                    <label htmlFor="CS">CS</label>
                </div>
                <div className="TargetApplicantMajorOption">
                    <input type="checkbox" id="EE" name="TargetApplicantMajor" value="EE"/>
                    <label htmlFor="EE">EE</label>
                </div>
                <div className="TargetApplicantMajorOption">
                    <input type="checkbox" id="IE" name="TargetApplicantMajor" value="IE"/>
                    <label htmlFor="IE">IE</label>
                </div>
                <h4 className='Subtitle'>Add Program Description</h4>
                <div>
                    <button type="button" onClick={handleWriteClick}>Write</button>
                    <button type="button" onClick={handlePreviewClick}>Preview</button>
                </div>
                {view === 'write' ? (
                    <textarea id="description" name="description" placeholder="Program Description"
                              value={description}
                              required onChange={handleDescriptionChange}
                              rows="20" cols="50"
                              style={{display: view === 'write' ? 'block' : 'none'}}
                    />
                ) : (
                    <div className="markdown-preview" style={{display: view === 'preview' ? 'block' : 'none'}}>
                        <ReactMarkdown>{description === '' ? 'Nothing here yet' : description}</ReactMarkdown>
                    </div>
                )}
                <div>
                    <button type="submit">Submit</button>
                    <button onClick={() => setAddProgram(false)}>Cancel</button>
                </div>
            </form>
        </div>
    )
}

export default AddModifyProgram;