import type { Metadata } from "next";
import MergeClient from "./MergeClient";

export const metadata: Metadata = {
  title: "Merge PDF Files Online – Free & Local",
  description:
    "Combine multiple PDF files into one document instantly — 100% browser-based, no upload, no sign-up required. Free forever.",
  alternates: { canonical: "https://www.ihavepdf.com/merge" },
  openGraph: { title: "Merge PDF Files – IHavePDF", url: "https://www.ihavepdf.com/merge" },
};

export default function MergePage() {
  return <MergeClient />;
}
