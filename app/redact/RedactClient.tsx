"use client";
import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

interface Rect { x: number; y: number; w: number; h: number; }
interface PageRects { [page: number]: Rect[]; }

export default function RedactClient() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [pageSizes, setPageSizes] = useState<{ width: number; height: number }[]>([]);
  const [scales, setScales] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rects, setRects] = useState<PageRects>({});
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [previewRect, setPreviewRect] = useState<Rect | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const loadFile = async (f: File) => {
    setFile(f); setThumbs([]); setRects({}); setCurrentPage(0); setError(""); setDone(false);
    setLoading(true);
    try {
      const pdfjsLib = await loadPdfjs();
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const thumbList: string[] = [];
      const sizeList: { width: number; height: number }[] = [];
      const scaleList: number[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        thumbList.push(canvas.toDataURL("image/jpeg", 0.85));
        const origVp = page.getViewport({ scale: 1 });
        sizeList.push({ width: origVp.width, height: origVp.height });
        scaleList.push(1.5);
      }
      setThumbs(thumbList);
      setPageSizes(sizeList);
      setScales(scaleList);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load PDF.");
    } finally {
      setLoading(false);
    }
  };

  const getCanvasPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    setStart(pos); setDrawing(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !start) return;
    const pos = getCanvasPos(e);
    setPreviewRect({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y),
    });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!drawing || !start) return;
    setDrawing(false);
    const pos = getCanvasPos(e);
    const rect: Rect = {
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      w: Math.abs(pos.x - start.x),
      h: Math.abs(pos.y - start.y),
    };
    if (rect.w < 5 || rect.h < 5) { setPreviewRect(null); return; }
    setRects((prev) => ({ ...prev, [currentPage]: [...(prev[currentPage] ?? []), rect] }));
    setPreviewRect(null);
  };

  // Draw overlaid rects on canvas whenever thumb or rects change
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !thumbs[currentPage]) return;
    const ctx = canvas.getContext("2d")!;
    const draw = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = "black";
      (rects[currentPage] ?? []).forEach((r) => {
        ctx.fillRect(r.x, r.y, r.w, r.h);
      });
      if (previewRect) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(previewRect.x, previewRect.y, previewRect.w, previewRect.h);
      }
    };
    if (img.complete) draw();
    else img.onload = draw;
  }, [thumbs, currentPage, rects, previewRect]);

  const totalRects = Object.values(rects).reduce((s, a) => s + a.length, 0);

  const applyRedaction = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const pages = doc.getPages();

      for (const [pageStr, pageRects] of Object.entries(rects)) {
        const pageIdx = parseInt(pageStr);
        const page = pages[pageIdx];
        if (!page) continue;
        const { height } = page.getSize();
        const scale = scales[pageIdx];

        for (const r of pageRects) {
          const pdfX = r.x / scale;
          const pdfY = height - (r.y + r.h) / scale;
          const pdfW = r.w / scale;
          const pdfH = r.h / scale;
          page.drawRectangle({ x: pdfX, y: pdfY, width: pdfW, height: pdfH, color: rgb(0, 0, 0) });
        }
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "_redacted.pdf");
      a.click();
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to apply redaction.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="⬛"
      title="Redact PDF"
      description="Draw black boxes over sensitive information to permanently hide it."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => loadFile(f[0])} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 mb-4">
            <span className="text-sm text-gray-200 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setThumbs([]); }} className="text-gray-400 hover:text-white ml-3">✕</button>
          </div>

          {loading && <p className="text-indigo-600 text-sm animate-pulse mb-3">Rendering pages…</p>}

          {thumbs.length > 0 && (
            <>
              {/* Page tabs */}
              {thumbs.length > 1 && (
                <div className="flex gap-1 overflow-x-auto mb-3 pb-1">
                  {thumbs.map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i)}
                      className={`shrink-0 px-3 py-1 text-xs rounded-lg border transition-colors ${currentPage === i ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                      Page {i + 1}
                      {rects[i]?.length ? ` (${rects[i].length})` : ""}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mb-2">Draw rectangles over areas to redact. Click and drag.</p>

              <div className="relative border border-gray-200 rounded-xl overflow-hidden mb-4" style={{ cursor: "crosshair" }}>
                {/* Hidden img used as source for canvas drawing */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imgRef} src={thumbs[currentPage]} alt="" className="hidden" />
                <canvas
                  ref={canvasRef}
                  className="w-full"
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={() => { if (drawing) setDrawing(false); setPreviewRect(null); }}
                />
              </div>

              {rects[currentPage]?.length > 0 && (
                <button
                  onClick={() => setRects((prev) => { const n = { ...prev }; delete n[currentPage]; return n; })}
                  className="text-xs text-red-500 hover:text-red-700 mb-3 block"
                >
                  Clear redactions on page {currentPage + 1}
                </button>
              )}

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              {done && <p className="text-green-600 text-sm mb-3">✅ Redacted PDF downloaded!</p>}

              <button
                onClick={applyRedaction}
                disabled={processing || totalRects === 0}
                className="btn-primary w-full"
              >
                {processing ? "Applying…" : `Apply ${totalRects} Redaction${totalRects !== 1 ? "s" : ""} & Download`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-2">
                Redactions are permanent black rectangles drawn on the PDF page content.
              </p>
            </>
          )}
        </>
      )}
    </ToolLayout>
  );
}
