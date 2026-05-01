"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

interface Tool {
  href: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  badge?: string;
}

interface Category {
  label: string;
  icon: string;
  tools: Tool[];
}

interface Props {
  categories: Category[];
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      prefetch={false}
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
  );
}

export default function ToolsSearch({ categories }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return categories
      .flatMap((c) => c.tools)
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
  }, [query, categories]);

  return (
    <>
      {/* Search bar */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools… e.g. merge, compress, sign"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            aria-label="Search PDF tools"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      {filtered !== null ? (
        filtered.length > 0 ? (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">No tools found for &ldquo;{query}&rdquo;</p>
            <p className="text-gray-400 text-sm mt-1">Try searching for merge, split, compress, sign…</p>
          </div>
        )
      ) : (
        /* All tools by category */
        <div className="space-y-14">
          {categories.map((cat) => (
            <div key={cat.label}>
              <h3 className="text-base font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                <span>{cat.icon}</span> {cat.label}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cat.tools.map((tool) => (
                  <ToolCard key={tool.href} tool={tool} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
