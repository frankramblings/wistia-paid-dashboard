'use client';
import { useState, useEffect } from 'react';
import AISummary from '@/components/AISummary';
import PromoteCallout from '@/components/PromoteCallout';
import KPIStrip from '@/components/KPIStrip';
import CrossPlatformTable from '@/components/CrossPlatformTable';
import type { YouTubeAdRow, LinkedInCampaign, MetaCampaign, TikTokAdCampaign, DashboardSummary } from '@/lib/types';

const DATE_RANGES = [
  { label: 'YTD',      days: 0 },
  { label: 'Last 30d', days: 30 },
  { label: 'Last 60d', days: 60 },
  { label: 'Last 90d', days: 90 },
];

export default function OverviewPage() {
  const [ytAds, setYtAds] = useState<YouTubeAdRow[]>([]);
  const [liAds, setLiAds] = useState<LinkedInCampaign[]>([]);
  const [metaAds, setMetaAds] = useState<MetaCampaign[]>([]);
  const [ttAds, setTtAds] = useState<TikTokAdCampaign[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  const refresh = async (days = selectedDays) => {
    setLoading(true);
    try {
      const qs = days > 0 ? `?days=${days}` : '';
      const [adsRes, liRes, metaRes, ttRes] = await Promise.all([
        fetch('/api/data/youtube-ads').then(r => r.json()),
        fetch(`/api/data/linkedin-ads${qs}`).then(r => r.json()),
        fetch(`/api/data/meta-ads${qs}`).then(r => r.json()),
        fetch(`/api/data/tiktok-ads${qs}`).then(r => r.json()),
      ]);
      const ads: YouTubeAdRow[]       = adsRes.ads ?? [];
      const li: LinkedInCampaign[]    = liRes.campaigns ?? [];
      const meta: MetaCampaign[]      = metaRes.campaigns ?? [];
      const tt: TikTokAdCampaign[]    = ttRes.campaigns ?? [];
      setYtAds(ads);
      setLiAds(li);
      setMetaAds(meta);
      setTtAds(tt);

      const summaryRes = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeAds: ads,
          linkedinAds: li,
          metaAds: meta,
          tiktokAds: tt,
          dateRange: DATE_RANGES.find(r => r.days === days)?.label ?? 'Custom',
        }),
      });
      setSummary(await summaryRes.json());
      setLastRefresh(new Date().toLocaleString());
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (days: number) => {
    setSelectedDays(days);
    refresh(days);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(selectedDays); }, []);

  const toPromote      = ytAds.filter(a => a.evaluation?.status === 'promote');
  const bestCostSub    = ytAds.filter(a => a.format === 'Long-form' && a.earnedSubs > 0).sort((a, b) => a.costPerConv - b.costPerConv)[0];
  const totalEarnedSubs = ytAds.reduce((s, a) => s + a.earnedSubs, 0);
  const liTotalSpend   = liAds.reduce((s, c) => s + c.spend, 0);
  const liTopCTR       = liAds.length ? Math.max(...liAds.map(c => c.ctr)).toFixed(2) : '—';

  const kpis = [
    { label: 'YT Shorts to Promote', value: String(toPromote.length),   status: toPromote.length > 0 ? 'good' as const : 'neutral' as const },
    { label: 'Best Cost/Sub (YT)',    value: bestCostSub ? `$${bestCostSub.costPerConv.toFixed(2)}` : '—', status: 'good' as const },
    { label: 'YT Earned Subs',        value: String(totalEarnedSubs),    status: 'good' as const },
    { label: 'LI Spend',              value: `$${liTotalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, status: 'neutral' as const },
    { label: 'LI Top Campaign CTR',   value: `${liTopCTR}%`,            status: parseFloat(liTopCTR) >= 1 ? 'good' as const : 'warning' as const },
  ];

  const platformRows = [
    {
      platform: 'YouTube Ads',
      spend: ytAds.reduce((s, a) => s + a.cost, 0),
      impressions: ytAds.reduce((s, a) => s + a.impressions, 0),
      clicks: ytAds.reduce((s, a) => s + a.interactions, 0),
      conversions: ytAds.reduce((s, a) => s + a.conversions, 0),
    },
    {
      platform: 'LinkedIn',
      spend: liAds.reduce((s, c) => s + c.spend, 0),
      impressions: liAds.reduce((s, c) => s + c.impressions, 0),
      clicks: liAds.reduce((s, c) => s + c.clicks, 0),
      conversions: liAds.reduce((s, c) => s + c.conversions, 0),
    },
    {
      platform: 'Meta',
      spend: metaAds.reduce((s, c) => s + c.spend, 0),
      impressions: metaAds.reduce((s, c) => s + c.impressions, 0),
      clicks: metaAds.reduce((s, c) => s + c.clicks, 0),
      conversions: metaAds.reduce((s, c) => s + c.conversions, 0),
    },
    {
      platform: 'TikTok',
      spend: ttAds.reduce((s, c) => s + c.spend, 0),
      impressions: ttAds.reduce((s, c) => s + c.impressions, 0),
      clicks: ttAds.reduce((s, c) => s + c.clicks, 0),
      conversions: ttAds.reduce((s, c) => s + c.conversions, 0),
    },
  ].filter(r => r.spend > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Overview</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-900 border border-gray-800 rounded overflow-hidden text-xs">
            {DATE_RANGES.map(({ label, days }) => (
              <button
                key={label}
                onClick={() => handleRangeChange(days)}
                className={`px-3 py-1.5 transition-colors ${
                  selectedDays === days
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {lastRefresh && <span className="text-gray-500 text-xs hidden sm:block">Refreshed {lastRefresh}</span>}
          <button onClick={() => refresh()} disabled={loading}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded">
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <AISummary summary={summary} />
      <PromoteCallout ads={ytAds} />
      <KPIStrip kpis={kpis} />
      <CrossPlatformTable rows={platformRows} />
    </div>
  );
}
