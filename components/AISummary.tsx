import type { DashboardSummary } from '@/lib/types';

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-w-border/60 rounded animate-pulse ${className ?? ''}`} />
  );
}

export default function AISummary({
  summary,
  loading,
}: {
  summary: DashboardSummary | null;
  loading?: boolean;
}) {
  if (loading && !summary) {
    return (
      <div className="mb-6 bg-w-surface border border-w-border rounded-lg shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-w-border">
          <div className="text-xs font-semibold text-w-mid uppercase tracking-wider">AI Summary</div>
        </div>
        <div className="p-5 space-y-2.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-4/6" />
        </div>
        <div className="px-5 py-4 bg-w-blue-bg border-t border-w-border">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </div>
    );
  }

  if (!summary || !Array.isArray(summary.insights)) return null;

  return (
    <div className="mb-6 bg-w-surface border border-w-border rounded-lg shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-w-border">
        <div className="text-xs font-semibold text-w-mid uppercase tracking-wider">AI Summary</div>
      </div>
      <div className="p-5">
        <ul className="space-y-2.5">
          {summary.insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-w-hi leading-relaxed">
              <span className="text-w-blue mt-1 shrink-0 font-bold">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
      {summary.actionItem && (
        <div className="mx-5 mb-5 px-4 py-3 bg-w-blue-bg rounded-lg border-l-4 border-w-blue">
          <div className="text-xs font-semibold text-w-blue uppercase tracking-wider mb-1.5">Action Item</div>
          <p className="text-sm text-w-hi leading-relaxed">{summary.actionItem}</p>
        </div>
      )}
    </div>
  );
}
