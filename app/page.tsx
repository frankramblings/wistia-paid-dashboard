'use client';
import { useState, useEffect } from 'react';
import AISummary from '@/components/AISummary';
import PromoteCallout from '@/components/PromoteCallout';
import KPIStrip from '@/components/KPIStrip';
import type { YouTubeAdRow, YouTubeOrganicVideo, TikTokVideo, DashboardSummary } from '@/lib/types';

export default function OverviewPage() {
  const [ytAds, setYtAds] = useState<YouTubeAdRow[]>([]);
  const [ytOrganic, setYtOrganic] = useState<YouTubeOrganicVideo[]>([]);
  const [tiktok, setTiktok] = useState<TikTokVideo[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [adsRes, organicRes, ttRes] = await Promise.all([
        fetch('/api/data/youtube-ads').then(r => r.json()),
        fetch('/api/data/youtube-organic').then(r => r.json()),
        fetch('/api/data/tiktok').then(r => r.json()),
      ]);
      const ads: YouTubeAdRow[] = adsRes.ads ?? [];
      const organic: YouTubeOrganicVideo[] = organicRes.videos ?? [];
      const tt: TikTokVideo[] = ttRes.videos ?? [];
      setYtAds(ads);
      setYtOrganic(organic);
      setTiktok(tt);

      const summaryRes = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeAds: ads, youtubeOrganic: organic, tiktok: tt, dateRange: 'Last 30 days' }),
      });
      setSummary(await summaryRes.json());
      setLastRefresh(new Date().toLocaleString());
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, []);

  const toPromote = ytAds.filter(a => a.evaluation?.status === 'promote');
  const bestCostSub = ytAds
    .filter(a => a.format === 'Long-form' && a.earnedSubs > 0)
    .sort((a, b) => a.costPerConv - b.costPerConv)[0];
  const totalEarnedSubs = ytAds.reduce((s, a) => s + a.earnedSubs, 0);
  const avgTTEng = tiktok.length
    ? (tiktok.reduce((s, v) => s + v.engagementRate, 0) / tiktok.length).toFixed(1)
    : '—';
  const avgCTR = ytOrganic.length
    ? (ytOrganic.reduce((s, v) => s + v.ctr, 0) / ytOrganic.length).toFixed(1)
    : '—';

  const kpis = [
    { label: 'Shorts to Promote', value: String(toPromote.length), status: toPromote.length > 0 ? 'good' as const : 'neutral' as const },
    { label: 'Best Cost/Sub',     value: bestCostSub ? `$${bestCostSub.costPerConv.toFixed(2)}` : '—', status: 'good' as const },
    { label: 'Earned Subs',       value: String(totalEarnedSubs), status: 'good' as const },
    { label: 'TikTok Eng. Rate',  value: `${avgTTEng}%`, status: parseFloat(avgTTEng) >= 4 ? 'good' as const : 'warning' as const },
    { label: 'YT Organic CTR',    value: `${avgCTR}%`, status: parseFloat(avgCTR) >= 3 ? 'good' as const : 'warning' as const },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Overview</h1>
        <div className="flex items-center gap-3">
          {lastRefresh && <span className="text-gray-500 text-xs">Last refreshed {lastRefresh}</span>}
          <button
            onClick={refresh}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded"
          >
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <AISummary summary={summary} />
      <PromoteCallout ads={ytAds} />
      <KPIStrip kpis={kpis} />
    </div>
  );
}
