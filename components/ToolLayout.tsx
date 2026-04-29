import { ReactNode } from "react";

interface Props {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function ToolLayout({ icon, title, description, children }: Props) {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4" role="img" aria-label={title}>{icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">{description}</p>
        <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">🔒 100% local</span>
          <span>·</span>
          <span className="flex items-center gap-1">⚡ Instant</span>
          <span>·</span>
          <span className="flex items-center gap-1">🚫 No upload</span>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {children}
      </div>
    </section>
  );
}
