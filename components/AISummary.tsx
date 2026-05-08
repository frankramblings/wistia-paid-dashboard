import type { DashboardSummary } from '@/lib/types';

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-bone-border/60 rounded animate-pulse ${className ?? ''}`} />
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
      <div className="mb-6 space-y-3">
        <div className="bg-bone-alt border-l-4 border-bone-border p-4">
          <div className="text-[8px] font-bold uppercase tracking-[.22em] text-bone-mid mb-3">AI Summary</div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
        </div>
        <div className="bg-bone-alt border-l-4 border-bone-border p-4">
          <div className="text-[8px] font-bold uppercase tracking-[.22em] text-bone-mid mb-2">Action Item</div>
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="mb-6 space-y-2">
      {/* Insights */}
      <div className="bg-bone-alt border-l-4 border-bone-hi p-4">
        <div className="text-[8px] font-bold uppercase tracking-[.22em] text-bone-hi mb-3">AI Summary</div>
        <ul className="space-y-2">
          {summary.insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-bone-mid leading-relaxed">
              <span className="text-bone-border mt-0.5 shrink-0 font-bebas text-base leading-none">—</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action item: sibling block, not nested */}
      {summary.actionItem && (
        <div className="bg-bone-alt border-l-4 border-bone-warn p-4">
          <div className="text-[8px] font-bold uppercase tracking-[.22em] text-bone-warn mb-1.5">Action Item</div>
          <p className="text-sm text-bone-mid leading-relaxed">{summary.actionItem}</p>
        </div>
      )}
    </div>
  );
}
