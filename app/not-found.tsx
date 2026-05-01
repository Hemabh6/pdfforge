import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-extrabold text-indigo-100 mb-2 select-none">404</div>
      <div className="text-5xl mb-4">🔍</div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Head back home to find the tool you need.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Go home
        </Link>
        <a
          href="mailto:support@ihavepdf.com?subject=Broken Link Report&body=Hi, I found a broken link on IHavePDF. The URL I visited was: "
          className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Report broken link
        </a>
      </div>
    </div>
  );
}
