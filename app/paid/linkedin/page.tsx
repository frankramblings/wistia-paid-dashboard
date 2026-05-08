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

  const handleRangeChange = (days: number) => { setSelectedDays(days); refresh(days); };
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
    { condition: lowCTR.length > 0, message: `${lowCTR.length} active campaign${lowCTR.length > 1 ? 's' : ''} have CTR below 0.3% — test new creative or narrow the audience.`, type: 'warn' as const },
    { condition: highCPC.length > 0, message: `${highCPC.length} campaign${highCPC.length > 1 ? 's' : ''} exceeding $15 CPC — consider switching to CPM bidding.`, type: 'warn' as const },
    { condition: !!bestCTR && bestCTR.ctr >= 0.6, message: bestCTR ? `"${bestCTR.name}" leads at ${bestCTR.ctr.toFixed(2)}% CTR — replicate its audience and format.` : '', type: 'good' as const },
    { condition: blendedCPM > 0, message: `Blended CPM is $${blendedCPM.toFixed(2)}${blendedCPM > 90 ? ' — above LinkedIn norm, review audience size' : blendedCPM < 50 ? ' — efficient for LinkedIn' : ''}.`, type: blendedCPM > 90 ? 'warn' as const : 'info' as const },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-w-hi">LinkedIn Ads</h1>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex gap-1">
            {DATE_RANGES.map(({ label, days }) => (
              <button key={label} onClick={() => handleRangeChange(days)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedDays === days ? 'bg-w-blue text-white' : 'bg-w-surface border border-w-border text-w-mid hover:text-w-hi'
                }`}>
                {label}
              </button>
            ))}
          </div>
          {lastRefresh && <span className="text-w-mid text-xs hidden sm:block">{lastRefresh}</span>}
          <button onClick={() => refresh()} disabled={loading}
            className="px-4 py-1.5 bg-w-blue hover:bg-[#1f38c5] disabled:opacity-50 text-white text-xs font-medium rounded-full transition-colors">
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
            <div key={label} className="bg-w-surface rounded-lg p-4 border border-w-border shadow-card">
              <div className="text-w-mid text-xs font-medium mb-2">{label}</div>
              <div className="text-w-hi font-bebas text-3xl leading-none">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-w-surface border border-w-border rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-w-border">
                {['Campaign', 'Status', 'Impressions', 'Clicks', 'CTR', 'Spend', 'CPC', 'Conversions'].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-xs font-medium text-w-mid whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.campaignId} className="border-b border-w-border last:border-0 hover:bg-w-canvas">
                  <td className="py-3 px-5 text-w-hi">{c.name}</td>
                  <td className="px-5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      c.status === 'ACTIVE' ? 'bg-w-good-bg text-w-good' :
                      c.status === 'PAUSED' ? 'bg-w-warn-bg text-w-warn' :
                      'bg-w-border text-w-mid'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-5 text-w-mid whitespace-nowrap tabular-nums">{c.impressions.toLocaleString()}</td>
                  <td className="px-5 text-w-mid whitespace-nowrap tabular-nums">{c.clicks.toLocaleString()}</td>
                  <td className={`px-5 whitespace-nowrap tabular-nums ${scoreAndColor('linkedin', 'ctr', c.ctr)}`}>{c.ctr.toFixed(2)}%</td>
                  <td className="px-5 text-w-mid whitespace-nowrap tabular-nums">${c.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td className={`px-5 whitespace-nowrap tabular-nums ${scoreAndColor('linkedin', 'cpc', c.cpc)}`}>${c.cpc.toFixed(2)}</td>
                  <td className="px-5 text-w-mid whitespace-nowrap tabular-nums">{c.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && !loading && (
            <p className="text-w-mid text-sm py-8 text-center">No data — click ↻</p>
          )}
        </div>
      </div>
      <p className="text-w-mid text-xs mt-3">Account: Wistia - Paid Campaigns (504039197)</p>
    </div>
  );
}
