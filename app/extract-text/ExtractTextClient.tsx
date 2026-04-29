"use client";
import { useState } from "react";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

export default function ExtractTextClient() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const extract = async (f: File) => {
    setFile(f); setText(""); setError(""); setCopied(false); setProgress(0);
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
        parts.push(`--- Page ${i} ---\n${pageText.trim()}`);
        setProgress(Math.round((i / pdf.numPages) * 100));
      }
      setText(parts.join("\n\n"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not extract text.");
    } finally {
      setProcessing(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (file?.name ?? "output").replace(/\.pdf$/i, ".txt");
    a.click();
  };

  return (
    <ToolLayout icon="📝" title="Extract Text from PDF" description="Pull raw text from every page — copy or download as TXT.">
      {!file ? (
        <FileDropZone onFiles={(f) => extract(f[0])} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-green-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setText(""); }} className="text-green-400 hover:text-green-600 ml-3">✕</button>
          </div>

          {processing && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Extracting text…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {text && (
            <>
              <div className="flex gap-2 mb-3">
                <button onClick={copy} className="btn-primary text-sm px-4 py-2">
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
                <button onClick={downloadTxt} className="btn-primary text-sm px-4 py-2">
                  ⬇️ Download .txt
                </button>
              </div>
              <textarea
                readOnly
                value={text}
                rows={14}
                className="w-full border border-gray-200 rounded-xl p-4 text-xs text-gray-700 font-mono resize-y focus:outline-none bg-gray-50"
              />
              <p className="text-xs text-gray-400 mt-1">{text.length.toLocaleString()} characters</p>
            </>
          )}
        </>
      )}
    </ToolLayout>
  );
}
