"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

export default function CropClient() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [top, setTop] = useState(0);
  const [right, setRight] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [unit, setUnit] = useState<"pt" | "mm" | "in">("mm");

  const toPoints = (val: number) => {
    if (unit === "pt") return val;
    if (unit === "mm") return val * 2.8346;
    return val * 72;
  };

  const crop = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const pages = doc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const topPt = toPoints(top);
        const rightPt = toPoints(right);
        const bottomPt = toPoints(bottom);
        const leftPt = toPoints(left);
        page.setCropBox(leftPt, bottomPt, width - leftPt - rightPt, height - bottomPt - topPt);
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "_cropped.pdf");
      a.click();
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to crop PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const margins = [
    { label: "Top", val: top, set: setTop },
    { label: "Right", val: right, set: setRight },
    { label: "Bottom", val: bottom, set: setBottom },
    { label: "Left", val: left, set: setLeft },
  ];

  return (
    <ToolLayout
      icon="✂️"
      title="Crop PDF"
      description="Remove unwanted margins or whitespace from every page of your PDF."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => { setFile(f[0]); setError(""); setDone(false); }} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-cyan-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-cyan-400 hover:text-cyan-600 ml-3">✕</button>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Margins to remove</label>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(["mm", "in", "pt"] as const).map((u) => (
                  <button key={u} onClick={() => setUnit(u)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${unit === u ? "bg-white shadow text-gray-900 font-medium" : "text-gray-500"}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {margins.map(({ label, val, set }) => (
                <div key={label}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={val}
                    onChange={(e) => set(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ Cropped PDF downloaded!</p>}

          <button onClick={crop} disabled={processing} className="btn-primary w-full">
            {processing ? "Cropping…" : "Crop & Download"}
          </button>

          <p className="text-xs text-gray-400 mt-2 text-center">
            Applied to all pages. Sets the PDF CropBox — the underlying page size is unchanged.
          </p>
        </>
      )}
    </ToolLayout>
  );
}
