"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Quote, Undo, Redo, Link as LinkIcon, Minus,
} from "lucide-react";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write here…",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-40 px-4 py-3 focus:outline-none text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    
  }, [value]);

  if (!editor) return null;

  const btn =
    "inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors";
  const btnActive = "bg-brand-50 cursor-pointer text-brand-700 hover:bg-brand-100";

  return (
    <div className="rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
      
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`${btn} ${editor.isActive("bold") ? btnActive : ""}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`${btn} ${editor.isActive("italic") ? btnActive : ""}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btn} ${editor.isActive("heading", { level: 2 }) ? btnActive : ""}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${btn} ${editor.isActive("heading", { level: 3 }) ? btnActive : ""}`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btn} ${editor.isActive("bulletList") ? btnActive : ""}`}
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btn} ${editor.isActive("orderedList") ? btnActive : ""}`}
          title="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${btn} ${editor.isActive("blockquote") ? btnActive : ""}`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btn}
          title="Divider"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => {
            const url = window.prompt("URL:");
            if (!url) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          className={`${btn} ${editor.isActive("link") ? btnActive : ""}`}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className={btn}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className={btn}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>
      </div>

     
      <EditorContent editor={editor} />
    </div>
  );
}