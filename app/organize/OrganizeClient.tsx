"use client";
import { useState, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

interface PageEntry {
  originalIndex: number;
  rotation: number; // additional rotation in degrees
  thumbnail: string; // data URL
  deleted: boolean;
}

export default function OrganizeClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const loadFile = async (f: File) => {
    setFile(f); setPages([]); setError("");
    setLoading(true);
    try {
      const pdfjsLib = await loadPdfjs();
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const entries: PageEntry[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        entries.push({ originalIndex: i - 1, rotation: 0, thumbnail: canvas.toDataURL("image/jpeg", 0.7), deleted: false });
      }
      setPages(entries);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load PDF.");
    } finally {
      setLoading(false);
    }
  };

  const rotate = (i: number, deg: number) => {
    setPages((prev) => prev.map((p, idx) => idx === i ? { ...p, rotation: (p.rotation + deg + 360) % 360 } : p));
  };

  const toggleDelete = (i: number) => {
    setPages((prev) => prev.map((p, idx) => idx === i ? { ...p, deleted: !p.deleted } : p));
  };

  const onDragStart = (i: number) => setDragIdx(i);
  const onDragEnter = (i: number) => setDragOver(i);
  const onDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); setDragOver(null); return; }
    setPages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(dragIdx, 1);
      arr.splice(targetIdx, 0, item);
      return arr;
    });
    setDragIdx(null); setDragOver(null);
  };

  const save = async () => {
    if (!file) return;
    const activePages = pages.filter((p) => !p.deleted);
    if (activePages.length === 0) { setError("No pages remaining."); return; }
    setProcessing(true); setError("");
    try {
      const buf = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buf);
      const newDoc = await PDFDocument.create();

      for (const entry of activePages) {
        const [copied] = await newDoc.copyPages(srcDoc, [entry.originalIndex]);
        if (entry.rotation !== 0) {
          copied.setRotation(degrees((copied.getRotation().angle + entry.rotation) % 360));
        }
        newDoc.addPage(copied);
      }

      const bytes = await newDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "_organized.pdf");
      a.click();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const activePagesCount = pages.filter((p) => !p.deleted).length;

  return (
    <ToolLayout
      icon="📑"
      title="Organize PDF"
      description="Drag pages to reorder, rotate, or delete them — then download the result."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => loadFile(f[0])} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-violet-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setPages([]); }} className="text-violet-400 hover:text-violet-600 ml-3">✕</button>
          </div>

          {loading && <p className="text-indigo-600 text-sm animate-pulse mb-3">Loading page thumbnails…</p>}
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {pages.length > 0 && (
            <>
              <p className="text-xs text-gray-500 mb-3">Drag to reorder · Rotate · Mark for deletion (red)</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-5">
                {pages.map((entry, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(i)}
                    onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                    className={`relative rounded-lg border-2 transition-all cursor-grab select-none
                      ${entry.deleted ? "border-red-400 opacity-50" : dragOver === i ? "border-indigo-500 scale-105" : "border-gray-200"}
                    `}
                  >
                    <div className="overflow-hidden rounded-md" style={{ transform: `rotate(${entry.rotation}deg)`, transition: "transform 0.2s" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={entry.thumbnail} alt={`Page ${i + 1}`} className="w-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5 rounded-b-md">
                      {i + 1}
                    </div>
                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                      <button onClick={() => rotate(i, -90)} className="bg-white/90 hover:bg-white rounded text-xs w-5 h-5 flex items-center justify-center shadow" title="Rotate left">↺</button>
                      <button onClick={() => rotate(i, 90)} className="bg-white/90 hover:bg-white rounded text-xs w-5 h-5 flex items-center justify-center shadow" title="Rotate right">↻</button>
                      <button onClick={() => toggleDelete(i)} className={`rounded text-xs w-5 h-5 flex items-center justify-center shadow ${entry.deleted ? "bg-red-500 text-white" : "bg-white/90 hover:bg-red-50"}`} title={entry.deleted ? "Restore" : "Delete"}>
                        {entry.deleted ? "↩" : "✕"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={save}
                disabled={processing || activePagesCount === 0}
                className="btn-primary w-full"
              >
                {processing ? "Saving…" : `Save ${activePagesCount} page${activePagesCount !== 1 ? "s" : ""} as PDF`}
              </button>
            </>
          )}
        </>
      )}
    </ToolLayout>
  );
}
