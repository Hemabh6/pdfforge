import type { Metadata } from "next";
import SplitClient from "./SplitClient";

export const metadata: Metadata = {
  title: "Split PDF Online – Extract Pages Free",
  description:
    "Split a PDF into individual pages or extract a custom page range — 100% browser-based. No upload, no sign-up. Free.",
  alternates: { canonical: "https://www.ihavepdf.com/split" },
  openGraph: { title: "Split PDF – IHavePDF", url: "https://www.ihavepdf.com/split" },
};

export default function SplitPage() {
  return <SplitClient />;
}
