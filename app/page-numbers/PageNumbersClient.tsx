"use client";
import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

type Position = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";

export default function PageNumbersClient() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [startNum, setStartNum] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  const addNumbers = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const label = `${prefix}${startNum + i}${suffix}`;
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const margin = 24;

        let x: number, y: number;
        switch (position) {
          case "bottom-center": x = (width - textWidth) / 2; y = margin; break;
          case "bottom-right":  x = width - textWidth - margin; y = margin; break;
          case "bottom-left":   x = margin; y = margin; break;
          case "top-center":    x = (width - textWidth) / 2; y = height - margin - fontSize; break;
          case "top-right":     x = width - textWidth - margin; y = height - margin - fontSize; break;
          case "top-left":      x = margin; y = height - margin - fontSize; break;
        }

        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "_numbered.pdf");
      a.click();
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add page numbers.");
    } finally {
      setProcessing(false);
    }
  };

  const positions: { label: string; val: Position }[] = [
    { label: "Bottom Center", val: "bottom-center" },
    { label: "Bottom Right", val: "bottom-right" },
    { label: "Bottom Left", val: "bottom-left" },
    { label: "Top Center", val: "top-center" },
    { label: "Top Right", val: "top-right" },
    { label: "Top Left", val: "top-left" },
  ];

  return (
    <ToolLayout
      icon="🔢"
      title="Add Page Numbers"
      description="Automatically add page numbers to your PDF in any position and style."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => { setFile(f[0]); setError(""); setDone(false); }} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-indigo-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-indigo-400 hover:text-indigo-600 ml-3">✕</button>
          </div>

          <div className="space-y-4 mb-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start number</label>
                <input
                  type="number"
                  min={1}
                  value={startNum}
                  onChange={(e) => setStartNum(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font size (pt)</label>
                <input
                  type="number"
                  min={8}
                  max={36}
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(8, Math.min(36, parseInt(e.target.value) || 12)))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder='e.g. "Page "'
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder='e.g. " of 10"'
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {positions.map(({ label, val }) => (
                  <label key={val} className={`flex items-center justify-center text-xs text-center rounded-lg border px-2 py-2 cursor-pointer transition-colors ${position === val ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                    <input type="radio" name="position" value={val} checked={position === val} onChange={() => setPosition(val)} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500">
              Preview: <span className="font-mono text-gray-800">{prefix}{startNum}{suffix}</span>, <span className="font-mono text-gray-800">{prefix}{startNum + 1}{suffix}</span>, …
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ PDF with page numbers downloaded!</p>}

          <button onClick={addNumbers} disabled={processing} className="btn-primary w-full">
            {processing ? "Adding numbers…" : "Add Page Numbers & Download"}
          </button>
        </>
      )}
    </ToolLayout>
  );
}
