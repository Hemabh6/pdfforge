"use client";
import { useState } from "react";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

interface PageImage {
  dataUrl: string;
  pageNum: number;
}

export default function PdfToJpgClient() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<PageImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [scale, setScale] = useState(2);

  const convert = async (f: File) => {
    setFile(f); setImages([]); setError(""); setProgress(0);
    setProcessing(true);
    try {
      const pdfjsLib = await loadPdfjs();
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const results: PageImage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        results.push({ dataUrl: canvas.toDataURL("image/jpeg", 0.92), pageNum: i });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setImages(results);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to convert PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadAll = () => {
    const baseName = (file?.name ?? "page").replace(/\.pdf$/i, "");
    images.forEach(({ dataUrl, pageNum }) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${baseName}_page${pageNum}.jpg`;
      a.click();
    });
  };

  const downloadOne = (img: PageImage) => {
    const baseName = (file?.name ?? "page").replace(/\.pdf$/i, "");
    const a = document.createElement("a");
    a.href = img.dataUrl;
    a.download = `${baseName}_page${img.pageNum}.jpg`;
    a.click();
  };

  return (
    <ToolLayout
      icon="🖼️"
      title="PDF to JPG"
      description="Convert every page of your PDF to high-resolution JPG images."
    >
      {!file ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality / Scale
            </label>
            <div className="flex gap-3">
              {[{ label: "Standard (1×)", val: 1 }, { label: "High (2×)", val: 2 }, { label: "Ultra (3×)", val: 3 }].map(({ label, val }) => (
                <label key={val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name="scale" checked={scale === val} onChange={() => setScale(val)} className="accent-indigo-600" />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <FileDropZone onFiles={(f) => convert(f[0])} />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-orange-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setImages([]); }} className="text-orange-400 hover:text-orange-600 ml-3">✕</button>
          </div>

          {processing && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Converting pages…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {images.length > 0 && (
            <>
              <button onClick={downloadAll} className="btn-primary mb-5 w-full">
                ⬇️ Download All {images.length} JPGs
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div key={img.pageNum} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer" onClick={() => downloadOne(img)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt={`Page ${img.pageNum}`} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">⬇️ Download</span>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                      Page {img.pageNum}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </ToolLayout>
  );
}
