"use client";
import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";

interface ImageFile {
  file: File;
  dataUrl: string;
}

export default function JpgToPdfClient() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback((files: FileList | File[]) => {
    const allowed = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    allowed.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, { file: f, dataUrl: e.target!.result as string }]);
      };
      reader.readAsDataURL(f);
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const remove = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    setImages((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };
  const moveDown = (i: number) => {
    setImages((prev) => {
      if (i >= prev.length - 1) return prev;
      const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a;
    });
  };

  const convert = async () => {
    if (images.length === 0) { setError("Add at least one image."); return; }
    setProcessing(true); setError("");
    try {
      const doc = await PDFDocument.create();
      for (const { file, dataUrl } of images) {
        const bytes = dataUrlToBytes(dataUrl);
        let img;
        if (file.type === "image/png") {
          img = await doc.embedPng(bytes);
        } else {
          img = await doc.embedJpg(bytes);
        }
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "images.pdf"; a.click();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="🖼️"
      title="JPG to PDF"
      description="Combine JPG, PNG, or WebP images into a single PDF. Drag to reorder pages."
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-5 cursor-pointer ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50 hover:border-indigo-400"}`}
        onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.multiple = true; i.onchange = (e) => addFiles((e.target as HTMLInputElement).files!); i.click(); }}
      >
        <p className="text-gray-500 text-sm">Drop images here or click to browse</p>
        <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP supported</p>
      </div>

      {images.length > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.dataUrl} alt={img.file.name} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="bg-white/90 rounded p-0.5 text-xs disabled:opacity-30" title="Move up">↑</button>
                  <button onClick={() => moveDown(i)} disabled={i === images.length - 1} className="bg-white/90 rounded p-0.5 text-xs disabled:opacity-30" title="Move down">↓</button>
                  <button onClick={() => remove(i)} className="bg-red-500 text-white rounded p-0.5 text-xs" title="Remove">✕</button>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-1 py-0.5 truncate">
                  {i + 1}. {img.file.name}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button onClick={convert} disabled={processing} className="btn-primary w-full">
            {processing ? "Creating PDF…" : `Convert ${images.length} image${images.length !== 1 ? "s" : ""} to PDF`}
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
