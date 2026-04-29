"use client";
import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

const ALIGN = ["left", "center", "right"] as const;
type Align = typeof ALIGN[number];

export default function HeaderFooterClient() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [headerLeft, setHeaderLeft] = useState("");
  const [headerCenter, setHeaderCenter] = useState("");
  const [headerRight, setHeaderRight] = useState("");
  const [footerLeft, setFooterLeft] = useState("");
  const [footerCenter, setFooterCenter] = useState("{page}");
  const [footerRight, setFooterRight] = useState("");
  const [fontSize, setFontSize] = useState(10);
  const [margin, setMargin] = useState(18);

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      const resolve = (tpl: string, page: number, total: number) =>
        tpl.replace("{page}", String(page)).replace("{total}", String(total));

      const drawText = (page: ReturnType<typeof doc.getPages>[0], text: string, x: number, y: number) => {
        if (!text) return;
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      };

      const textX = (text: string, align: Align, width: number) => {
        const w = font.widthOfTextAtSize(text, fontSize);
        if (align === "left") return margin;
        if (align === "right") return width - w - margin;
        return (width - w) / 2;
      };

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const pageNum = i + 1;
        const total = pages.length;

        [
          { raw: headerLeft, align: "left" as Align, y: height - margin - fontSize },
          { raw: headerCenter, align: "center" as Align, y: height - margin - fontSize },
          { raw: headerRight, align: "right" as Align, y: height - margin - fontSize },
          { raw: footerLeft, align: "left" as Align, y: margin },
          { raw: footerCenter, align: "center" as Align, y: margin },
          { raw: footerRight, align: "right" as Align, y: margin },
        ].forEach(({ raw, align, y }) => {
          const text = resolve(raw, pageNum, total);
          if (!text.trim()) return;
          drawText(page, text, textX(text, align, width), y);
        });
      });

      const bytes = await doc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "_header-footer.pdf");
      a.click();
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add header/footer.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="📄"
      title="Add Header & Footer"
      description="Add custom text headers and footers to every page. Use {page} and {total} as placeholders."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => { setFile(f[0]); setError(""); setDone(false); }} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-indigo-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-indigo-400 hover:text-indigo-600 ml-3">✕</button>
          </div>

          <div className="space-y-5 mb-5">
            {/* Header row */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Header</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: "Left", val: headerLeft, set: setHeaderLeft }, { label: "Center", val: headerCenter, set: setHeaderCenter }, { label: "Right", val: headerRight, set: setHeaderRight }].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input type="text" value={val} onChange={(e) => set(e.target.value)} placeholder="Text…"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer row */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Footer</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: "Left", val: footerLeft, set: setFooterLeft }, { label: "Center", val: footerCenter, set: setFooterCenter }, { label: "Right", val: footerRight, set: setFooterRight }].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input type="text" value={val} onChange={(e) => set(e.target.value)} placeholder="Text…"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font size (pt)</label>
                <input type="number" min={7} max={24} value={fontSize}
                  onChange={(e) => setFontSize(Math.max(7, parseInt(e.target.value) || 10))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Margin (pt)</label>
                <input type="number" min={8} max={72} value={margin}
                  onChange={(e) => setMargin(Math.max(8, parseInt(e.target.value) || 18))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <p className="text-xs text-gray-400">Use <code className="bg-gray-100 px-1 rounded">{"{page}"}</code> for page number and <code className="bg-gray-100 px-1 rounded">{"{total}"}</code> for total pages.</p>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ PDF with header/footer downloaded!</p>}

          <button onClick={apply} disabled={processing} className="btn-primary w-full">
            {processing ? "Applying…" : "Apply & Download"}
          </button>
        </>
      )}
    </ToolLayout>
  );
}
