import type { AssetStatus } from '@/lib/types';

const CONFIG: Record<AssetStatus, { bg: string; text: string; label: string }> = {
  strong:  { bg: 'bg-green-900/50',  text: 'text-green-400',  label: '✓✓ Strong' },
  good:    { bg: 'bg-green-900/30',  text: 'text-green-400',  label: '✓ Good' },
  warning: { bg: 'bg-orange-900/30', text: 'text-orange-400', label: '⚠ Watch' },
  below:   { bg: 'bg-red-900/30',    text: 'text-red-400',    label: '↓ Below' },
  promote: { bg: 'bg-red-500/20',    text: 'text-red-400',    label: '🚀 Promote' },
};

export default function BenchmarkBadge({
  status,
  signals,
}: {
  status: AssetStatus;
  signals?: string[];
}) {
  const c = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}
          title={signals?.join(' · ')}>
      {c.label}
    </span>
  );
}
