import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import "./AddModifyProgram.css";

function AddModifyProgram() {
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

    return (
        <div className='MainBody'>
            <form className='ProgramForm'>
                <h1 id="Title">Add or Modify Program</h1>
                <h4 className='Subtitle'>Add University Name</h4>
                <input type="text" id="university" name="university" placeholder="University Name" required/>
                <h4 className='Subtitle'>Add Program Name</h4>
                <input type="text" id="program" name="program" placeholder="Program Name" required/>
                <h4 className='Subtitle'>Add Target Applicant Major</h4>
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
                              value={description} required onChange={handleDescriptionChange}
                              rows="20" cols="50" style={{display: view === 'write' ? 'block' : 'none'}}
                    />
                ) : (
                    <div className="markdown-preview" style={{display: view === 'preview' ? 'block' : 'none'}}>
                        <ReactMarkdown>{description}</ReactMarkdown>
                    </div>
                )}
                <button>Submit</button>
            </form>
        </div>
    )
}

export default AddModifyProgram;