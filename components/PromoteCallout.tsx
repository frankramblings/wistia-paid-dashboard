import type { YouTubeAdRow } from '@/lib/types';

export default function PromoteCallout({ ads }: { ads: YouTubeAdRow[] }) {
  const toPromote = ads.filter(a => a.evaluation?.status === 'promote');
  if (toPromote.length === 0) return null;
  return (
    <div className="mb-6 p-4 bg-red-950/40 border border-red-800 rounded-lg">
      <div className="text-red-400 font-bold mb-2">
        🚀 {toPromote.length} short{toPromote.length > 1 ? 's' : ''} ready to promote → Demand Gen
      </div>
      <ul className="space-y-1">
        {toPromote.map(ad => (
          <li key={ad.adName} className="text-sm text-gray-300">
            <span className="text-white font-medium">{ad.adName}</span>
            {' — '}
            {ad.evaluation?.signals.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
