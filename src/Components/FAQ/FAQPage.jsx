import ReactMarkdown from "react-markdown";
import MDPath from "../../Data/FAQ.md";
import {useEffect, useState} from "react";
import {Paper, Typography} from "@mui/material";
import "./FAQPage.css"


export default function FAQPage() {
    const [markDown, setMarkDown] = useState("");
    useEffect(() => {
        fetch(MDPath)
            .then((response) => response.text())
            .then((text) => setMarkDown(text));
    }, []);
    console.log(markDown)
    return (
        <Paper className="FAQPage">
            <Typography variant="h3" sx={{alignSelf: 'center'}}>常见问题</Typography>
            <ReactMarkdown className="FAQContent">
                {markDown}
            </ReactMarkdown>
        </Paper>
    )
}