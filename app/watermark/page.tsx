import type { Metadata } from "next";
import WatermarkClient from "./WatermarkClient";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online – Free",
  description:
    "Stamp diagonal text watermarks (CONFIDENTIAL, DRAFT, etc.) on every page of your PDF — browser-based, no upload.",
  alternates: { canonical: "https://www.ihavepdf.com/watermark" },
  openGraph: { title: "Watermark PDF – IHavePDF", url: "https://www.ihavepdf.com/watermark" },
};

export default function WatermarkPage() {
  return <WatermarkClient />;
}
