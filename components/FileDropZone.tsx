"use client";
import { useState, DragEvent, ChangeEvent } from "react";

interface Props {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
}

export default function FileDropZone({
  onFiles,
  accept = ".pdf,application/pdf",
  multiple = false,
  label = "Drop your PDF here or click to browse",
}: Props) {
  const [dragging, setDragging] = useState(false);

  const handle = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf") || f.type === ""
    );
    if (arr.length) onFiles(arr);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handle(e.dataTransfer.files);
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`drop-zone rounded-xl p-6 sm:p-10 text-center cursor-pointer select-none block ${dragging ? "drag-over" : ""}`}
      aria-label="File upload area"
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="text-4xl mb-3">📄</div>
      <p className="text-gray-600 font-medium">{label}</p>
      <p className="text-sm text-gray-400 mt-1">
        {multiple ? "PDF files only · select multiple" : "PDF files only"}
      </p>
    </label>
  );
}
