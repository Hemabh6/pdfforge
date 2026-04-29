"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

export default function UnlockClient() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const unlock = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      // Use pdfjs-dist to render every page then rebuild with pdf-lib (true client-side decrypt)
      const pdfjsLib = await loadPdfjs();
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf, password }).promise;

      const newDoc = await PDFDocument.create();
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        const pngDataUrl = canvas.toDataURL("image/png");
        const pngBytes = dataUrlToBytes(pngDataUrl);
        const img = await newDoc.embedPng(pngBytes);
        const pdfPage = newDoc.addPage([vp.width / 2, vp.height / 2]);
        pdfPage.drawImage(img, { x: 0, y: 0, width: vp.width / 2, height: vp.height / 2 });
      }
      const bytes = await newDoc.save();
      download(bytes, file.name.replace(/\.pdf$/i, "_unlocked.pdf"));
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setError(msg.toLowerCase().includes("password")
        ? "Incorrect password. Please try again."
        : "Could not unlock PDF. Make sure the password is correct.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="🔓"
      title="Unlock PDF"
      description="Enter the PDF password to get an unlocked, freely accessible copy."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => { setFile(f[0]); setError(""); setDone(false); }} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-amber-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-amber-400 hover:text-amber-600 ml-3 text-sm">✕</button>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">PDF Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unlock()}
                placeholder="Enter the password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ Unlocked PDF downloaded!</p>}

          <button onClick={unlock} disabled={processing || !password} className="btn-primary w-full">
            {processing ? "Unlocking…" : "Unlock & Download"}
          </button>
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

function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
}
