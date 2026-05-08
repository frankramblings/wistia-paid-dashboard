'use client';
import { useState, useEffect } from 'react';
import ActionableCallout from '@/components/ActionableCallout';
import { scoreAndColor, calcCPM } from '@/lib/platformBenchmarks';
import type { TikTokAdCampaign } from '@/lib/types';

const DATE_RANGES = [
  { label: 'YTD',      days: 0 },
  { label: 'Last 30d', days: 30 },
  { label: 'Last 60d', days: 60 },
  { label: 'Last 90d', days: 90 },
];

export default function TikTokAdsPage() {
  const [campaigns, setCampaigns] = useState<TikTokAdCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(0);
  const [notConfigured, setNotConfigured] = useState(false);

  const refresh = async (days = selectedDays) => {
    setLoading(true);
    try {
      const url = days > 0 ? `/api/data/tiktok-ads?days=${days}` : '/api/data/tiktok-ads';
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'not_configured') {
        setNotConfigured(true);
        setCampaigns([]);
      } else {
        setNotConfigured(false);
        setCampaigns(data.campaigns ?? []);
      }
      setLastRefresh(new Date().toLocaleString());
    } finally { setLoading(false); }
  };

  const handleRangeChange = (days: number) => {
    setSelectedDays(days);
    refresh(days);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(0); }, []);

  const totalSpend       = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalVideoViews  = campaigns.reduce((s, c) => s + c.videoViews, 0);
  const blendedViewRate  = totalImpressions > 0 ? (totalVideoViews / totalImpressions * 100) : 0;
  const blendedCPM       = calcCPM(totalSpend, totalImpressions);
  const blendedCPV       = totalVideoViews > 0 ? totalSpend / totalVideoViews : 0;

  const lowViewRate    = campaigns.filter(c => c.impressions > 5000 && (c.videoViews / c.impressions * 100) < 15);
  const bestViewRate   = campaigns.length ? campaigns.slice().sort((a, b) => {
    const ra = a.impressions > 0 ? a.videoViews / a.impressions : 0;
    const rb = b.impressions > 0 ? b.videoViews / b.impressions : 0;
    return rb - ra;
  })[0] : null;
  const bestViewRatePct = bestViewRate && bestViewRate.impressions > 0
    ? (bestViewRate.videoViews / bestViewRate.impressions * 100)
    : 0;
  const highSpendLowViews = campaigns.filter(c => {
    const vr = c.impressions > 0 ? c.videoViews / c.impressions * 100 : 0;
    return c.spend > totalSpend * 0.2 && vr < 10;
  });

  const calloutRules = [
    {
      condition: highSpendLowViews.length > 0,
      message: `${highSpendLowViews.map(c => `"${c.name}"`).join(', ')} ${highSpendLowViews.length > 1 ? 'are' : 'is'} taking 20%+ of budget with <10% view rate — strong candidate${highSpendLowViews.length > 1 ? 's' : ''} to pause.`,
      type: 'warn' as const,
    },
    {
      condition: lowViewRate.length > 0 && highSpendLowViews.length === 0,
      message: `${lowViewRate.length} campaign${lowViewRate.length > 1 ? 's' : ''} below 15% view rate — hook isn't landing, test new first 3 seconds.`,
      type: 'warn' as const,
    },
    {
      condition: !!bestViewRate && bestViewRatePct >= 30,
      message: bestViewRate ? `"${bestViewRate.name}" hits ${bestViewRatePct.toFixed(0)}% view rate — the strongest hook in the account, double down.` : '',
      type: 'good' as const,
    },
    {
      condition: blendedCPV > 0 && blendedCPV < 0.02,
      message: `Cost per video view is $${blendedCPV.toFixed(3)} — well below the $0.02 benchmark. Efficient awareness spend.`,
      type: 'good' as const,
    },
    {
      condition: blendedCPV > 0.06,
      message: `Cost per video view is $${blendedCPV.toFixed(3)}, above the $0.06 ceiling. Check creative relevance scores.`,
      type: 'warn' as const,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">TikTok Ads</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-bone-alt border border-bone-border rounded overflow-hidden text-xs">
            {DATE_RANGES.map(({ label, days }) => (
              <button
                key={label}
                onClick={() => handleRangeChange(days)}
                className={`px-3 py-1.5 transition-colors ${
                  selectedDays === days
                    ? 'bg-bone-hi text-bone-bg'
                    : 'text-bone-mid hover:text-bone-hi hover:bg-bone-border/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {lastRefresh && <span className="text-bone-mid text-xs hidden sm:block">Refreshed {lastRefresh}</span>}
          <button onClick={() => refresh()} disabled={loading}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded">
            {loading ? 'Loading…' : '↻'}
          </button>
        </div>
      </div>

      {notConfigured && (
        <div className="mb-6 px-4 py-3 bg-bone-warn-bg border border-bone-warn/50 text-bone-warn text-sm">
          TikTok Ads not configured. Add TIKTOK_ACCESS_TOKEN and TIKTOK_ADVERTISER_ID to environment variables.
        </div>
      )}

      <ActionableCallout rules={calloutRules} />

      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Spend',  value: `$${totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
            { label: 'Video Views',  value: totalVideoViews.toLocaleString() },
            { label: 'View Rate',    value: `${blendedViewRate.toFixed(1)}%` },
            { label: 'Cost / View',  value: blendedCPV > 0 ? `$${blendedCPV.toFixed(3)}` : '—' },
            { label: 'Blended CPM',  value: `$${blendedCPM.toFixed(2)}` },
            { label: 'Impressions',  value: totalImpressions.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bone-alt rounded p-3 border border-bone-border">
              <div className="text-bone-mid text-[10px] uppercase tracking-wide mb-1">{label}</div>
              <div className="text-bone-hi font-bebas text-3xl leading-none">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-bone-mid uppercase border-b border-bone-border">
              {['Campaign', 'Video Views', 'View Rate', 'Cost/View', 'CPM', 'Spend', 'CTR', 'CPC'].map(h => (
                <th key={h} className="text-left py-2 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => {
              const viewRate = c.impressions > 0 ? (c.videoViews / c.impressions * 100) : 0;
              const cpv      = c.videoViews > 0 ? c.spend / c.videoViews : 0;
              const cpm      = calcCPM(c.spend, c.impressions);
              return (
                <tr key={c.campaignId} className="border-b border-bone-border hover:bg-bone-alt">
                  <td className="py-2 pr-4 text-bone-hi">{c.name}</td>
                  <td className="pr-4 text-bone-mid whitespace-nowrap">{c.videoViews.toLocaleString()}</td>
                  <td className={`pr-4 whitespace-nowrap ${scoreAndColor('tiktok', 'viewRate', viewRate)}`}>
                    {viewRate.toFixed(1)}%
                  </td>
                  <td className={`pr-4 whitespace-nowrap ${cpv > 0 ? scoreAndColor('tiktok', 'cpv', cpv) : 'text-bone-mid'}`}>
                    {cpv > 0 ? `$${cpv.toFixed(3)}` : '—'}
                  </td>
                  <td className={`pr-4 whitespace-nowrap ${scoreAndColor('tiktok', 'cpm', cpm)}`}>${cpm.toFixed(2)}</td>
                  <td className="pr-4 text-bone-mid whitespace-nowrap">${c.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td className={`pr-4 whitespace-nowrap ${scoreAndColor('tiktok', 'ctr', c.ctr)}`}>{c.ctr.toFixed(2)}%</td>
                  <td className={`pr-4 whitespace-nowrap ${c.cpc > 0 ? scoreAndColor('tiktok', 'cpc', c.cpc) : 'text-bone-mid'}`}>
                    {c.cpc > 0 ? `$${c.cpc.toFixed(2)}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {campaigns.length === 0 && !loading && !notConfigured && (
          <p className="text-bone-mid text-sm py-8 text-center">No data — click ↻</p>
        )}
      </div>
    </div>
  );
}
