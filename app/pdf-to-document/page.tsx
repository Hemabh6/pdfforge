import type { Metadata } from "next";
import PdfToDocClient from "./PdfToDocClient";

export const metadata: Metadata = {
  title: "PDF to Document – Export as TXT or RTF Free",
  description:
    "Convert PDF text to .txt or .rtf format — paste into Word or any word processor. 100% browser-based, no upload.",
  alternates: { canonical: "https://www.ihavepdf.com/pdf-to-document" },
  openGraph: { title: "PDF to Document – IHavePDF", url: "https://www.ihavepdf.com/pdf-to-document" },
};

export default function PdfToDocPage() {
  return <PdfToDocClient />;
}
