import Link from "next/link";

const tools = [
  { href: "/merge", label: "Merge PDFs" },
  { href: "/split", label: "Split PDF" },
  { href: "/compress", label: "Compress PDF" },
  { href: "/unlock", label: "Unlock PDF" },
  { href: "/protect", label: "Protect PDF" },
  { href: "/rotate", label: "Rotate Pages" },
  { href: "/watermark", label: "Watermark PDF" },
  { href: "/extract-text", label: "Extract Text" },
  { href: "/pdf-to-document", label: "PDF to Document" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">IHavePDF</h2>
            <p className="text-sm leading-relaxed">
              Free, 100% browser-based PDF tools. Your files never leave your device —
              everything runs locally with zero uploads.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">PDF Tools</h3>
            <ul className="space-y-1">
              {tools.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-sm hover:text-indigo-400 transition-colors">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Why IHavePDF?</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ 100% free — no hidden costs</li>
              <li>🔒 Files stay on your device</li>
              <li>⚡ Fast, no server round-trips</li>
              <li>📱 Works on any device</li>
              <li>🚫 No sign-up required</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs">
          © {new Date().getFullYear()} IHavePDF. All rights reserved. Built with privacy in mind.
        </div>
      </div>
    </footer>
  );
}
