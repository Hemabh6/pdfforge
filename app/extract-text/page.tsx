import type { Metadata } from "next";
import ExtractTextClient from "./ExtractTextClient";

export const metadata: Metadata = {
  title: "Extract Text from PDF Online – Free",
  description:
    "Pull plain text from every page of a PDF — browser-based with clipboard copy and TXT download. No upload, no sign-up.",
  alternates: { canonical: "https://pdfforge.tools/extract-text" },
  openGraph: { title: "Extract Text from PDF – PDFForge", url: "https://pdfforge.tools/extract-text" },
};

export default function ExtractTextPage() {
  return <ExtractTextClient />;
}
