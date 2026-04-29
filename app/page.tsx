import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PDFForge – Free Online PDF Tools | ilovepdf Alternative",
  description:
    "29 free PDF tools — merge, split, compress, convert, sign, protect, edit, OCR, and more. All 100% browser-based. No sign-up. Nothing uploaded.",
  alternates: { canonical: "https://www.ihavepdf.com" },
};

interface Tool {
  href: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  badge?: string;
}

const categories: { label: string; icon: string; tools: Tool[] }[] = [
  {
    label: "Organise PDF",
    icon: "📑",
    tools: [
      { href: "/merge", icon: "🔗", title: "Merge PDF", description: "Combine multiple PDFs into one document.", color: "from-red-400 to-rose-500" },
      { href: "/split", icon: "✂️", title: "Split PDF", description: "Extract pages or ranges from a PDF.", color: "from-orange-400 to-amber-500" },
      { href: "/organize", icon: "📑", title: "Organize PDF", description: "Drag pages to reorder, rotate, or delete.", color: "from-yellow-400 to-amber-500" },
      { href: "/rotate", icon: "🔄", title: "Rotate PDF", description: "Rotate all or individual pages.", color: "from-green-400 to-emerald-500" },
      { href: "/page-numbers", icon: "🔢", title: "Page Numbers", description: "Add page numbers in any position and style.", color: "from-teal-400 to-cyan-500" },
      { href: "/header-footer", icon: "📄", title: "Header & Footer", description: "Add custom header and footer text to every page.", color: "from-sky-400 to-blue-500" },
    ],
  },
  {
    label: "Convert PDF",
    icon: "🔁",
    tools: [
      { href: "/pdf-to-word", icon: "📝", title: "PDF to Word", description: "Convert PDF to editable Word .docx documents.", color: "from-blue-400 to-indigo-500", badge: "Soon" },
      { href: "/pdf-to-excel", icon: "📊", title: "PDF to Excel", description: "Extract tables into Excel spreadsheets.", color: "from-violet-400 to-purple-500", badge: "Soon" },
      { href: "/pdf-to-powerpoint", icon: "🎞️", title: "PDF to PowerPoint", description: "Convert PDF slides to editable .pptx files.", color: "from-fuchsia-400 to-pink-500", badge: "Soon" },
      { href: "/pdf-to-jpg", icon: "🖼️", title: "PDF to JPG", description: "Convert every page to a high-res JPG image.", color: "from-pink-400 to-rose-500" },
      { href: "/pdf-to-pdfa", icon: "🗄️", title: "PDF to PDF/A", description: "Convert to the PDF/A archival standard.", color: "from-red-400 to-orange-500", badge: "Soon" },
      { href: "/word-to-pdf", icon: "📄", title: "Word to PDF", description: "Convert Word .docx files to PDF.", color: "from-orange-400 to-red-500", badge: "Soon" },
      { href: "/excel-to-pdf", icon: "📊", title: "Excel to PDF", description: "Convert Excel spreadsheets to PDF.", color: "from-green-400 to-teal-500", badge: "Soon" },
      { href: "/powerpoint-to-pdf", icon: "🎞️", title: "PowerPoint to PDF", description: "Convert .pptx presentations to PDF.", color: "from-teal-400 to-sky-500", badge: "Soon" },
      { href: "/jpg-to-pdf", icon: "🖼️", title: "JPG to PDF", description: "Combine images into a single PDF.", color: "from-sky-400 to-indigo-500" },
      { href: "/html-to-pdf", icon: "🌐", title: "HTML to PDF", description: "Convert any webpage to PDF.", color: "from-indigo-400 to-violet-500", badge: "Soon" },
    ],
  },
  {
    label: "Edit PDF",
    icon: "✏️",
    tools: [
      { href: "/edit-pdf", icon: "✏️", title: "Edit PDF", description: "Add text and annotations to any page.", color: "from-amber-400 to-yellow-500" },
      { href: "/watermark", icon: "💧", title: "Watermark PDF", description: "Stamp diagonal text across every page.", color: "from-sky-400 to-blue-500" },
      { href: "/redact", icon: "⬛", title: "Redact PDF", description: "Permanently hide sensitive content with black boxes.", color: "from-gray-600 to-slate-700" },
      { href: "/crop", icon: "✂️", title: "Crop PDF", description: "Remove unwanted margins from every page.", color: "from-lime-400 to-green-500" },
      { href: "/flatten", icon: "📋", title: "Flatten PDF", description: "Make form fields static and non-editable.", color: "from-slate-400 to-gray-500" },
      { href: "/sign", icon: "✍️", title: "Sign PDF", description: "Draw or type your signature and embed it.", color: "from-teal-400 to-cyan-500" },
    ],
  },
  {
    label: "Optimise PDF",
    icon: "⚡",
    tools: [
      { href: "/compress", icon: "🗜️", title: "Compress PDF", description: "Reduce file size while keeping visual quality.", color: "from-green-400 to-emerald-500" },
      { href: "/repair", icon: "🔧", title: "Repair PDF", description: "Recover and rebuild corrupted or damaged PDFs.", color: "from-slate-400 to-gray-600" },
      { href: "/ocr", icon: "🔍", title: "OCR PDF", description: "Make scanned PDFs searchable with text recognition.", color: "from-violet-400 to-indigo-500", badge: "Soon" },
    ],
  },
  {
    label: "PDF Security",
    icon: "🔐",
    tools: [
      { href: "/unlock", icon: "🔓", title: "Unlock PDF", description: "Remove password protection — enter it, get a free copy.", color: "from-amber-400 to-orange-500" },
      { href: "/protect", icon: "🔒", title: "Protect PDF", description: "Add RC4-128 encryption and restrict permissions.", color: "from-red-500 to-rose-600" },
    ],
  },
  {
    label: "PDF Intelligence",
    icon: "🤖",
    tools: [
      { href: "/extract-text", icon: "📝", title: "Extract Text", description: "Pull text from every page — copy or download.", color: "from-green-400 to-emerald-500" },
      { href: "/pdf-to-document", icon: "📋", title: "PDF to DOC", description: "Export PDF text as .txt or .rtf for Word.", color: "from-fuchsia-400 to-pink-500" },
      { href: "/scan", icon: "📷", title: "Scan to PDF", description: "Use your camera to scan documents into a PDF.", color: "from-orange-400 to-amber-500" },
      { href: "/ai-summarizer", icon: "🤖", title: "AI Summarizer", description: "Get an instant AI-powered summary of any PDF.", color: "from-indigo-400 to-violet-500", badge: "Soon" },
      { href: "/translate", icon: "🌍", title: "Translate PDF", description: "Translate your PDF into 50+ languages.", color: "from-sky-400 to-teal-500", badge: "Soon" },
      { href: "/compare", icon: "🔀", title: "Compare PDF", description: "Highlight differences between two PDF documents.", color: "from-violet-400 to-purple-500", badge: "Soon" },
    ],
  },
];

const allTools = categories.flatMap((c) => c.tools);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PDFForge",
  url: "https://www.ihavepdf.com",
  description: "29 free PDF tools — merge, split, compress, convert, sign, protect, edit, and more. 100% browser-based.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: allTools.map((t) => t.title),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Every PDF Tool You Need,
            <br className="hidden sm:block" /> Right in Your Browser
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            29 powerful PDF tools — merge, split, convert, sign, protect, edit & more.
            <strong className="text-white"> Nothing is ever uploaded. Your files never leave your device.</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {["✅ 100% Free", "🔒 Files stay local", "⚡ No sign-up", "📱 Works on any device", "🛡️ No watermarks"].map((b) => (
              <span key={b} className="bg-white/15 backdrop-blur px-4 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools by category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="text-3xl font-bold text-center text-gray-900 mb-3">
          All PDF Tools
        </h2>
        <p className="text-center text-gray-500 mb-12">Pick a tool to get started — no account or download needed.</p>

        <div className="space-y-14">
          {categories.map((cat) => (
            <div key={cat.label}>
              <h3 className="text-base font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <span>{cat.icon}</span> {cat.label}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-sm"
                  >
                    {tool.badge && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} text-white text-2xl mb-3 shadow-sm`}>
                      {tool.icon}
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors leading-tight">
                      {tool.title}
                    </h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{tool.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy callout */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🔒", title: "100% Private", desc: "All processing runs inside your browser. Your documents are never transmitted to any server." },
              { icon: "⚡", title: "Instant Results", desc: "No uploads, no waiting. Files are processed locally using WebAssembly and JavaScript." },
              { icon: "🆓", title: "Always Free", desc: "No watermarks, no file limits, no subscriptions. Every tool is free forever." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">How PDFForge Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Choose a tool", desc: "Pick from 29 PDF tools above — no account needed." },
              { step: "2", title: "Drop your file", desc: "Drag & drop or click to select. Your file opens locally in your browser." },
              { step: "3", title: "Download the result", desc: "Processing is instant, in-browser. Download your new file immediately." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Is PDFForge really free?", a: "Yes — 100% free, forever. No watermarks, no file size limits, no credit card required." },
              { q: "Do my files get uploaded to a server?", a: "Never. All processing happens inside your browser using JavaScript. Your files never leave your device." },
              { q: "How many tools does PDFForge have?", a: "29 tools across 6 categories: Organise, Convert, Edit, Optimise, Security, and Intelligence. Tools marked 'Soon' require server-side processing and are coming in a future update." },
              { q: "Is there a file size limit?", a: "No artificial limit. Your browser's available memory is the only constraint, typically several hundred MB." },
              { q: "Does it work on mobile?", a: "Yes — PDFForge is fully responsive and works on iOS and Android browsers without any app installation." },
              { q: "Can I protect a PDF with a real password?", a: "Yes. PDFForge implements RC4-128 encryption (PDF Standard Security Handler Rev 3) entirely in your browser — the same standard used by Adobe Acrobat and other professional tools." },
              { q: "What's the difference between Flatten and Protect?", a: "Flatten converts interactive form fields into static page content (no more editable fields). Protect adds password encryption so the document requires a password to open or to change permissions." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl border border-gray-100 px-6 py-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
                <p className="text-gray-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
