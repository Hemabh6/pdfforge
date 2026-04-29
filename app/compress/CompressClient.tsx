"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function CompressClient() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState(0);
  const [compressed, setCompressed] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onFile = (files: File[]) => {
    const f = files[0];
    setFile(f); setOriginal(f.size); setCompressed(0); setError(""); setDone(false);
  };

  const compress = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { updateMetadata: false });

      // Strip all metadata
      doc.setTitle("");
      doc.setAuthor("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setProducer("");
      doc.setCreator("");

      // Save with maximum object stream compression
      const bytes = await doc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      setCompressed(bytes.byteLength);
      download(bytes, file.name.replace(/\.pdf$/i, "_compressed.pdf"));
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally {
      setProcessing(false);
    }
  };

  const saving = original > 0 && compressed > 0 ? ((1 - compressed / original) * 100).toFixed(1) : null;

  return (
    <ToolLayout
      icon="🗜️"
      title="Compress PDF"
      description="Strip metadata and apply object compression to reduce your PDF's file size."
    >
      {!file ? (
        <FileDropZone onFiles={onFile} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-lime-50 border border-lime-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-lime-800 font-medium truncate">{file.name}</span>
            <span className="text-xs text-lime-600 ml-2 shrink-0">{fmtBytes(original)}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-lime-400 hover:text-lime-600 ml-3">✕</button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-sm text-gray-600 space-y-1">
            <p>✅ Strips metadata (title, author, creator, producer)</p>
            <p>✅ Applies PDF object stream compression</p>
            <p>✅ Removes redundant cross-reference tables</p>
            <p className="text-gray-400 text-xs mt-1">Note: image quality is preserved. For lossy image compression, use Acrobat or Ghostscript.</p>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {done && saving !== null && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-sm">
              <p className="text-green-800 font-semibold">✅ Compressed successfully!</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-400">Original</p>
                  <p className="font-semibold text-gray-700">{fmtBytes(original)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Saved</p>
                  <p className="font-semibold text-green-600">{saving}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Compressed</p>
                  <p className="font-semibold text-gray-700">{fmtBytes(compressed)}</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={compress} disabled={processing} className="btn-primary w-full">
            {processing ? "Compressing…" : "Compress & Download"}
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
