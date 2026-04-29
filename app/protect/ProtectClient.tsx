"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { encryptPdf } from "@/lib/pdf-encrypt";
import ToolLayout from "@/components/ToolLayout";
import FileDropZone from "@/components/FileDropZone";

export default function ProtectClient() {
  const [file, setFile] = useState<File | null>(null);
  const [userPw, setUserPw] = useState("");
  const [ownerPw, setOwnerPw] = useState("");
  const [allowPrint, setAllowPrint] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const protect = async () => {
    if (!file) return;
    if (!userPw) { setError("User password is required."); return; }
    setProcessing(true); setError(""); setDone(false);
    try {
      const buf = await file.arrayBuffer();
      // Load and re-save without object streams so our parser can handle it cleanly
      const doc = await PDFDocument.load(buf);
      const cleanBytes = await doc.save({ useObjectStreams: false });

      const encryptedBytes = encryptPdf(
        cleanBytes,
        userPw,
        ownerPw || userPw + "_owner",
        allowPrint
      );
      download(encryptedBytes, file.name.replace(/\.pdf$/i, "_protected.pdf"));
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to protect PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon="🔒"
      title="Protect PDF"
      description="Add RC4-128 password encryption and restrict print, copy, and edit permissions — 100% in your browser."
    >
      {!file ? (
        <FileDropZone onFiles={(f) => { setFile(f[0]); setError(""); setDone(false); }} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
            <span className="text-sm text-red-800 font-medium truncate">{file.name}</span>
            <button onClick={() => { setFile(null); setDone(false); }} className="text-red-400 hover:text-red-600 ml-3">✕</button>
          </div>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPw ? "text" : "password"}
                value={userPw}
                onChange={(e) => setUserPw(e.target.value)}
                placeholder="Password to open the PDF"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Password <span className="text-gray-400">(optional — to change permissions)</span>
              </label>
              <input
                type={showPw ? "text" : "password"}
                value={ownerPw}
                onChange={(e) => setOwnerPw(e.target.value)}
                placeholder="Defaults to user password + suffix"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showPw}
                onChange={(e) => setShowPw(e.target.checked)}
                className="accent-indigo-600"
              />
              Show passwords
            </label>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-5">
            <p className="text-xs font-medium text-gray-600 mb-2">Permissions</p>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPrint}
                onChange={(e) => setAllowPrint(e.target.checked)}
                className="accent-indigo-600"
              />
              Allow printing
            </label>
            <p className="text-xs text-gray-400 mt-2">Copying and editing are always disabled when protected.</p>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {done && <p className="text-green-600 text-sm mb-3">✅ Protected PDF downloaded!</p>}

          <button onClick={protect} disabled={processing || !userPw} className="btn-primary w-full">
            {processing ? "Encrypting…" : "Protect & Download"}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            RC4-128 encryption (PDF standard). Compatible with all PDF viewers.
          </p>
        </>
      )}
    </ToolLayout>
  );
}

function download(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
}
