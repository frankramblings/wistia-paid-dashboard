import type { YouTubeAdRow } from '@/lib/types';

export default function PromoteCallout({ ads }: { ads: YouTubeAdRow[] }) {
  const toPromote = ads.filter(a => a.evaluation?.status === 'promote');
  if (toPromote.length === 0) return null;
  return (
    <div className="mb-6 bg-w-surface border border-w-border rounded-lg shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-w-border">
        <div className="text-sm font-semibold text-w-hi">Creative opportunities</div>
        <div className="text-xs text-w-mid mt-0.5">
          These Shorts are ready to test in demand gen based on completion and interaction rates.
        </div>
      </div>
      <ul className="divide-y divide-w-border">
        {toPromote.map(ad => (
          <li key={ad.adName} className="px-5 py-3 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-w-hi">{ad.adName}</span>
            <span className="text-xs text-w-mid shrink-0">{ad.evaluation?.signals.join(' · ')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
