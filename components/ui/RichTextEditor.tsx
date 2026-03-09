"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";

function Toolbar({ editor, visible }: { editor: Editor | null; visible: boolean }) {
  if (!editor || !visible) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-border border-b-0 bg-muted/50 px-1.5 py-1 transition-opacity"
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""}
        aria-label="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""}
        aria-label="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "bg-accent text-accent-foreground" : ""}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Button>
      <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-accent text-accent-foreground" : ""}
        aria-label="Bullet list"
      >
        <List className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-accent text-accent-foreground" : ""}
        aria-label="Numbered list"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        aria-label="Horizontal rule"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        aria-label="Undo"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        aria-label="Redo"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  disabled?: boolean;
  plainTextFallback?: boolean;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something…",
  className,
  minHeight = "6rem",
  disabled = false,
  plainTextFallback = true,
}: RichTextEditorProps) {
  const [toolbarVisible, setToolbarVisible] = React.useState(false);
  const isPlain = plainTextFallback && !value.trim().startsWith("<");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        code: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value?.trim() ? (isPlain ? value : value) : "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-w-0 max-w-full overflow-x-hidden wrap-break-word outline-none px-3 py-2 text-base md:text-sm focus:outline-none",
      },
      handleDOMEvents: {
        focus: () => setToolbarVisible(true),
        blur: () => setToolbarVisible(false),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html === "<p></p>" || html === "<p><br></p>") {
        onChange("");
        return;
      }
      onChange(html);
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = isPlain ? value : value || "<p></p>";
    const nextNorm = next === "" ? "<p></p>" : next;
    if (current !== nextNorm) {
      editor.commands.setContent(nextNorm, { emitUpdate: false });
    }
  }, [editor, value, isPlain]);

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-md border border-input bg-transparent dark:bg-input/30 min-h-16 animate-pulse",
          className,
        )}
        style={{ minHeight }}
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <Toolbar editor={editor} visible={toolbarVisible} />
      <EditorContent
        editor={editor}
        className="rich-text-editor-content"
        style={{ minHeight }}
      />
    </div>
  );
}
