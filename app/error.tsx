"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const subject = encodeURIComponent("Error Report – IHavePDF");
  const body = encodeURIComponent(
    `Hi IHavePDF Support,\n\nI encountered an error on the website.\n\nError: ${error.message}\n${error.digest ? `Digest: ${error.digest}\n` : ""}Page: ${typeof window !== "undefined" ? window.location.href : ""}\n\nPlease look into this.\n\nThanks`
  );

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        An unexpected error occurred with this tool. You can try again, go back to the home page,
        or report this to us so we can fix it.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Try again
        </button>
        <Link
          href="/"
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Go home
        </Link>
        <a
          href={`mailto:support@ihavepdf.com?subject=${subject}&body=${body}`}
          className="bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-600 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Report this error
        </a>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-gray-400">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
