"use client";
import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

type Mode = "draw" | "type";

export default function SignClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]); // thumbnail data URLs
  const [selectedPage, setSelectedPage] = useState(0);
  const [mode, setMode] = useState<Mode>("draw");
  const [typedName, setTypedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const loadFile = async (f: File) => {
    setFile(f); setPages([]); setError(""); setDone(false); setSelectedPage(0);
    setLoading(true);
    try {
      const pdfjsLib = await loadPdfjs();
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const thumbs: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        thumbs.push(canvas.toDataURL("image/jpeg", 0.7));
      }
      setPages(thumbs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load PDF.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [mode]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current!);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const stopDraw = () => { drawing.current = false; lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureDataUrl = (): string | null => {
    if (mode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL("image/png");
    } else {
      if (!typedName.trim()) return null;
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, 400, 100);
      ctx.font = "italic 52px Georgia, serif";
      ctx.fillStyle = "#1e293b";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, 20, 52);
      return canvas.toDataURL("image/png");
    }
  };

  const sign = async () => {
    if (!file) return;
    const sigDataUrl = getSignatureDataUrl();
    if (!sigDataUrl) { setError("Please draw or type your signature first."); return; }

    setProcessing(true); setError(""); setDone(false);
    try {
      const sigBytes = dataUrlToBytes(sigDataUrl);
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const pages = doc.getPages();
      const page = pages[selectedPage];
      const { width, height } = page.getSize();
      const img = await doc.embedPng(sigBytes);
      const sigW = Math.min(200, width * 0.4);
      const sigH = (img.height / img.width) * sigW;
      page.drawImage(img, { x: width - sigW - 24, y: 24, width: sigW, height: sigH });

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "_signed.pdf");
      a.click();
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to sign PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="✍️"
      title="Sign PDF"
      description="Draw or type your signature and embed it into your PDF."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => loadFile(f[0])} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-teal-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setPages([]); }} className="text-teal-400 hover:text-teal-600 ml-3">✕</button>
          </div>

          {loading && <p className="text-indigo-600 text-sm animate-pulse mb-3">Loading pages…</p>}

          {pages.length > 1 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sign page</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {pages.map((thumb, i) => (
                  <button key={i} onClick={() => setSelectedPage(i)}
                    className={`shrink-0 border-2 rounded-lg overflow-hidden w-16 transition-all ${selectedPage === i ? "border-indigo-500" : "border-gray-200"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt={`Page ${i + 1}`} className="w-full" />
                    <p className="text-xs text-center py-0.5 text-gray-500">{i + 1}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex gap-3 mb-3">
              {(["draw", "type"] as Mode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${mode === m ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                  {m === "draw" ? "✏️ Draw" : "⌨️ Type"}
                </button>
              ))}
            </div>

            {mode === "draw" ? (
              <div>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 touch-none cursor-crosshair"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                <button onClick={clearCanvas} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Clear</button>
              </div>
            ) : (
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
              />
            )}
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ Signed PDF downloaded!</p>}

          <button onClick={sign} disabled={processing || loading} className="btn-primary w-full">
            {processing ? "Signing…" : `Apply Signature to Page ${selectedPage + 1}`}
          </button>

          <p className="text-xs text-gray-400 text-center mt-2">
            Signature is placed in the bottom-right corner of the selected page.
          </p>
        </>
      )}
    </ToolLayout>
  );
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
