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
    MDXEditor, tablePlugin
} from "@mdxeditor/editor";
import {headingsPlugin} from "@mdxeditor/editor/plugins/headings";
import {listsPlugin} from "@mdxeditor/editor/plugins/lists";
import {quotePlugin} from "@mdxeditor/editor/plugins/quote";
import {thematicBreakPlugin} from "@mdxeditor/editor/plugins/thematic-break";
import {linkPlugin} from "@mdxeditor/editor/plugins/link";
import {toolbarPlugin} from "@mdxeditor/editor/plugins/toolbar";
import {UndoRedo} from "@mdxeditor/editor/plugins/toolbar/components/UndoRedo";
import {BoldItalicUnderlineToggles} from "@mdxeditor/editor/plugins/toolbar/components/BoldItalicUnderlineToggles";

export default function MarkDownEditor({ OriginDesc, Description, setDescription}) {
    return (
        <div className="MarkDownEditor">
            <MDXEditor
                markdown={Description}
                onChange={(value) => {
                    setDescription(value)
                }}
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