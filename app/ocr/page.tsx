"use client";
import ComingSoon from "@/components/ComingSoon";
export default function OcrPage() {
  return (
    <ComingSoon
      icon="🔍"
      title="OCR PDF"
      description="Make scanned PDFs searchable by running optical character recognition on every page."
      reason="OCR requires large language models (Tesseract) that are 50MB+ in size. A lightweight cloud version is coming soon."
    />
  );
}
