'use client';
import { useState, useEffect } from 'react';
import AISummary from '@/components/AISummary';
import CrossPlatformTable from '@/components/CrossPlatformTable';
import { calcCPM } from '@/lib/platformBenchmarks';
import type { YouTubeAdRow, LinkedInCampaign, MetaCampaign, TikTokAdCampaign, DashboardSummary } from '@/lib/types';

const DATE_RANGES = [
  { label: 'YTD',      days: 0 },
  { label: 'Last 30d', days: 30 },
  { label: 'Last 60d', days: 60 },
  { label: 'Last 90d', days: 90 },
];

interface KPI {
  label: string;
  value: string;
  status: 'good' | 'warn' | 'poor' | 'neutral';
  channel: string;
  channelColor: string;
}

function KPICard({ label, value, status, channel, channelColor }: KPI) {
  const valClass = {
    good:    'text-w-good',
    warn:    'text-w-warn',
    poor:    'text-w-poor',
    neutral: 'text-w-hi',
  }[status];

  return (
    <div className="bg-w-surface border border-w-border rounded-lg p-4 shadow-card">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: channelColor }} />
        <span className="text-xs font-medium text-w-mid">{channel}</span>
      </div>
      <div className={`text-xl font-medium ${valClass}`}>{value}</div>
      <div className="text-w-mid text-xs mt-1.5 truncate">{label}</div>
    </div>
  );
}

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
      const ads: YouTubeAdRow[]    = adsRes.ads ?? [];
      const li: LinkedInCampaign[] = liRes.campaigns ?? [];
      const meta: MetaCampaign[]   = metaRes.campaigns ?? [];
      const tt: TikTokAdCampaign[] = ttRes.campaigns ?? [];
      setYtAds(ads); setLiAds(li); setMetaAds(meta); setTtAds(tt);

      const summaryRes = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeAds: ads, linkedinAds: li, metaAds: meta, tiktokAds: tt,
          dateRange: DATE_RANGES.find(r => r.days === days)?.label ?? 'Custom',
        }),
      });
      setSummary(await summaryRes.json());
      setLastRefresh(new Date().toLocaleString());
    } finally { setLoading(false); }
  };

  const handleRangeChange = (days: number) => { setSelectedDays(days); refresh(days); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(selectedDays); }, []);

  // ── YouTube ──────────────────────────────────────────
  const ytSpend      = ytAds.reduce((s, a) => s + a.cost, 0);
  const ytEarnedSubs = ytAds.reduce((s, a) => s + a.earnedSubs, 0);
  const bestCostSub  = ytAds.filter(a => a.earnedSubs > 0).sort((a, b) => a.costPerConv - b.costPerConv)[0];

  // ── LinkedIn ─────────────────────────────────────────
  const liSpend = liAds.reduce((s, c) => s + c.spend, 0);
  const liImp   = liAds.reduce((s, c) => s + c.impressions, 0);
  const liClk   = liAds.reduce((s, c) => s + c.clicks, 0);
  const liCTR   = liImp > 0 ? (liClk / liImp * 100) : 0;
  const liCPM   = calcCPM(liSpend, liImp);

  // ── Meta ─────────────────────────────────────────────
  const metaSpend = metaAds.reduce((s, c) => s + c.spend, 0);
  const metaImp   = metaAds.reduce((s, c) => s + c.impressions, 0);
  const metaClk   = metaAds.reduce((s, c) => s + c.clicks, 0);
  const metaCTR   = metaImp > 0 ? (metaClk / metaImp * 100) : 0;
  const metaCPM   = calcCPM(metaSpend, metaImp);

  // ── TikTok ───────────────────────────────────────────
  const ttSpend    = ttAds.reduce((s, c) => s + c.spend, 0);
  const ttImp      = ttAds.reduce((s, c) => s + c.impressions, 0);
  const ttViews    = ttAds.reduce((s, c) => s + c.videoViews, 0);
  const ttViewRate = ttImp > 0 ? (ttViews / ttImp * 100) : 0;
  const ttCPV      = ttViews > 0 ? ttSpend / ttViews : 0;

  const totalSpend = ytSpend + liSpend + metaSpend + ttSpend;

  const kpis: KPI[] = [
    ...(ytSpend > 0 ? [
      { label: 'Earned Subs', value: String(ytEarnedSubs), channel: 'YouTube', channelColor: '#ff4444', status: (ytEarnedSubs > 0 ? 'good' : 'neutral') as KPI['status'] },
      { label: 'Best Cost / Sub', value: bestCostSub ? `$${bestCostSub.costPerConv.toFixed(2)}` : '—', channel: 'YouTube', channelColor: '#ff4444', status: (bestCostSub ? (bestCostSub.costPerConv < 5 ? 'good' : bestCostSub.costPerConv < 10 ? 'warn' : 'poor') : 'neutral') as KPI['status'] },
    ] : []),
    ...(liSpend > 0 ? [
      { label: 'Blended CTR', value: `${liCTR.toFixed(2)}%`, channel: 'LinkedIn', channelColor: '#4d9fd4', status: (liCTR >= 0.6 ? 'good' : liCTR >= 0.3 ? 'warn' : 'poor') as KPI['status'] },
      { label: 'CPM', value: `$${liCPM.toFixed(2)}`, channel: 'LinkedIn', channelColor: '#4d9fd4', status: (liCPM <= 50 ? 'good' : liCPM <= 90 ? 'warn' : 'poor') as KPI['status'] },
    ] : []),
    ...(metaSpend > 0 ? [
      { label: 'Blended CTR', value: `${metaCTR.toFixed(2)}%`, channel: 'Meta', channelColor: '#4d8ef0', status: (metaCTR >= 1.0 ? 'good' : metaCTR >= 0.5 ? 'warn' : 'poor') as KPI['status'] },
      { label: 'Blended CPM', value: `$${metaCPM.toFixed(2)}`, channel: 'Meta', channelColor: '#4d8ef0', status: (metaCPM <= 8 ? 'good' : metaCPM <= 20 ? 'warn' : 'poor') as KPI['status'] },
    ] : []),
    ...(ttSpend > 0 ? [
      { label: 'View Rate', value: `${ttViewRate.toFixed(0)}%`, channel: 'TikTok', channelColor: '#69c9d0', status: (ttViewRate >= 30 ? 'good' : ttViewRate >= 15 ? 'warn' : 'poor') as KPI['status'] },
      { label: 'Cost / View', value: ttCPV > 0 ? `$${ttCPV.toFixed(3)}` : '—', channel: 'TikTok', channelColor: '#69c9d0', status: (ttCPV > 0 ? (ttCPV <= 0.02 ? 'good' : ttCPV <= 0.06 ? 'warn' : 'poor') : 'neutral') as KPI['status'] },
    ] : []),
  ];

  const platformRows = [
    { platform: 'YouTube Ads', spend: ytSpend, impressions: ytAds.reduce((s,a)=>s+a.impressions,0), clicks: ytAds.reduce((s,a)=>s+a.interactions,0), conversions: ytAds.reduce((s,a)=>s+a.conversions,0) },
    { platform: 'LinkedIn',    spend: liSpend, impressions: liImp, clicks: liClk, conversions: liAds.reduce((s,c)=>s+c.conversions,0) },
    { platform: 'Meta',        spend: metaSpend, impressions: metaImp, clicks: metaClk, conversions: metaAds.reduce((s,c)=>s+c.conversions,0) },
    { platform: 'TikTok',      spend: ttSpend, impressions: ttImp, clicks: ttAds.reduce((s,c)=>s+c.clicks,0), conversions: 0 },
  ].filter(r => r.spend > 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-w-hi">Overview</h1>
          {totalSpend > 0 && (
            <p className="text-w-mid text-sm mt-0.5">
              ${totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })} total spend
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex gap-1">
            {DATE_RANGES.map(({ label, days }) => (
              <button key={label} onClick={() => handleRangeChange(days)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedDays === days
                    ? 'bg-w-blue text-white'
                    : 'bg-w-surface border border-w-border text-w-mid hover:text-w-hi'
                }`}>
                {label}
              </button>
            ))}
          </div>
          {lastRefresh && <span className="text-w-mid text-xs hidden sm:block">{lastRefresh}</span>}
          <button onClick={() => refresh()} disabled={loading}
            className="px-4 py-1.5 bg-w-blue hover:bg-[#1f38c5] disabled:opacity-50 text-white text-xs font-medium rounded-full transition-colors">
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <AISummary summary={summary} loading={loading} />

      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {kpis.map((kpi, i) => <KPICard key={i} {...kpi} />)}
        </div>
      )}

      <CrossPlatformTable rows={platformRows} />
    </div>
  );
}
