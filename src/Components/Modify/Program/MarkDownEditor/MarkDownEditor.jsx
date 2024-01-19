import '@mdxeditor/editor/style.css'
import {
    BlockTypeSelect,
    CodeToggle, CreateLink,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    InsertTable,
    InsertThematicBreak,
    linkDialogPlugin,
    ListsToggle, markdownShortcutPlugin,
    MDXEditor, tablePlugin,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    linkPlugin,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles
} from "@mdxeditor/editor";
import {useTheme} from "@mui/material";
import "./dark-editor.css"

export default function MarkDownEditor({OriginDesc, Description, setDescription}) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <div
            className="MarkDownEditor"
        >
            <MDXEditor
                markdown={Description}
                onChange={(value) => {
                    setDescription(value)
                }}
                className={darkMode ? "dark-theme dark-editor" : ""}
                contentEditableClassName="MarkDownEditorContent"
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    linkPlugin(),
                    linkDialogPlugin({}),
                    tablePlugin(),
                    markdownShortcutPlugin(),
                    diffSourcePlugin({viewMode: 'rich-text', diffMarkdown: OriginDesc}),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <div className='MarkDownToolBar'>
                                <DiffSourceToggleWrapper>
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