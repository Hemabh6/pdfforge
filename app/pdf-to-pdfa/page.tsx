"use client";
import ComingSoon from "@/components/ComingSoon";
export default function PdfToPdfaPage() {
  return (
    <ComingSoon
      icon="🗄️"
      title="PDF to PDF/A"
      description="Convert PDFs to the PDF/A archival standard for long-term digital preservation."
      reason="PDF/A compliance requires embedding fonts, stripping encryption, and validating ICC color profiles — a server-side process."
    />
  );
}
