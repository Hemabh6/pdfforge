"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

export default function FlattenClient() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState<{ fields: number } | null>(null);

  const flatten = async (f: File) => {
    setFile(f); setError(""); setDone(false); setStats(null);
    setProcessing(true);
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const form = doc.getForm();
      const fields = form.getFields();
      setStats({ fields: fields.length });
      form.flatten();
      const bytes = await doc.save({ useObjectStreams: false });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = f.name.replace(/\.pdf$/i, "_flat.pdf");
      a.click();
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to flatten PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="📋"
      title="Flatten PDF"
      description="Convert interactive form fields into static, non-editable content. Ideal before sharing or printing."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => flatten(f[0])} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-slate-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-slate-400 hover:text-slate-600 ml-3">✕</button>
          </div>

          {processing && <p className="text-indigo-600 text-sm animate-pulse mb-3">Flattening fields…</p>}
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {done && stats && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-3">
              <p className="text-green-700 text-sm font-medium">✅ Flattened PDF downloaded!</p>
              <p className="text-green-600 text-xs mt-1">
                {stats.fields > 0 ? `${stats.fields} form field${stats.fields !== 1 ? "s" : ""} converted to static content.` : "No form fields found — document saved as-is."}
              </p>
            </div>
          )}

          <button onClick={() => flatten(file)} disabled={processing} className="btn-primary w-full">
            {processing ? "Flattening…" : "Flatten & Download"}
          </button>
        </>
      )}

      <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
        <p className="font-medium mb-1">What flattening does:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Merges filled form data into the page content</li>
          <li>Removes interactive checkboxes, dropdowns, and text fields</li>
          <li>Prevents further editing of form values</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
