'use client';
// ❌ DELETED: import * as Y from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
// ❌ DELETED: import { WebsocketProvider } from 'y-websocket';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useRef } from 'react';

// ✅ Updated Interface (changed Y.Doc to any)
interface EditorProps {
  content: string;
  editable?: boolean;
  onUpdate?: (json: string) => void;
  ydoc?: any | null;       // ✅ Changed from Y.Doc
  provider?: any | null; 
  user?: { name: string; color: string } | null;
  documentId?: string;
  ownerId?: string;
}

export default function Editor({ content, editable = true, onUpdate, ydoc, provider, user, documentId, ownerId }: EditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCollaborating = !!ydoc && !!provider;
  const lastSyncedContent = useRef<string>('');

    const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // @ts-expect-error - history is a valid StarterKit config option to disable local undo/redo for Collaboration
        history: false, 
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      
      ...(isCollaborating
        ? [
            Collaboration.configure({
              document: ydoc,
              provider: provider, 
            }),
          ]
        : []),
    ],
    content: parseContent(content),
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[60vh] px-1 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      // When collaborating, we need to sync Y.js changes to the database
      if (isCollaborating && ydoc) {
        const currentContent = JSON.stringify(editor.getJSON());
        
        // Only trigger save if content has actually changed
        if (currentContent !== lastSyncedContent.current) {
          if (onUpdate) {
            onUpdate(currentContent);
          }
          lastSyncedContent.current = currentContent;
        }
        return;
      }
      
      // For non-collaborative mode, use the regular update handler
      if (onUpdate) {
        onUpdate(JSON.stringify(editor.getJSON()));
      }
    },
  });

  // Listen for Y.js changes and trigger updates
  useEffect(() => {
    if (!isCollaborating || !ydoc || !onUpdate) return;

    const handleChange = () => {
      const json = ydoc.getMap('content').toJSON();
      const contentString = JSON.stringify(json);
      
      // Only trigger save if content has actually changed
      if (contentString !== lastSyncedContent.current) {
        onUpdate(contentString);
        lastSyncedContent.current = contentString;
      }
    };

    ydoc.on('update', handleChange);
    return () => {
      ydoc.off('update', handleChange);
    };
  }, [isCollaborating, ydoc, onUpdate]);

  // Update content when prop changes (only if NOT collaborating)
  useEffect(() => {
    if (editor && content && !isCollaborating) {
      const currentJson = JSON.stringify(editor.getJSON());
      const newJson = JSON.stringify(parseContent(content));
      if (currentJson !== newJson) {
        editor.commands.setContent(parseContent(content));
      }
    }
  }, [content, editor, isCollaborating]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-pulse text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Fixed Toolbar */}
      {editable && <EditorToolbar editor={editor} />}

      {/* Editor Content */}
      <div className="mt-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Toolbar Component
function EditorToolbar({ editor }: { editor: any }) {
  return (
    <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-xl p-2 flex flex-wrap items-center gap-0.5 shadow-sm mb-4">
      {/* Text Style */}
      <ToolGroup>
        <SelectButton
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
            editor.isActive('heading', { level: 2 }) ? 'h2' :
            editor.isActive('heading', { level: 3 }) ? 'h3' : 'paragraph'
          }
          onChange={(value) => {
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: parseInt(value.replace('h', '')) as 1 | 2 | 3 }).run();
            }
          }}
        />
      </ToolGroup>

      <div className="w-px h-7 bg-gray-200 mx-1" />

      {/* Formatting */}
      <ToolGroup>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><span className="font-bold text-sm">B</span></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><span className="italic text-sm">I</span></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><span className="underline text-sm">U</span></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><span className="line-through text-sm">S</span></ToolbarButton>
      </ToolGroup>

      <div className="w-px h-7 bg-gray-200 mx-1" />

      {/* Lists */}
      <ToolGroup>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        </ToolbarButton>
      </ToolGroup>

      <div className="w-px h-7 bg-gray-200 mx-1" />

      {/* Alignment */}
      <ToolGroup>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" /></svg>
        </ToolbarButton>
      </ToolGroup>

      <div className="w-px h-7 bg-gray-200 mx-1" />

      {/* Blockquote & Code */}
      <ToolGroup>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.271 0-2.406-.541-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.271 0-2.406-.541-2.917-1.179z" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </ToolbarButton>
      </ToolGroup>

      <div className="w-px h-7 bg-gray-200 mx-1" />

      {/* Undo/Redo */}
      <ToolGroup>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" /></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" /></svg>
        </ToolbarButton>
      </ToolGroup>
    </div>
  );
}

// UI Components
function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolbarButton({ children, onClick, active = false, disabled = false, title = '' }: { children: React.ReactNode; onClick: () => void; active?: boolean; disabled?: boolean; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
        active ? 'bg-indigo-100 text-indigo-700' : disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}>
      {children}
    </button>
  );
}

function SelectButton({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-8 px-2 rounded-md text-sm text-gray-700 bg-white border border-gray-200 hover:border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors cursor-pointer">
      <option value="paragraph">Paragraph</option>
      <option value="h1">Heading 1</option>
      <option value="h2">Heading 2</option>
      <option value="h3">Heading 3</option>
    </select>
  );
}

function parseContent(content: string): any {
  try {
    return JSON.parse(content);
  } catch {
    return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] };
  }
}