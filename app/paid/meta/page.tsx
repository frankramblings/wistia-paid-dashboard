'use client';
import { useState, useEffect } from 'react';
import ActionableCallout from '@/components/ActionableCallout';
import { scoreAndColor, calcCPM } from '@/lib/platformBenchmarks';
import type { MetaCampaign } from '@/lib/types';

const DATE_RANGES = [
  { label: 'YTD',      days: 0 },
  { label: 'Last 30d', days: 30 },
  { label: 'Last 60d', days: 60 },
  { label: 'Last 90d', days: 90 },
];

export default function MetaAdsPage() {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(0);
  const [notConfigured, setNotConfigured] = useState(false);

  const refresh = async (days = selectedDays) => {
    setLoading(true);
    try {
      const url = days > 0 ? `/api/data/meta-ads?days=${days}` : '/api/data/meta-ads';
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
  const totalClicks      = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const blendedCTR       = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
  const blendedCPM       = calcCPM(totalSpend, totalImpressions);

  const active     = campaigns.filter(c => c.status === 'ACTIVE');
  const lowCTR     = active.filter(c => c.impressions > 5000 && c.ctr < 0.5);
  const highSpend  = active.slice().sort((a, b) => b.spend - a.spend)[0];
  const bestCTR    = campaigns.length ? campaigns.slice().sort((a, b) => b.ctr - a.ctr)[0] : null;
  const engVsTraffic = (() => {
    const eng = campaigns.filter(c => c.objective?.includes('ENGAGEMENT'));
    const tra = campaigns.filter(c => c.objective?.includes('TRAFFIC'));
    if (!eng.length || !tra.length) return null;
    const engCPM = calcCPM(eng.reduce((s,c)=>s+c.spend,0), eng.reduce((s,c)=>s+c.impressions,0));
    const traCPM = calcCPM(tra.reduce((s,c)=>s+c.spend,0), tra.reduce((s,c)=>s+c.impressions,0));
    if (engCPM > 0 && traCPM > 0 && traCPM / engCPM > 1.5) return { ratio: (traCPM / engCPM).toFixed(1) };
    return null;
  })();

  const calloutRules = [
    {
      condition: lowCTR.length > 0,
      message: `${lowCTR.length} active campaign${lowCTR.length > 1 ? 's' : ''} below 0.5% CTR — refresh creative or tighten audience.`,
      type: 'warn' as const,
    },
    {
      condition: !!engVsTraffic,
      message: engVsTraffic ? `Engagement campaigns are ${engVsTraffic.ratio}× cheaper per impression than traffic campaigns — consider reallocating budget.` : '',
      type: 'info' as const,
    },
    {
      condition: !!bestCTR && bestCTR.ctr >= 1.0,
      message: bestCTR ? `"${bestCTR.name}" leads at ${bestCTR.ctr.toFixed(2)}% CTR — strong signal to scale.` : '',
      type: 'good' as const,
    },
    {
      condition: blendedCPM > 0 && blendedCPM < 8,
      message: `Blended CPM of $${blendedCPM.toFixed(2)} is below the $8 Meta benchmark — efficient reach.`,
      type: 'good' as const,
    },
    {
      condition: blendedCPM > 20,
      message: `Blended CPM of $${blendedCPM.toFixed(2)} is above $20 — consider broader audiences or different placements.`,
      type: 'warn' as const,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Meta Ads (FB + IG)</h1>
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
            {loading ? 'Loading…' : '↻'}
          </button>
        </div>
      </div>

      {notConfigured && (
        <div className="mb-6 px-4 py-3 bg-yellow-900/40 border border-yellow-700 rounded text-yellow-300 text-sm">
          Meta Ads not configured. Add META_ACCESS_TOKEN and META_AD_ACCOUNT_ID to environment variables.
        </div>
      )}

      <ActionableCallout rules={calloutRules} />

      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Spend',  value: `$${totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
            { label: 'Impressions',  value: totalImpressions.toLocaleString() },
            { label: 'Blended CPM',  value: `$${blendedCPM.toFixed(2)}` },
            { label: 'Clicks',       value: totalClicks.toLocaleString() },
            { label: 'Blended CTR',  value: `${blendedCTR.toFixed(2)}%` },
            { label: 'Conversions',  value: totalConversions.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 rounded p-3 border border-gray-800">
              <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">{label}</div>
              <div className="text-white text-lg font-semibold">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-500 uppercase border-b border-gray-800">
              {['Campaign', 'Status', 'Objective', 'Impressions', 'CPM', 'Clicks', 'CTR', 'Spend', 'CPC', 'Conversions'].map(h => (
                <th key={h} className="text-left py-2 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => {
              const cpm = calcCPM(c.spend, c.impressions);
              return (
                <tr key={c.campaignId} className="border-b border-gray-900 hover:bg-gray-900/50">
                  <td className="py-2 pr-4 text-white">{c.name}</td>
                  <td className="pr-4 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      c.status === 'ACTIVE'  ? 'bg-green-900/50 text-green-400' :
                      c.status === 'PAUSED'  ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>{c.status}</span>
                  </td>
                  <td className="pr-4 text-gray-400 whitespace-nowrap text-xs">{c.objective?.replace('OUTCOME_', '')}</td>
                  <td className="pr-4 text-gray-300 whitespace-nowrap">{c.impressions.toLocaleString()}</td>
                  <td className={`pr-4 whitespace-nowrap ${scoreAndColor('meta', 'cpm', cpm)}`}>${cpm.toFixed(2)}</td>
                  <td className="pr-4 text-gray-300 whitespace-nowrap">{c.clicks.toLocaleString()}</td>
                  <td className={`pr-4 whitespace-nowrap ${scoreAndColor('meta', 'ctr', c.ctr)}`}>{c.ctr.toFixed(2)}%</td>
                  <td className="pr-4 text-gray-300 whitespace-nowrap">${c.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td className={`pr-4 whitespace-nowrap ${c.cpc > 0 ? scoreAndColor('meta', 'cpc', c.cpc) : 'text-gray-500'}`}>
                    {c.cpc > 0 ? `$${c.cpc.toFixed(2)}` : '—'}
                  </td>
                  <td className="pr-4 text-gray-300 whitespace-nowrap">{c.conversions > 0 ? c.conversions.toLocaleString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {campaigns.length === 0 && !loading && !notConfigured && (
          <p className="text-gray-600 text-sm py-8 text-center">No data — click ↻</p>
        )}
      </div>
    </div>
  );
}
