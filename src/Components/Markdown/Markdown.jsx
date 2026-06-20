import React, {useEffect, useState} from "react";
import ReactMarkdown, {defaultUrlTransform} from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "./Markdown.css";

// Single source of truth for rendering markdown across the app (program/post
// detail pages AND the editor preview) so what authors see while editing is
// exactly what readers get. CommonMark + GFM, same as the editor.

// Image src may be an async-resolved attachment token (editor) or a plain
// URL / data URL (saved content). Resolve both.
function ResolvedImage({src, resolveImage, node, alt, ...props}) {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        let alive = true;
        Promise.resolve(resolveImage ? resolveImage(src) : src)
            .then((u) => alive && setUrl(u ?? null))
            .catch(() => alive && setUrl(src));
        return () => {
            alive = false;
        };
    }, [src, resolveImage]);
    if (!url) return null;
    return <img src={url} alt={alt ?? ""} loading="lazy" {...props}/>;
}

// keep image src (tokens / data URLs) intact; sanitize everything else
const urlTransform = (value, key) => (key === 'src' ? value : defaultUrlTransform(value));

export default function Markdown({children, resolveImage, className}) {
    const components = {
        img: (props) => <ResolvedImage {...props} resolveImage={resolveImage}/>,
        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer"/>,
    };
    return (
        <div className={"md-body" + (className ? ` ${className}` : "")}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components} urlTransform={urlTransform}>
                {children ?? ""}
            </ReactMarkdown>
        </div>
    );
}
