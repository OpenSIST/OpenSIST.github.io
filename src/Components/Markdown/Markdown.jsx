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

// Image src may be an editor attachment token or an inline image data URL —
// both are safe and must survive react-markdown's URI sanitization. Everything
// else (including any other src) goes through defaultUrlTransform so unsafe
// protocols like javascript: can't slip in via user-authored markdown.
const POST_IMAGE_TOKEN_PREFIX = "opensist-image:";
// only the raster formats the app actually produces/accepts — deliberately
// excludes data:image/svg+xml and other non-raster payloads
const SAFE_IMAGE_DATA_URL = /^data:image\/(?:png|jpe?g|gif|webp|bmp|avif);/i;
const urlTransform = (value, key) => {
    if (key === 'src' && (value.startsWith(POST_IMAGE_TOKEN_PREFIX) || SAFE_IMAGE_DATA_URL.test(value))) {
        return value;
    }
    return defaultUrlTransform(value);
};

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
