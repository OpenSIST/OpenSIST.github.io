import './css/github.css'
import ReactMarkdown from 'react-markdown'

export default function ProgramContent({programDesc}) {
    return (
        <div>
            <ReactMarkdown>{programDesc}</ReactMarkdown>
        </div>
    );
}