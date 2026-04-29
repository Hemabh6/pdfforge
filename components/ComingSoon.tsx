import ToolLayout from "./ToolLayout";

interface Props {
  icon: string;
  title: string;
  description: string;
  reason?: string;
}

export default function ComingSoon({ icon, title, description, reason }: Props) {
  return (
    <ToolLayout icon={icon} title={title} description={description}>
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-5 text-4xl">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Coming Soon</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-6">
          {reason ?? "This tool requires server-side processing and will be available in a future update."}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 inline-block text-left max-w-sm mx-auto">
          <p className="text-amber-800 text-sm font-medium mb-1">Why server-side?</p>
          <p className="text-amber-700 text-xs leading-relaxed">
            Format conversion between Office documents and PDF requires native libraries (LibreOffice, Apache POI)
            that cannot run inside a browser. We are working on a cloud version.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
