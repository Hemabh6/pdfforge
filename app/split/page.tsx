import type { Metadata } from "next";
import SplitClient from "./SplitClient";

export const metadata: Metadata = {
  title: "Split PDF Online – Extract Pages Free",
  description:
    "Split a PDF into individual pages or extract a custom page range — 100% browser-based. No upload, no sign-up. Free.",
  alternates: { canonical: "https://pdfforge.tools/split" },
  openGraph: { title: "Split PDF – PDFForge", url: "https://pdfforge.tools/split" },
};

export default function SplitPage() {
  return <SplitClient />;
}
