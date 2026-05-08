import type { AssetStatus } from '@/lib/types';

const CONFIG: Record<AssetStatus, { bg: string; text: string; label: string }> = {
  strong:  { bg: 'bg-w-good-bg', text: 'text-w-good', label: '✓✓ Strong' },
  good:    { bg: 'bg-w-good-bg', text: 'text-w-good', label: '✓ Good'   },
  warning: { bg: 'bg-w-warn-bg', text: 'text-w-warn', label: '⚠ Watch'  },
  below:   { bg: 'bg-w-poor-bg', text: 'text-w-poor', label: '↓ Below'  },
  promote: { bg: 'bg-w-blue-bg', text: 'text-w-blue', label: '↑ Promote' },
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
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      title={signals?.join(' · ')}
    >
      {c.label}
    </span>
  );
}
