import type { MetadataRoute } from "next";


const base = "https://pdfforge.tools";

const routes: { path: string; priority: number }[] = [
  { path: "/", priority: 1.0 },
  // Organise
  { path: "/merge", priority: 0.9 },
  { path: "/split", priority: 0.9 },
  { path: "/organize", priority: 0.8 },
  { path: "/rotate", priority: 0.8 },
  { path: "/page-numbers", priority: 0.8 },
  { path: "/header-footer", priority: 0.7 },
  // Convert
  { path: "/pdf-to-word", priority: 0.9 },
  { path: "/pdf-to-excel", priority: 0.9 },
  { path: "/pdf-to-powerpoint", priority: 0.8 },
  { path: "/pdf-to-jpg", priority: 0.9 },
  { path: "/jpg-to-pdf", priority: 0.9 },
  { path: "/word-to-pdf", priority: 0.9 },
  { path: "/excel-to-pdf", priority: 0.8 },
  { path: "/powerpoint-to-pdf", priority: 0.8 },
  { path: "/pdf-to-document", priority: 0.8 },
  { path: "/html-to-pdf", priority: 0.8 },
  { path: "/pdf-to-pdfa", priority: 0.7 },
  // Edit
  { path: "/edit-pdf", priority: 0.9 },
  { path: "/watermark", priority: 0.8 },
  { path: "/crop", priority: 0.8 },
  { path: "/flatten", priority: 0.7 },
  { path: "/redact", priority: 0.8 },
  { path: "/sign", priority: 0.9 },
  // Optimise
  { path: "/compress", priority: 0.9 },
  { path: "/repair", priority: 0.8 },
  { path: "/ocr", priority: 0.8 },
  // Security
  { path: "/unlock", priority: 0.8 },
  { path: "/protect", priority: 0.8 },
  // More
  { path: "/extract-text", priority: 0.8 },
  { path: "/scan", priority: 0.8 },
  { path: "/ai-summarizer", priority: 0.7 },
  { path: "/translate", priority: 0.7 },
  { path: "/compare", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : ("monthly" as const),
    priority,
  }));
}
