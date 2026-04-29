import type { Metadata } from "next";
import RotateClient from "./RotateClient";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online – Free",
  description:
    "Rotate all or specific PDF pages by 90°, 180°, or 270° — instantly, 100% in your browser. No upload needed.",
  alternates: { canonical: "https://pdfforge.tools/rotate" },
  openGraph: { title: "Rotate PDF Pages – PDFForge", url: "https://pdfforge.tools/rotate" },
};

export default function RotatePage() {
  return <RotateClient />;
}
