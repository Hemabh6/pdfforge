"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

type Mode = "all" | "range" | "pages";

function parsePageInput(input: string, total: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [a, b] = trimmed.split("-").map(Number);
      for (let i = a; i <= b; i++) if (i >= 1 && i <= total) pages.add(i - 1);
    } else {
      const n = Number(trimmed);
      if (n >= 1 && n <= total) pages.add(n - 1);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export default function SplitClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Mode>("all");
  const [pageInput, setPageInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onFile = async (files: File[]) => {
    const f = files[0];
    setFile(f); setError(""); setDone(false);
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      setPageCount(doc.getPageCount());
    } catch {
      setError("Could not read PDF. Is it password-protected?");
    }
  };

  const split = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const src = await PDFDocument.load(buf);

      let indices: number[][];
      if (mode === "all") {
        indices = Array.from({ length: pageCount }, (_, i) => [i]);
      } else {
        const selected = parsePageInput(pageInput, pageCount);
        if (!selected.length) throw new Error("No valid pages in selection.");
        indices = mode === "pages" ? selected.map((i) => [i]) : [selected];
      }

      for (let i = 0; i < indices.length; i++) {
        const doc = await PDFDocument.create();
        const pages = await doc.copyPages(src, indices[i]);
        pages.forEach((p) => doc.addPage(p));
        const bytes = await doc.save();
        download(bytes, indices.length === 1 ? "split.pdf" : `page_${indices[i].map((n) => n + 1).join("-")}.pdf`);
        await pause(80);
      }
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Split failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout icon="✂️" title="Split PDF" description="Extract individual pages or a page range from any PDF.">
      {!file ? (
        <FileDropZone onFiles={onFile} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-indigo-800 font-medium truncate">{file.name}</span>
            <span className="text-xs text-indigo-500 ml-2 shrink-0">{pageCount} pages</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-indigo-400 hover:text-indigo-600 ml-3 text-sm">✕</button>
          </div>

          <fieldset className="mb-5">
            <legend className="text-sm font-semibold text-gray-700 mb-3">Split mode</legend>
            <div className="space-y-2">
              {[
                { v: "all" as Mode, label: "Extract all pages as individual PDFs" },
                { v: "pages" as Mode, label: "Extract specific pages as individual PDFs" },
                { v: "range" as Mode, label: "Extract a page range as one PDF" },
              ].map(({ v, label }) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="radio" name="mode" value={v} checked={mode === v} onChange={() => setMode(v)} className="accent-indigo-600" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {(mode === "pages" || mode === "range") && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pages <span className="text-gray-400">(e.g. 1, 3, 5-8)</span>
              </label>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={`1-${pageCount}`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ Done! Check your downloads.</p>}

          <button onClick={split} disabled={processing} className="btn-primary w-full">
            {processing ? "Splitting…" : "Split PDF"}
          </button>
        </>
      )}
    </ToolLayout>
  );
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
}
