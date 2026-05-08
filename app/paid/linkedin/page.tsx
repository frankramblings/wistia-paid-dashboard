'use client';
import { useState, useEffect } from 'react';
import ActionableCallout from '@/components/ActionableCallout';
import { scoreAndColor, calcCPM } from '@/lib/platformBenchmarks';
import type { LinkedInCampaign } from '@/lib/types';

const DATE_RANGES = [
  { label: 'YTD',      days: 0 },
  { label: 'Last 30d', days: 30 },
  { label: 'Last 60d', days: 60 },
  { label: 'Last 90d', days: 90 },
];

export default function LinkedInAdsPage() {
  const [campaigns, setCampaigns] = useState<LinkedInCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(0);

  const refresh = async (days = selectedDays) => {
    setLoading(true);
    try {
      const url = days > 0 ? `/api/data/linkedin-ads?days=${days}` : '/api/data/linkedin-ads';
      const res = await fetch(url);
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
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
  const totalClicks      = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const blendedCTR       = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '—';
  const blendedCPM       = calcCPM(totalSpend, totalImpressions);

  const activeCampaigns  = campaigns.filter(c => c.status === 'ACTIVE');
  const lowCTR           = activeCampaigns.filter(c => c.impressions > 5000 && c.ctr < 0.3);
  const bestCTR          = campaigns.length ? campaigns.slice().sort((a, b) => b.ctr - a.ctr)[0] : null;
  const highCPC          = activeCampaigns.filter(c => c.cpc > 15 && c.clicks > 10);

  const calloutRules = [
    {
      condition: lowCTR.length > 0,
      message: `${lowCTR.length} active campaign${lowCTR.length > 1 ? 's' : ''} have CTR below 0.3% — test new creative or narrow the audience.`,
      type: 'warn' as const,
    },
    {
      condition: highCPC.length > 0,
      message: `${highCPC.length} campaign${highCPC.length > 1 ? 's' : ''} exceeding $15 CPC — consider switching to CPM bidding.`,
      type: 'warn' as const,
    },
    {
      condition: !!bestCTR && bestCTR.ctr >= 0.6,
      message: bestCTR ? `"${bestCTR.name}" leads at ${bestCTR.ctr.toFixed(2)}% CTR — replicate its audience and format.` : '',
      type: 'good' as const,
    },
    {
      condition: blendedCPM > 0,
      message: `Blended CPM is $${blendedCPM.toFixed(2)}${blendedCPM > 90 ? ' — above LinkedIn norm, review audience size' : blendedCPM < 50 ? ' — efficient for LinkedIn' : ''}.`,
      type: blendedCPM > 90 ? 'warn' as const : 'info' as const,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">LinkedIn Ads</h1>
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

      <ActionableCallout rules={calloutRules} />

      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Spend',  value: `$${totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
            { label: 'Impressions',  value: totalImpressions.toLocaleString() },
            { label: 'Clicks',       value: totalClicks.toLocaleString() },
            { label: 'Blended CTR',  value: `${blendedCTR}%` },
            { label: 'Conversions',  value: totalConversions.toLocaleString() },
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
              {['Campaign', 'Status', 'Impressions', 'Clicks', 'CTR', 'Spend', 'CPC', 'Conversions'].map(h => (
                <th key={h} className="text-left py-2 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.campaignId} className="border-b border-bone-border hover:bg-bone-alt">
                <td className="py-2 pr-4 text-bone-hi">{c.name}</td>
                <td className="pr-4 whitespace-nowrap">
                  <span className={`px-1.5 py-0.5 text-xs font-medium ${
                    c.status === 'ACTIVE'  ? 'bg-bone-good-bg text-bone-good' :
                    c.status === 'PAUSED'  ? 'bg-bone-warn-bg text-bone-warn' :
                    'bg-bone-info-bg text-bone-mid'
                  }`}>{c.status}</span>
                </td>
                <td className="pr-4 text-bone-mid whitespace-nowrap">{c.impressions.toLocaleString()}</td>
                <td className="pr-4 text-bone-mid whitespace-nowrap">{c.clicks.toLocaleString()}</td>
                <td className={`pr-4 whitespace-nowrap ${scoreAndColor('linkedin', 'ctr', c.ctr)}`}>{c.ctr.toFixed(2)}%</td>
                <td className="pr-4 text-bone-mid whitespace-nowrap">${c.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className={`pr-4 whitespace-nowrap ${scoreAndColor('linkedin', 'cpc', c.cpc)}`}>${c.cpc.toFixed(2)}</td>
                <td className="pr-4 text-bone-mid whitespace-nowrap">{c.conversions}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length === 0 && !loading && (
          <p className="text-bone-mid text-sm py-8 text-center">No data — click ↻</p>
        )}
      </div>
      <p className="text-bone-mid text-xs mt-4">Account: Wistia - Paid Campaigns (504039197)</p>
    </div>
  );
}
