"use client";
import Link from "next/link";
import { useState } from "react";

const navGroups = [
  {
    label: "Organise",
    tools: [
      { href: "/merge", label: "Merge PDF" },
      { href: "/split", label: "Split PDF" },
      { href: "/organize", label: "Organize PDF" },
      { href: "/rotate", label: "Rotate PDF" },
      { href: "/page-numbers", label: "Page Numbers" },
      { href: "/header-footer", label: "Header & Footer" },
    ],
  },
  {
    label: "Convert",
    tools: [
      { href: "/pdf-to-word", label: "PDF to Word" },
      { href: "/pdf-to-excel", label: "PDF to Excel" },
      { href: "/pdf-to-powerpoint", label: "PDF to PowerPoint" },
      { href: "/pdf-to-jpg", label: "PDF to JPG" },
      { href: "/jpg-to-pdf", label: "JPG to PDF" },
      { href: "/word-to-pdf", label: "Word to PDF" },
      { href: "/excel-to-pdf", label: "Excel to PDF" },
      { href: "/powerpoint-to-pdf", label: "PowerPoint to PDF" },
      { href: "/pdf-to-document", label: "PDF to DOC" },
      { href: "/html-to-pdf", label: "HTML to PDF" },
    ],
  },
  {
    label: "Edit",
    tools: [
      { href: "/edit-pdf", label: "Edit PDF" },
      { href: "/watermark", label: "Watermark PDF" },
      { href: "/crop", label: "Crop PDF" },
      { href: "/flatten", label: "Flatten PDF" },
      { href: "/redact", label: "Redact PDF" },
      { href: "/sign", label: "Sign PDF" },
    ],
  },
  {
    label: "Optimise",
    tools: [
      { href: "/compress", label: "Compress PDF" },
      { href: "/repair", label: "Repair PDF" },
      { href: "/ocr", label: "OCR PDF" },
    ],
  },
  {
    label: "Security",
    tools: [
      { href: "/unlock", label: "Unlock PDF" },
      { href: "/protect", label: "Protect PDF" },
    ],
  },
  {
    label: "More",
    tools: [
      { href: "/extract-text", label: "Extract Text" },
      { href: "/scan", label: "Scan to PDF" },
      { href: "/ai-summarizer", label: "AI Summarizer" },
      { href: "/translate", label: "Translate PDF" },
      { href: "/compare", label: "Compare PDF" },
      { href: "/pdf-to-pdfa", label: "PDF to PDF/A" },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 shrink-0" aria-label="IHavePDF home">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="2" width="18" height="20" rx="2" fill="#4f46e5" opacity=".15"/>
              <rect x="3" y="2" width="18" height="20" rx="2" stroke="#4f46e5" strokeWidth="1.5"/>
              <path d="M7 7h10M7 11h10M7 15h6" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            IHavePDF
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navGroups.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setActiveGroup(group.label)}
                onMouseLeave={() => setActiveGroup(null)}
              >
                <button className="px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1">
                  {group.label}
                  <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeGroup === group.label && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-2 min-w-[200px] z-50">
                    {group.tools.map((t) => (
                      <Link key={t.href} href={t.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        {t.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="hidden lg:inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:bg-indigo-50 px-4 py-1.5 rounded-lg transition-colors">
              All Tools
            </Link>
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-4 max-h-[70vh] overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">{group.label}</p>
                <div className="grid grid-cols-2 gap-1">
                  {group.tools.map((t) => (
                    <Link key={t.href} href={t.href} onClick={() => setOpen(false)}
                      className="px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      {t.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
