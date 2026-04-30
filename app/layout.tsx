import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const siteUrl = "https://www.ihavepdf.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IHavePDF – Free Online PDF Tools | Merge, Split, Compress & More",
    template: "%s | IHavePDF – Free PDF Tools",
  },
  description:
    "IHavePDF offers 9 free, 100% browser-based PDF tools — merge, split, compress, unlock, protect, rotate, watermark, extract text, and convert. No uploads, no sign-up.",
  keywords: [
    "PDF tools",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "unlock PDF",
    "protect PDF",
    "rotate PDF",
    "watermark PDF",
    "extract text from PDF",
    "free PDF editor online",
    "PDF to word",
  ],
  authors: [{ name: "IHavePDF" }],
  creator: "IHavePDF",
  publisher: "IHavePDF",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "IHavePDF",
    title: "IHavePDF – Free Online PDF Tools",
    description:
      "9 free, 100% browser-based PDF tools. No uploads. No sign-up. Your files never leave your device.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "IHavePDF – Free PDF Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IHavePDF – Free Online PDF Tools",
    description: "Merge, split, compress, unlock, protect, rotate, watermark, extract text & more — all local.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
