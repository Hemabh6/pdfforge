import { ReactNode } from "react";

interface Props {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function ToolLayout({ icon, title, description, children }: Props) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-7 sm:mb-10">
        <div className="text-4xl sm:text-5xl mb-3" role="img" aria-label={title}>{icon}</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">🔒 100% local</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1">⚡ Instant</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1">🚫 No upload</span>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-8">
        {children}
      </div>
    </section>
  );
}
