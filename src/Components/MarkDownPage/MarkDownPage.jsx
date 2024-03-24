import ReactMarkdown from "react-markdown";
import "./MarkDownPage.css"
import {useLoaderData} from "react-router-dom";
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {Paper} from "@mui/material";
export default function MarkDownPage({sx}) {
    const {content} = useLoaderData();
    return (
        <Paper className="MarkDownPaper" sx={{...sx}}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} className="MarkDownContent">
                {content}
            </ReactMarkdown>
        </Paper>
    )
}