"use client";
import { useState } from "react";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

type Format = "txt" | "rtf";

function buildRtf(text: string): string {
  const escaped = text
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\r?\n/g, "\\par\n");
  return `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Times New Roman;}}\n\\f0\\fs24 ${escaped}\n}`;
}

export default function PdfToDocClient() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [format, setFormat] = useState<Format>("txt");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const extract = async (f: File) => {
    setFile(f); setText(""); setError(""); setProgress(0);
    setProcessing(true);
    try {
      const pdfjsLib = await loadPdfjs();
      const buf = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const parts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .filter((item) => "str" in item)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => (item.str as string) + (item.hasEOL ? "\n" : ""))
          .join(" ");
        parts.push(pageText.trim());
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setText(parts.join("\n\n"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to extract text.");
    } finally {
      setProcessing(false);
    }
  };

  const exportDoc = () => {
    const baseName = (file?.name ?? "output").replace(/\.pdf$/i, "");
    if (format === "txt") {
      const blob = new Blob([text], { type: "text/plain" });
      triggerDownload(blob, `${baseName}.txt`);
    } else {
      const blob = new Blob([buildRtf(text)], { type: "application/rtf" });
      triggerDownload(blob, `${baseName}.rtf`);
    }
  };

  return (
    <ToolLayout
      icon="📋"
      title="PDF → Document"
      description="Export PDF text as .txt or .rtf — ready to open in Microsoft Word."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => extract(f[0])} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-fuchsia-50 border border-fuchsia-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-fuchsia-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setText(""); }} className="text-fuchsia-400 hover:text-fuchsia-600 ml-3">✕</button>
          </div>

          {processing && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Reading PDF…</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-fuchsia-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {text && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Export format</label>
                <div className="flex gap-3">
                  {(["txt", "rtf"] as Format[]).map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="accent-fuchsia-600" />
                      <span className="font-mono">.{f}</span>
                      <span className="text-gray-400 text-xs">{f === "txt" ? "(plain text)" : "(rich text — open in Word)"}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={exportDoc} className="btn-primary mb-4">
                ⬇️ Download .{format}
              </button>

              <textarea
                readOnly value={text} rows={10}
                className="w-full border border-gray-200 rounded-xl p-4 text-xs text-gray-700 font-mono resize-y focus:outline-none bg-gray-50"
              />
            </>
          )}
        </>
      )}
    </ToolLayout>
  );
}

function triggerDownload(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
}
