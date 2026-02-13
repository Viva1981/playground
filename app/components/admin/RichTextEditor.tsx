// app/components/admin/RichTextEditor.tsx
"use client";

import { useRef, useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Szöveg...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || "";
      setIsInitialized(true);
    }
  }, [isInitialized, value]);

  const handleCommand = useCallback((command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
  }, []);

  const handleChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt("Link URL:");
    if (url) {
      document.execCommand("createLink", false, url);
    }
    editorRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Z / Cmd+Z undo, Ctrl+Y / Cmd+Y redo
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      document.execCommand("undo");
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      e.preventDefault();
      document.execCommand("redo");
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-neutral-100 border-b p-2 flex flex-wrap gap-2 items-center">
        {/* Text formatting */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand("bold");
          }}
          className="px-3 py-1 rounded hover:bg-neutral-200 font-bold text-sm transition"
          title="Félkövér (Ctrl+B)"
        >
          B
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand("italic");
          }}
          className="px-3 py-1 rounded hover:bg-neutral-200 italic text-sm transition"
          title="Dőlt (Ctrl+I)"
        >
          I
        </button>

        <button
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand("underline");
          }}
          className="px-3 py-1 rounded hover:bg-neutral-200 underline text-sm transition"
          title="Aláhúzott (Ctrl+U)"
        >
          U
        </button>

        <div className="w-px bg-neutral-300 mx-1"></div>

        {/* Link */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            insertLink();
          }}
          className="px-3 py-1 rounded hover:bg-neutral-200 text-sm transition"
          title="Link beillesztése"
        >
          🔗 Link
        </button>

        <div className="w-px bg-neutral-300 mx-1"></div>

        {/* Clear formatting */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand("removeFormat");
          }}
          className="px-3 py-1 rounded hover:bg-neutral-200 text-xs text-neutral-500 transition"
          title="Formázás eltávolítása"
        >
          ✕ törlés
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onBlur={handleChange}
        onKeyDown={handleKeyDown}
        className="p-4 bg-white outline-none text-sm overflow-auto focus:ring-0"
        style={{ minHeight, maxHeight: "400px" }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
