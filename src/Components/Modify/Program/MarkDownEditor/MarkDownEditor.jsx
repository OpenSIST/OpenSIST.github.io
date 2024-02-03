import '@mdxeditor/editor/style.css'
import {
    BlockTypeSelect,
    CodeToggle, CreateLink,
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

export default function MarkDownEditor({Description, setDescription}) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    return (
        <MDXEditor
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
                linkPlugin(),
                linkDialogPlugin({}),
                tablePlugin(),
                markdownShortcutPlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <div className='MarkDownToolBar'>
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
                        </div>)
                })
            ]}
        />
    )
}

function Separator() {
    return (
        <div
            data-orientation="vertical" aria-orientation="vertical" role="separator">
        </div>
    )
}