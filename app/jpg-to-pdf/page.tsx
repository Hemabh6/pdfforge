import { Metadata } from "next";
import JpgToPdfClient from "./JpgToPdfClient";

export const metadata: Metadata = {
  title: "JPG to PDF — Convert Images to PDF",
  description: "Combine JPG, PNG, or WebP images into a single PDF document. No upload needed — 100% browser-based.",
};

export default function JpgToPdfPage() {
  return <JpgToPdfClient />;
}
