import type { Metadata } from "next";
import UnlockClient from "./UnlockClient";

export const metadata: Metadata = {
  title: "Unlock PDF – Remove Password Protection Free",
  description:
    "Remove password protection from a PDF file instantly — enter the password, get an unlocked copy. 100% browser-based, no upload.",
  alternates: { canonical: "https://pdfforge.tools/unlock" },
  openGraph: { title: "Unlock PDF – PDFForge", url: "https://pdfforge.tools/unlock" },
};

export default function UnlockPage() {
  return <UnlockClient />;
}
