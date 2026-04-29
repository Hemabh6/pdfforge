import { Metadata } from "next";
import PdfToJpgClient from "./PdfToJpgClient";

export const metadata: Metadata = {
  title: "PDF to JPG — Convert PDF Pages to Images",
  description: "Convert every page of your PDF to high-resolution JPG images. No upload needed — runs entirely in your browser.",
};

export default function PdfToJpgPage() {
  return <PdfToJpgClient />;
}
