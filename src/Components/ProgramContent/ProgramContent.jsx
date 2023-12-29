import './css/github.css'
import ReactMarkdown from 'react-markdown'

export default function ProgramContent({programDesc, className}) {
    if (programDesc === '') {
        return null
    }
    return (
            <div className={className}>
                <ReactMarkdown>{programDesc}</ReactMarkdown>
            </div>
    );
}