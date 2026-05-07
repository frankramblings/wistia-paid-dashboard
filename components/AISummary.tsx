import type { DashboardSummary } from '@/lib/types';

export default function AISummary({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) return null;
  return (
    <div className="mb-6 p-4 bg-gray-900 border-l-4 border-blue-500 rounded-r-lg">
      <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
        ✦ AI Summary
      </div>
      <p className="text-gray-200 text-sm leading-relaxed mb-2">{summary.narrative}</p>
      {summary.actionItem && (
        <p className="text-red-400 text-sm font-medium">→ {summary.actionItem}</p>
      )}
      <p className="text-gray-600 text-xs mt-2">
        Generated {new Date(summary.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
