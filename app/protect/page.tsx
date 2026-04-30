import type { Metadata } from "next";
import ProtectClient from "./ProtectClient";

export const metadata: Metadata = {
  title: "Protect PDF – Add Password & Restrict Permissions Free",
  description:
    "Add user and owner passwords to a PDF and restrict printing, copying, and editing — 100% browser-based, no upload.",
  alternates: { canonical: "https://www.ihavepdf.com/protect" },
  openGraph: { title: "Protect PDF – IHavePDF", url: "https://www.ihavepdf.com/protect" },
};

export default function ProtectPage() {
  return <ProtectClient />;
}
