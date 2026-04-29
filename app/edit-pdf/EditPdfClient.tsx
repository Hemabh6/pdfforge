"use client";
import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

interface Annotation {
  page: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export default function EditPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(700);
  const [fontSize, setFontSize] = useState(14);
  const [color, setColor] = useState("#000000");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const loadFile = async (f: File) => {
    setFile(f); setAnnotations([]); setError(""); setDone(false);
    try {
      const { PDFDocument: PD } = await import("pdf-lib");
      const buf = await f.arrayBuffer();
      const doc = await PD.load(buf);
      setPageCount(doc.getPageCount());
      setPage(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load PDF.");
    }
  };

  const addAnnotation = () => {
    if (!text.trim()) { setError("Enter some text to add."); return; }
    setAnnotations((prev) => [...prev, { page: page - 1, text, x, y, fontSize, color }]);
    setText("");
    setError("");
  };

  const remove = (i: number) => setAnnotations((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!file || annotations.length === 0) { setError("Add at least one text annotation."); return; }
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      for (const ann of annotations) {
        const p = pages[ann.page];
        if (!p) continue;
        const [r, g, b] = hexToRgb(ann.color);
        p.drawText(ann.text, { x: ann.x, y: ann.y, size: ann.fontSize, font, color: rgb(r, g, b) });
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "_edited.pdf");
      a.click();
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="✏️"
      title="Edit PDF"
      description="Add text annotations to any page of your PDF. Specify position, font size, and color."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => loadFile(f[0])} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-yellow-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setAnnotations([]); }} className="text-yellow-400 hover:text-yellow-600 ml-3">✕</button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Add Text</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to add…"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Page</label>
                <input type="number" min={1} max={pageCount} value={page}
                  onChange={(e) => setPage(Math.min(pageCount, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">X (pt from left)</label>
                <input type="number" min={0} value={x} onChange={(e) => setX(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y (pt from bottom)</label>
                <input type="number" min={0} value={y} onChange={(e) => setY(parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Size (pt)</label>
                <input type="number" min={6} max={72} value={fontSize}
                  onChange={(e) => setFontSize(Math.max(6, parseInt(e.target.value) || 14))}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Color</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
              </div>
              <button onClick={addAnnotation} className="btn-primary ml-auto text-sm px-5 py-2">
                + Add
              </button>
            </div>
          </div>

          {annotations.length > 0 && (
            <ul className="mb-5 space-y-1">
              {annotations.map((ann, i) => (
                <li key={i} className="flex items-start gap-2 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: ann.color }} />
                  <span className="flex-1 text-gray-700 truncate">
                    <strong>P{ann.page + 1}</strong> ({ann.x},{ann.y}) {ann.fontSize}pt — {ann.text}
                  </span>
                  <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600">✕</button>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ Edited PDF downloaded!</p>}

          <button onClick={save} disabled={processing || annotations.length === 0} className="btn-primary w-full">
            {processing ? "Saving…" : `Save with ${annotations.length} Annotation${annotations.length !== 1 ? "s" : ""}`}
          </button>

          <p className="text-xs text-gray-400 text-center mt-2">
            PDF uses points (pt). A typical A4 page is 595 × 842 pt. Y=0 is the bottom of the page.
          </p>
        </>
      )}
    </ToolLayout>
  );
}
