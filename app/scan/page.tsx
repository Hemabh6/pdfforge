import { Metadata } from "next";
import ScanClient from "./ScanClient";
export const metadata: Metadata = {
  title: "Scan to PDF — Use Your Camera",
  description: "Capture documents with your device camera and convert them to a PDF instantly. No app needed.",
};
export default function ScanPage() { return <ScanClient />; }
