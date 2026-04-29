"use client";
import { useState } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

const PRESETS = ["CONFIDENTIAL", "DRAFT", "DO NOT COPY", "SAMPLE", "FOR REVIEW"];

export default function WatermarkClient() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.15);
  const [color, setColor] = useState("#cc0000");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const watermark = async () => {
    if (!file || !text.trim()) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(color);

      for (let i = 0; i < doc.getPageCount(); i++) {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const cx = width / 2 - textWidth / 2;
        const cy = height / 2 - fontSize / 2;

        page.drawText(text, {
          x: cx,
          y: cy,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(45),
        });
      }
      const bytes = await doc.save();
      download(bytes, file.name.replace(/\.pdf$/i, "_watermarked.pdf"));
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Watermark failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout icon="💧" title="Watermark PDF" description="Stamp diagonal text across every page of your PDF.">
      {!file ? (
        <FileDropZone onFiles={(f) => { setFile(f[0]); setError(""); setDone(false); }} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-sky-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-sky-400 hover:text-sky-600 ml-3">✕</button>
          </div>

          {/* Presets */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Watermark text</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map((p) => (
                <button key={p} onClick={() => setText(p)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${text === p ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300 text-gray-600 hover:border-indigo-400"}`}>
                  {p}
                </button>
              ))}
            </div>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Custom text…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font size: {fontSize}px</label>
              <input type="range" min={20} max={120} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-indigo-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opacity: {Math.round(opacity * 100)}%</label>
              <input type="range" min={5} max={60} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(+e.target.value / 100)} className="w-full accent-indigo-600" />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
              <span className="text-sm text-gray-500">{color.toUpperCase()}</span>
            </div>
          </div>

          {/* Preview text */}
          <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl h-24 flex items-center justify-center overflow-hidden">
            <span style={{ color, fontSize: `${Math.min(fontSize, 36)}px`, opacity, transform: "rotate(-30deg)", fontWeight: "bold", letterSpacing: "0.05em" }}>
              {text || "Preview"}
            </span>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ Watermarked PDF downloaded!</p>}

          <button onClick={watermark} disabled={processing || !text.trim()} className="btn-primary w-full">
            {processing ? "Applying…" : "Add Watermark & Download"}
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
