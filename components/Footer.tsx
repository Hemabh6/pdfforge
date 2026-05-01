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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
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
          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@ihavepdf.com"
                  className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
                  </svg>
                  support@ihavepdf.com
                </a>
              </li>
              <li className="text-gray-500 text-xs leading-relaxed">
                Found a bug or have a suggestion?<br />
                We&apos;d love to hear from you.
              </li>
              <li>
                <a
                  href="mailto:support@ihavepdf.com?subject=Bug Report"
                  className="inline-block text-xs border border-gray-700 hover:border-indigo-500 hover:text-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Report a bug
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs space-y-1">
          <div>© {new Date().getFullYear()} IHavePDF. All rights reserved. Built with privacy in mind.</div>
          <div className="text-gray-500">Made with ❤️ by Aaviskar Softwares</div>
        </div>
      </div>
    </footer>
  );
}
