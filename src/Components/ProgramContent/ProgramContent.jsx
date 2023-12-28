import './css/github.css'
import ReactMarkdown from 'react-markdown'

export default function ProgramContent({programDesc}) {
    return (
        <>
            <ReactMarkdown>{programDesc}</ReactMarkdown>
        </>
    )
}