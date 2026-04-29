"use client";
import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

interface PdfFile {
  file: File;
  name: string;
  locked: boolean;
  password: string;
  passwordWrong: boolean;
}

function isEncryptionError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.toLowerCase().includes("encrypt");
}

async function renderLockedPdfToImages(
  file: File,
  password: string
): Promise<{ dataUrl: string; width: number; height: number }[]> {
  const { loadPdfjs } = await import("@/lib/pdfjs-worker");
  const pdfjsLib = await loadPdfjs();

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf, password }).promise;
  const results: { dataUrl: string; width: number; height: number }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    results.push({ dataUrl: canvas.toDataURL("image/png"), width: vp.width, height: vp.height });
  }
  return results;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export default function MergeClient() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [error, setError] = useState("");

  const addFiles = useCallback(async (newFiles: File[]) => {
    const checked: PdfFile[] = [];
    for (const f of newFiles) {
      let locked = false;
      try {
        const buf = await f.arrayBuffer();
        await PDFDocument.load(buf);
      } catch (e) {
        if (isEncryptionError(e)) locked = true;
      }
      checked.push({ file: f, name: f.name, locked, password: "", passwordWrong: false });
    }
    setFiles((prev) => [...prev, ...checked]);
    setError("");
  }, []);

  const remove = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };
  const moveDown = (i: number) => {
    setFiles((prev) => {
      if (i >= prev.length - 1) return prev;
      const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a;
    });
  };
  const setPassword = (i: number, pw: string) =>
    setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, password: pw, passwordWrong: false } : f));

  const merge = async () => {
    if (files.length < 2) { setError("Please add at least 2 PDFs."); return; }

    // Validate passwords provided for locked files
    const missingPw = files.find((f) => f.locked && !f.password.trim());
    if (missingPw) { setError(`Enter the password for "${missingPw.name}".`); return; }

    setProcessing(true); setError("");
    const merged = await PDFDocument.create();

    try {
      for (let idx = 0; idx < files.length; idx++) {
        const entry = files[idx];
        setProcessingLabel(`Processing ${idx + 1}/${files.length}: ${entry.name}`);

        if (entry.locked) {
          // Render encrypted PDF via pdfjs-dist (handles decryption) → embed as images
          let images: { dataUrl: string; width: number; height: number }[];
          try {
            images = await renderLockedPdfToImages(entry.file, entry.password);
          } catch {
            setFiles((prev) =>
              prev.map((f, i) => i === idx ? { ...f, passwordWrong: true } : f)
            );
            setError(`Wrong password for "${entry.name}". Please correct it and try again.`);
            setProcessing(false); setProcessingLabel("");
            return;
          }
          for (const { dataUrl, width, height } of images) {
            const pngBytes = dataUrlToBytes(dataUrl);
            const img = await merged.embedPng(pngBytes);
            const page = merged.addPage([width / 2, height / 2]);
            page.drawImage(img, { x: 0, y: 0, width: width / 2, height: height / 2 });
          }
        } else {
          // Normal unlocked PDF — copy pages natively (preserves vectors & text)
          const buf = await entry.file.arrayBuffer();
          const doc = await PDFDocument.load(buf);
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        }
      }

      const bytes = await merged.save();
      download(bytes, "merged.pdf");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to merge PDFs.");
    } finally {
      setProcessing(false); setProcessingLabel("");
    }
  };

  const allPasswordsFilled = files.every((f) => !f.locked || f.password.trim());

  return (
    <ToolLayout
      icon="🔗"
      title="Merge PDF Files"
      description="Combine multiple PDFs into one. Locked PDFs are supported — just enter their password."
    >
      <FileDropZone onFiles={addFiles} multiple label="Drop PDFs here or click to add" />

      {files.length > 0 && (
        <ul className="mt-5 space-y-2">
          {files.map((entry, i) => (
            <li key={i} className={`border rounded-lg px-4 py-2 ${entry.locked ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-5 shrink-0">{i + 1}.</span>
                <span className="flex-1 text-sm text-gray-700 truncate">{entry.name}</span>
                {entry.locked && (
                  <span className="text-xs text-amber-600 font-medium shrink-0">🔒 Locked</span>
                )}
                <button onClick={() => moveUp(i)} disabled={i === 0}
                  className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 px-1" title="Move up">↑</button>
                <button onClick={() => moveDown(i)} disabled={i === files.length - 1}
                  className="text-gray-400 hover:text-indigo-600 disabled:opacity-30 px-1" title="Move down">↓</button>
                <button onClick={() => remove(i)}
                  className="text-red-400 hover:text-red-600 text-sm px-1" title="Remove">✕</button>
              </div>

              {entry.locked && (
                <div className="mt-2 pl-8">
                  <input
                    type="password"
                    value={entry.password}
                    onChange={(e) => setPassword(i, e.target.value)}
                    placeholder="Enter PDF password…"
                    className={`w-full text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      entry.passwordWrong ? "border-red-400 bg-red-50" : "border-amber-300 bg-white"
                    }`}
                  />
                  {entry.passwordWrong && (
                    <p className="text-red-500 text-xs mt-1">Incorrect password</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {processing && processingLabel && (
        <p className="mt-3 text-sm text-indigo-600 animate-pulse">{processingLabel}</p>
      )}

      <button
        onClick={merge}
        disabled={processing || files.length < 2 || !allPasswordsFilled}
        className="btn-primary mt-6 w-full text-center"
      >
        {processing ? "Merging…" : `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`}
      </button>

      {files.some((f) => f.locked) && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          🔒 Locked PDFs are rendered page-by-page and embedded as high-res images in the merged output.
        </p>
      )}
    </ToolLayout>
  );
}

function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
