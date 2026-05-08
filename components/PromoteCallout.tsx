import type { YouTubeAdRow } from '@/lib/types';

export default function PromoteCallout({ ads }: { ads: YouTubeAdRow[] }) {
  const toPromote = ads.filter(a => a.evaluation?.status === 'promote');
  if (toPromote.length === 0) return null;
  return (
    <div className="mb-6 p-4 bg-bone-warn-bg border border-bone-warn/50">
      <div className="text-bone-warn font-bold mb-2 text-sm">
        {toPromote.length} short{toPromote.length > 1 ? 's' : ''} ready to promote → Demand Gen
      </div>
      <ul className="space-y-1">
        {toPromote.map(ad => (
          <li key={ad.adName} className="text-sm text-bone-mid">
            <span className="text-bone-hi font-medium">{ad.adName}</span>
            {' — '}
            {ad.evaluation?.signals.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
