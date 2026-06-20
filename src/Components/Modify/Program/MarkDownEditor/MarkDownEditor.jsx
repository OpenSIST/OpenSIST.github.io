import '@mdxeditor/editor/style.css'
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    ButtonWithTooltip,
    CodeToggle,
    CreateLink,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    headingsPlugin,
    imagePlugin,
    InsertTable,
    InsertThematicBreak,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo
} from "@mdxeditor/editor";
import {useTheme} from "@mui/material";
import {AddPhotoAlternate} from "@mui/icons-material";
import {useMemo, useRef} from "react";
import "./dark-editor.css"

function escapeMarkdownLinkText(text) {
    return text
        .replaceAll("\\", "\\\\")
        .replaceAll("[", "\\[")
        .replaceAll("]", "\\]");
}

function InsertDiskImage({editorRef, onAttachmentPrepared, onMarkdownError}) {
    const inputRef = useRef(null);

    function onFileChange(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) {
            return;
        }
        if (!file.type.startsWith("image/")) {
            onMarkdownError?.("只能插入图片文件。");
            return;
        }
        const token = onAttachmentPrepared?.(file);
        if (!token) {
            return;
        }
        const markdown = `![${escapeMarkdownLinkText(file.name)}](${token})`;
        onMarkdownError?.("");
        editorRef.current?.focus(() => {
            editorRef.current?.insertMarkdown(markdown);
        }, {defaultSelection: 'rootEnd'});
    }

    return (
        <>
            <ButtonWithTooltip title="从本地上传图片" type="button" onClick={() => inputRef.current?.click()}>
                <AddPhotoAlternate fontSize="small"/>
            </ButtonWithTooltip>
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFileChange}/>
        </>
    );
}

function shouldFocusEditorFromClick(target) {
    if (!(target instanceof Element)) {
        return false;
    }
    if (target.closest(".MarkDownToolBar, [contenteditable='true'], button, input, textarea, select, a, [role='button']")) {
        return false;
    }
    return Boolean(target.closest(".mdxeditor-root-contenteditable"));
}

export default function MarkDownEditor({
                                           Description,
                                           setDescription,
                                           allowAttachments = false,
                                           onAttachmentPrepared,
                                           resolveAttachmentPreview,
                                           onMarkdownError
                                       }) {
    const theme = useTheme();
    const editorRef = useRef(null);
    const darkMode = theme.palette.mode === 'dark';

    function handleEditorMouseDown(event) {
        if (!shouldFocusEditorFromClick(event.target)) {
            return;
        }
        event.preventDefault();
        editorRef.current?.focus(undefined, {defaultSelection: 'rootEnd'});
    }

    const attachmentPlugins = useMemo(() => {
        if (!allowAttachments) {
            return [];
        }
        return [
            imagePlugin({
                imageUploadHandler: async (file) => {
                    if (!file.type.startsWith("image/")) {
                        onMarkdownError?.("只能以图片方式插入图片文件。");
                        throw new Error("Only image files can be inserted as images.");
                    }
                    const token = onAttachmentPrepared?.(file);
                    if (!token) {
                        throw new Error("Post content is too large.");
                    }
                    onMarkdownError?.("");
                    return token;
                },
                imagePreviewHandler: (src) => resolveAttachmentPreview?.(src) ?? src,
                disableImageResize: true,
                disableImageSettingsButton: true,
            })
        ];
    }, [allowAttachments, onAttachmentPrepared, resolveAttachmentPreview, onMarkdownError]);

    return (
        <div className="MarkDownEditorFocusLayer" onMouseDownCapture={handleEditorMouseDown}
             style={{
                 '--md-editor-bg': darkMode ? theme.palette.surface : theme.palette.surfaceVariant,
                 '--md-editor-border': theme.palette.divider,
             }}>
            <MDXEditor
                ref={editorRef}
                markdown={Description}
                onChange={(value) => {
                    setDescription(value)
                }}
                className={"MarkDownEditor " + (darkMode ? "dark-theme dark-editor" : "light-theme")}
                contentEditableClassName="MarkDownEditorContent"
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    ...attachmentPlugins,
                    linkPlugin(),
                    linkDialogPlugin({}),
                    tablePlugin(),
                    markdownShortcutPlugin(),
                    diffSourcePlugin({viewMode: 'rich-text'}),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <div className='MarkDownToolBar'>
                                <DiffSourceToggleWrapper options={['rich-text', 'source']}>
                                    <UndoRedo/>
                                    <Separator/>
                                    <BoldItalicUnderlineToggles/>
                                    <CodeToggle/>
                                    <Separator/>
                                    <ListsToggle/>
                                    <Separator/>
                                    <BlockTypeSelect/>
                                    <Separator/>
                                    <CreateLink/>
                                    {allowAttachments ? <>
                                        <InsertDiskImage
                                            editorRef={editorRef}
                                            onAttachmentPrepared={onAttachmentPrepared}
                                            onMarkdownError={onMarkdownError}
                                        />
                                    </> : null}
                                    <InsertTable/>
                                    <InsertThematicBreak/>
                                </DiffSourceToggleWrapper>
                            </div>)
                    })
                ]}
            />
        </div>
    )
}

function Separator() {
    return (
        <div
            data-orientation="vertical" aria-orientation="vertical" role="separator">
        </div>
    )
}
