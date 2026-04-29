import { Metadata } from "next";
import RedactClient from "./RedactClient";
export const metadata: Metadata = {
  title: "Redact PDF — Permanently Hide Sensitive Content",
  description: "Draw black redaction boxes over confidential text or images in your PDF. Permanently applied, browser-only.",
};
export default function RedactPage() { return <RedactClient />; }
