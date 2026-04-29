"use client";
import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

type Angle = 90 | 180 | 270 | -90;

function parsePageInput(input: string, total: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const t = part.trim();
    if (t.includes("-")) {
      const [a, b] = t.split("-").map(Number);
      for (let i = a; i <= b; i++) if (i >= 1 && i <= total) pages.add(i - 1);
    } else {
      const n = Number(t);
      if (n >= 1 && n <= total) pages.add(n - 1);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export default function RotateClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [angle, setAngle] = useState<Angle>(90);
  const [applyTo, setApplyTo] = useState<"all" | "specific">("all");
  const [pageInput, setPageInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onFile = async (files: File[]) => {
    const f = files[0]; setFile(f); setError(""); setDone(false);
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      setPageCount(doc.getPageCount());
    } catch { setError("Could not read PDF."); }
  };

  const rotate = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const indices = applyTo === "all"
        ? Array.from({ length: pageCount }, (_, i) => i)
        : parsePageInput(pageInput, pageCount);
      if (!indices.length) throw new Error("No valid pages selected.");
      for (const i of indices) {
        const page = doc.getPage(i);
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + angle + 360) % 360));
      }
      const bytes = await doc.save();
      download(bytes, file.name.replace(/\.pdf$/i, "_rotated.pdf"));
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Rotation failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout icon="🔄" title="Rotate PDF Pages" description="Rotate all or specific pages by 90°, 180°, or 270°.">
      {!file ? (
        <FileDropZone onFiles={onFile} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-teal-800 font-medium truncate">{file.name}</span>
            <span className="text-xs text-teal-500 ml-2 shrink-0">{pageCount} pages</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-teal-400 hover:text-teal-600 ml-3">✕</button>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rotation angle</label>
            <div className="flex gap-2 flex-wrap">
              {([90, 180, 270, -90] as Angle[]).map((a) => (
                <button key={a}
                  onClick={() => setAngle(a)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${angle === a ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-700 hover:border-indigo-400"}`}>
                  {a === -90 ? "−90°" : `${a}°`}{a === 90 ? " ↻" : a === -90 ? " ↺" : a === 180 ? " ↕" : " ↔"}
                </button>
              ))}
            </div>
          </div>

          <fieldset className="mb-5">
            <legend className="text-sm font-semibold text-gray-700 mb-2">Apply to</legend>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="apply" checked={applyTo === "all"} onChange={() => setApplyTo("all")} className="accent-indigo-600" />
                All pages
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="radio" name="apply" checked={applyTo === "specific"} onChange={() => setApplyTo("specific")} className="accent-indigo-600" />
                Specific pages
              </label>
            </div>
          </fieldset>

          {applyTo === "specific" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pages <span className="text-gray-400">(e.g. 1, 3, 5-8)</span></label>
              <input type="text" value={pageInput} onChange={(e) => setPageInput(e.target.value)}
                placeholder={`1-${pageCount}`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ Rotated PDF downloaded!</p>}

          <button onClick={rotate} disabled={processing} className="btn-primary w-full">
            {processing ? "Rotating…" : "Rotate & Download"}
          </button>
        </>
      )}
    </ToolLayout>
  );
}

function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
}
