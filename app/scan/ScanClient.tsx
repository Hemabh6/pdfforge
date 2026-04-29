"use client";
import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";

interface CapturedPage {
  dataUrl: string;
}

export default function ScanClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [cameraError, setCameraError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);

  const startCamera = async () => {
    setCameraError("");
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(ms);
      setCameraStarted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
      }
    } catch (e: unknown) {
      setCameraError(e instanceof Error ? e.message : "Could not access camera. Check browser permissions.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraStarted(false);
  };

  useEffect(() => () => { stream?.getTracks().forEach((t) => t.stop()); }, [stream]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPages((prev) => [...prev, { dataUrl }]);
  };

  const removeCapture = (i: number) => setPages((prev) => prev.filter((_, idx) => idx !== i));

  const createPdf = async () => {
    if (pages.length === 0) return;
    setProcessing(true);
    try {
      const doc = await PDFDocument.create();
      for (const { dataUrl } of pages) {
        const bytes = dataUrlToBytes(dataUrl);
        const img = await doc.embedJpg(bytes);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `scan_${Date.now()}.pdf`;
      a.click();
      setDone(true);
      stopCamera();
    } catch (e: unknown) {
      setCameraError(e instanceof Error ? e.message : "Failed to create PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="📷"
      title="Scan to PDF"
      description="Use your device camera to scan documents and convert them to a PDF — no app needed."
    >
      {done ? (
        <div className="text-center py-10">
          <p className="text-green-600 text-lg font-medium mb-4">✅ Scanned PDF downloaded!</p>
          <button onClick={() => { setPages([]); setDone(false); }} className="btn-primary">
            Scan another document
          </button>
        </div>
      ) : (
        <>
          {!cameraStarted ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-gray-600 text-sm mb-5">Click the button below to start your camera and scan pages one by one.</p>
              {cameraError && <p className="text-red-500 text-sm mb-4">{cameraError}</p>}
              <button onClick={startCamera} className="btn-primary">
                Start Camera
              </button>

              {pages.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm text-gray-600 mb-3">{pages.length} page{pages.length !== 1 ? "s" : ""} captured</p>
                  <button onClick={createPdf} disabled={processing} className="btn-primary">
                    {processing ? "Creating PDF…" : `Create PDF from ${pages.length} page${pages.length !== 1 ? "s" : ""}`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden mb-4 bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video ref={videoRef} autoPlay playsInline className="w-full max-h-72 object-contain" />
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3 mb-5">
                <button onClick={capture} className="btn-primary flex-1">
                  📸 Capture Page {pages.length + 1}
                </button>
                <button onClick={stopCamera} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Stop Camera
                </button>
              </div>

              {pages.length > 0 && (
                <>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {pages.map((p, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.dataUrl} alt={`Scan ${i + 1}`} className="w-full aspect-square object-cover" />
                        <button onClick={() => removeCapture(i)}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded text-xs w-4 h-4 flex items-center justify-center">
                          ✕
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={createPdf} disabled={processing} className="btn-primary w-full">
                    {processing ? "Creating PDF…" : `Create PDF (${pages.length} page${pages.length !== 1 ? "s" : ""})`}
                  </button>
                </>
              )}
            </>
          )}
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
