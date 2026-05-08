import type { AssetStatus } from '@/lib/types';

const CONFIG: Record<AssetStatus, { bg: string; text: string; label: string }> = {
  strong:  { bg: 'bg-bone-good-bg', text: 'text-bone-good', label: '✓✓ Strong' },
  good:    { bg: 'bg-bone-good-bg', text: 'text-bone-good', label: '✓ Good'   },
  warning: { bg: 'bg-bone-warn-bg', text: 'text-bone-warn', label: '⚠ Watch'  },
  below:   { bg: 'bg-bone-poor-bg', text: 'text-bone-poor', label: '↓ Below'  },
  promote: { bg: 'bg-bone-poor-bg', text: 'text-bone-poor', label: '↑ Promote' },
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
      title={signals?.join(' · ')}
    >
      {c.label}
    </span>
  );
}
