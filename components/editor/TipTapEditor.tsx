
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl shadow-lg my-6 max-w-full h-auto border border-gray-100',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Bắt đầu viết câu chuyện của bạn...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg sm:prose-xl max-w-none focus:outline-none min-h-[500px] text-gray-800 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }, []); // Only initialize once

  // Sync content updates from parent (e.g. when data is loaded)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
       // Only set content if it's different to prevent cursor jumping or infinite loops
       // Simple check: if editor is empty and content is not, or if significantly different
       // A strict check might interrupt typing if parent updates frequently, but here parent updates on onUpdate.
       // So we mainly care about the initial load or external reset.
       
       // Use a heuristic: if editor is empty (or just <p></p>) and content is provided, set it.
       if (editor.isEmpty && content) {
           editor.commands.setContent(content);
       }
    }
  }, [content, editor]);

  return (
    <div className="relative">
      <EditorToolbar editor={editor} />
      <div className="mt-8 px-4 sm:px-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
