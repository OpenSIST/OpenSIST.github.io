import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Box, Divider, IconButton, ToggleButton, ToggleButtonGroup, Tooltip, useTheme} from "@mui/material";
import {
    AddPhotoAlternateOutlined,
    CodeOutlined,
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    FormatListNumbered,
    FormatQuoteOutlined,
    InsertLinkOutlined,
    TableChartOutlined,
    TitleOutlined,
} from "@mui/icons-material";
import ReactMarkdown, {defaultUrlTransform} from "react-markdown";
import remarkGfm from "remark-gfm";
import {useSmallPage} from "../../../common";
import "./MarkDownEditor.css";

// Resolve an image src that may be an async-resolved attachment token (posts)
// or a plain URL (programs).
function PreviewImage({src, resolve, node, alt, ...props}) {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        let alive = true;
        Promise.resolve(resolve ? resolve(src) : src)
            .then((u) => alive && setUrl(u ?? null))
            .catch(() => alive && setUrl(src));
        return () => {
            alive = false;
        };
    }, [src, resolve]);
    if (!url) return null;
    return <img src={url} alt={alt ?? ""} loading="lazy" {...props}/>;
}

function ToolBtn({title, onClick, children}) {
    return (
        <Tooltip title={title} arrow>
            <IconButton size="small" onClick={onClick} sx={{color: 'text.secondary'}}>{children}</IconButton>
        </Tooltip>
    );
}

export default function MarkDownEditor({
                                          Description,
                                          setDescription,
                                          allowAttachments = false,
                                          onAttachmentPrepared,
                                          resolveAttachmentPreview,
                                          onMarkdownError,
                                      }) {
    const theme = useTheme();
    const dark = theme.palette.mode === 'dark';
    const smallPage = useSmallPage();
    const taRef = useRef(null);
    const fileRef = useRef(null);
    const [view, setView] = useState(() => (smallPage ? 'write' : 'split'));

    const apply = useCallback((fn) => {
        const ta = taRef.current;
        if (!ta) return;
        const {selectionStart: s, selectionEnd: e, value} = ta;
        const {text, selStart, selEnd} = fn(value, s, e, value.slice(s, e));
        setDescription(text);
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(selStart, selEnd);
        });
    }, [setDescription]);

    const wrap = (token) => apply((v, s, e, sel) => ({
        text: v.slice(0, s) + token + sel + token + v.slice(e),
        selStart: s + token.length,
        selEnd: e + token.length,
    }));
    const prefixLines = (prefix) => apply((v, s, e) => {
        const lineStart = v.lastIndexOf('\n', s - 1) + 1;
        const block = v.slice(lineStart, e);
        const replaced = block.split('\n').map((l) => prefix + l).join('\n');
        return {text: v.slice(0, lineStart) + replaced + v.slice(e), selStart: lineStart, selEnd: lineStart + replaced.length};
    });
    const insert = (snippet, cursorOffset) => apply((v, s, e) => {
        const pos = s + (cursorOffset ?? snippet.length);
        return {text: v.slice(0, s) + snippet + v.slice(e), selStart: pos, selEnd: pos};
    });

    const onFile = (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            onMarkdownError?.("只能插入图片文件。");
            return;
        }
        const token = onAttachmentPrepared?.(file);
        if (!token) return;
        onMarkdownError?.("");
        insert(`![${file.name}](${token})`);
    };

    const components = useMemo(() => ({
        img: (props) => <PreviewImage {...props} resolve={resolveAttachmentPreview}/>,
        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer"/>,
    }), [resolveAttachmentPreview]);

    // keep image src (tokens / data URLs) intact; sanitize everything else
    const urlTransform = useCallback((value, key) => (key === 'src' ? value : defaultUrlTransform(value)), []);

    return (
        <Box
            className="MD2"
            sx={{
                '--md2-bg': dark ? theme.palette.surface : theme.palette.surfaceVariant,
                '--md2-border': theme.palette.divider,
                '--md2-code-bg': dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.06)',
            }}
        >
            <Box className="MD2-toolbar">
                <ToolBtn title="标题" onClick={() => prefixLines('## ')}><TitleOutlined fontSize="small"/></ToolBtn>
                <ToolBtn title="加粗" onClick={() => wrap('**')}><FormatBold fontSize="small"/></ToolBtn>
                <ToolBtn title="斜体" onClick={() => wrap('*')}><FormatItalic fontSize="small"/></ToolBtn>
                <ToolBtn title="行内代码" onClick={() => wrap('`')}><CodeOutlined fontSize="small"/></ToolBtn>
                <Divider orientation="vertical" flexItem sx={{mx: 0.5, my: 0.5}}/>
                <ToolBtn title="引用" onClick={() => prefixLines('> ')}><FormatQuoteOutlined fontSize="small"/></ToolBtn>
                <ToolBtn title="无序列表" onClick={() => prefixLines('- ')}><FormatListBulleted fontSize="small"/></ToolBtn>
                <ToolBtn title="有序列表" onClick={() => prefixLines('1. ')}><FormatListNumbered fontSize="small"/></ToolBtn>
                <Divider orientation="vertical" flexItem sx={{mx: 0.5, my: 0.5}}/>
                <ToolBtn title="链接" onClick={() => insert('[链接文字](https://)', 1)}><InsertLinkOutlined fontSize="small"/></ToolBtn>
                <ToolBtn title="表格" onClick={() => insert('\n| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |\n')}><TableChartOutlined fontSize="small"/></ToolBtn>
                {allowAttachments &&
                    <ToolBtn title="上传图片" onClick={() => fileRef.current?.click()}><AddPhotoAlternateOutlined fontSize="small"/></ToolBtn>}
                <Box sx={{flex: 1, minWidth: 8}}/>
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={view}
                    onChange={(e, v) => v && setView(v)}
                    className="MD2-viewtoggle"
                >
                    <ToggleButton value="write">编辑</ToggleButton>
                    <ToggleButton value="split">并排</ToggleButton>
                    <ToggleButton value="preview">预览</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box className="MD2-body">
                {view !== 'preview' && (
                    <textarea
                        ref={taRef}
                        className="MD2-textarea"
                        value={Description}
                        spellCheck={false}
                        placeholder="在此输入 Markdown（支持 GFM：标题、列表、表格、链接、图片……）"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                )}
                {view !== 'write' && (
                    <Box className="MD2-preview">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={urlTransform}>
                            {Description}
                        </ReactMarkdown>
                    </Box>
                )}
            </Box>

            {allowAttachments && <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile}/>}
        </Box>
    );
}
