import type { Metadata } from "next";
import UnlockClient from "./UnlockClient";

export const metadata: Metadata = {
  title: "Unlock PDF – Remove Password Protection Free",
  description:
    "Remove password protection from a PDF file instantly — enter the password, get an unlocked copy. 100% browser-based, no upload.",
  alternates: { canonical: "https://www.ihavepdf.com/unlock" },
  openGraph: { title: "Unlock PDF – IHavePDF", url: "https://www.ihavepdf.com/unlock" },
};

export default function UnlockPage() {
  return <UnlockClient />;
}
