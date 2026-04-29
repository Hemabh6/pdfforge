import { Metadata } from "next";
import CropClient from "./CropClient";
export const metadata: Metadata = {
  title: "Crop PDF — Trim Page Margins",
  description: "Remove unwanted whitespace or margins from every page of your PDF. 100% browser-based.",
};
export default function CropPage() { return <CropClient />; }
