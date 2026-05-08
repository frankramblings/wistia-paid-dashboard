'use client';
import { useState, useEffect } from 'react';
import BenchmarkBadge from '@/components/BenchmarkBadge';
import PromoteCallout from '@/components/PromoteCallout';
import ActionableCallout from '@/components/ActionableCallout';
import { scoreAndColor } from '@/lib/platformBenchmarks';
import type { YouTubeAdRow } from '@/lib/types';

export default function PaidPage() {
  const [ads, setAds] = useState<YouTubeAdRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data/youtube-ads');
      const data = await res.json();
      setAds(data.ads ?? []);
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, []);

  const creators = Array.from(new Set(ads.map(a => a.creator)));
  const poorCPV = ads.filter(a => a.avgCPV > 0.03);
  const strongCompletion = ads.filter(a => a.played100 >= 40);
  const bestSub = ads.filter(a => a.earnedSubs > 0).sort((a, b) => a.costPerConv - b.costPerConv)[0];
  const worstCPV = ads.filter(a => a.avgCPV > 0).sort((a, b) => b.avgCPV - a.avgCPV)[0];

  const calloutRules = [
    { condition: poorCPV.length > 0, message: `${poorCPV.length} ad${poorCPV.length > 1 ? 's' : ''} have CPV above $0.03 benchmark — review targeting or creative.`, type: 'warn' as const },
    { condition: strongCompletion.length > 0, message: `${strongCompletion.length} ad${strongCompletion.length > 1 ? 's' : ''} hitting 40%+ completion rate — strong signals for scaling.`, type: 'good' as const },
    { condition: !!bestSub, message: bestSub ? `Best cost-per-sub is $${bestSub.costPerConv.toFixed(2)} from "${bestSub.adName}" — prioritise this format.` : '', type: 'good' as const },
    { condition: !!worstCPV && worstCPV.avgCPV > 0.05, message: worstCPV ? `"${worstCPV.adName}" has the highest CPV at $${worstCPV.avgCPV.toFixed(3)} — consider pausing.` : '', type: 'warn' as const },
  ];

  return (
    <div>
      <div className="mb-2">
        <h1 className="font-bold text-w-hi">YouTube Ads</h1>
        <button onClick={refresh} disabled={loading}
          className="px-4 py-1.5 bg-w-hi hover:bg-[#0f0f1a] disabled:opacity-50 text-white text-xs font-medium rounded-full transition-colors">
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      <ActionableCallout rules={calloutRules} />
      <PromoteCallout ads={ads} />

      <div className="bg-white rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#ebebed]">
                {['Ad / Creator', 'Format', 'Completion', 'Int. Rate', 'CPV', 'Earned Subs', 'Cost/Sub', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-walsheim text-sm font-semibold text-w-hi whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, i) => (
                <tr key={ad.adName} className={`${i % 2 === 0 ? 'bg-[#f9f9fb]' : 'bg-white'} border-b border-[#ebebed] last:border-0 hover:bg-[#eeeef0] transition-colors`}>
                  <td className="py-4 px-4">
                    <div className="text-w-hi font-medium">{ad.adName}</div>
                    <div className="text-w-mid text-xs">{ad.creator}</div>
                  </td>
                  <td className="py-4 px-4 text-w-hi whitespace-nowrap">{ad.format}</td>
                  <td className={`py-4 px-4 whitespace-nowrap ${scoreAndColor('youtube', 'played100', ad.played100)}`}>{ad.played100.toFixed(1)}%</td>
                  <td className={`py-4 px-4 whitespace-nowrap ${scoreAndColor('youtube', 'interactionRate', ad.interactionRate)}`}>{ad.interactionRate.toFixed(1)}%</td>
                  <td className={`py-4 px-4 whitespace-nowrap ${scoreAndColor('youtube', 'avgCPV', ad.avgCPV)}`}>${ad.avgCPV.toFixed(3)}</td>
                  <td className="py-4 px-4 text-w-hi whitespace-nowrap tabular-nums">{ad.earnedSubs || '—'}</td>
                  <td className="py-4 px-4 text-w-hi whitespace-nowrap tabular-nums">{ad.earnedSubs > 0 ? `$${ad.costPerConv.toFixed(2)}` : '—'}</td>
                  <td className="py-4 px-4">{ad.evaluation && <BenchmarkBadge status={ad.evaluation.status} signals={ad.evaluation.signals} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ads.length === 0 && !loading && (
            <p className="text-w-mid text-sm py-8 text-center">No data — click Refresh</p>
          )}
        </div>
      </div>

      <h2 className="font-walsheim text-sm font-semibold text-w-hi mb-3">Creator Comparison</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {creators.map(creator => {
          const creatorAds = ads.filter(a => a.creator === creator);
          const totalSubs  = creatorAds.reduce((s, a) => s + a.earnedSubs, 0);
          const bestCost   = creatorAds.filter(a => a.earnedSubs > 0).sort((a,b) => a.costPerConv - b.costPerConv)[0];
          const totalSpend = creatorAds.reduce((s, a) => s + a.cost, 0);
          return (
            <div key={creator} className="bg-w-surface rounded-md p-5 border border-w-border shadow-card">
              <div className="font-walsheim font-semibold text-w-hi mb-3">{creator}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-w-mid">Total Spend</span><span className="text-w-hi font-medium tabular-nums">${totalSpend.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-w-mid">Earned Subs</span><span className="text-w-good font-medium tabular-nums">{totalSubs}</span></div>
                <div className="flex justify-between"><span className="text-w-mid">Best Cost/Sub</span><span className="text-w-good font-medium tabular-nums">{bestCost ? `$${bestCost.costPerConv.toFixed(2)}` : '—'}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
