import type { Metadata } from "next";
import CompressClient from "./CompressClient";

export const metadata: Metadata = {
  title: "Compress PDF Online – Reduce File Size Free",
  description:
    "Reduce PDF file size by stripping metadata and applying object compression — 100% browser-based. No upload, no sign-up.",
  alternates: { canonical: "https://pdfforge.tools/compress" },
  openGraph: { title: "Compress PDF – PDFForge", url: "https://pdfforge.tools/compress" },
};

export default function CompressPage() {
  return <CompressClient />;
}
