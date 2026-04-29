"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

export default function RepairClient() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const repair = async (f: File) => {
    setFile(f); setError(""); setDone(false); setPageCount(0);
    setProcessing(true);
    try {
      const buf = await f.arrayBuffer();
      // ignoreEncryption allows loading password-protected or damaged PDFs
      const doc = await PDFDocument.load(buf, {
        ignoreEncryption: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateMetadata: false as any,
      });
      setPageCount(doc.getPageCount());
      const bytes = await doc.save({ useObjectStreams: false });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = f.name.replace(/\.pdf$/i, "_repaired.pdf");
      a.click();
      setDone(true);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? `Could not repair: ${e.message}`
          : "The file appears too corrupted to recover."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="🔧"
      title="Repair PDF"
      description="Try to recover and rebuild a damaged or corrupted PDF file."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => repair(f[0])} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-blue-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-blue-400 hover:text-blue-600 ml-3">✕</button>
          </div>

          {processing && (
            <p className="text-indigo-600 text-sm animate-pulse mb-3">Analysing and repairing…</p>
          )}

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {done && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-3">
              <p className="text-green-700 text-sm font-medium">✅ Repaired PDF downloaded!</p>
              <p className="text-green-600 text-xs mt-1">{pageCount} page{pageCount !== 1 ? "s" : ""} recovered.</p>
            </div>
          )}

          <button
            onClick={() => repair(file)}
            disabled={processing}
            className="btn-primary w-full"
          >
            {processing ? "Repairing…" : "Try Again"}
          </button>
        </>
      )}

      <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
        <p className="font-medium mb-1">What gets fixed:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Corrupted cross-reference tables</li>
          <li>Broken encryption headers</li>
          <li>Malformed object streams</li>
        </ul>
        <p className="mt-2">Severely damaged files (truncated, zero-byte) may not be recoverable.</p>
      </div>
    </ToolLayout>
  );
}
