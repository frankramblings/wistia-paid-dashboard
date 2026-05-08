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
  const totalSpendAll = ads.reduce((s, a) => s + a.cost, 0);
  const poorCPV = ads.filter(a => a.avgCPV > 0.03);
  const strongCompletion = ads.filter(a => a.played100 >= 40);
  const bestSub = ads.filter(a => a.earnedSubs > 0).sort((a, b) => a.costPerConv - b.costPerConv)[0];
  const worstCPV = ads.filter(a => a.avgCPV > 0).sort((a, b) => b.avgCPV - a.avgCPV)[0];

  const calloutRules = [
    {
      condition: poorCPV.length > 0,
      message: `${poorCPV.length} ad${poorCPV.length > 1 ? 's' : ''} have CPV above $0.03 benchmark — review targeting or creative.`,
      type: 'warn' as const,
    },
    {
      condition: strongCompletion.length > 0,
      message: `${strongCompletion.length} ad${strongCompletion.length > 1 ? 's' : ''} hitting 40%+ completion rate — strong signals for scaling.`,
      type: 'good' as const,
    },
    {
      condition: !!bestSub,
      message: bestSub ? `Best cost-per-sub is $${bestSub.costPerConv.toFixed(2)} from "${bestSub.adName}" — prioritise this format.` : '',
      type: 'good' as const,
    },
    {
      condition: !!worstCPV && worstCPV.avgCPV > 0.05,
      message: worstCPV ? `"${worstCPV.adName}" has the highest CPV at $${worstCPV.avgCPV.toFixed(3)} — consider pausing.` : '',
      type: 'warn' as const,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">YT Ads — A La Carte (Paid)</h1>
        <button onClick={refresh} disabled={loading}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded">
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      <ActionableCallout rules={calloutRules} />
      <PromoteCallout ads={ads} />

      <div className="overflow-x-auto mb-8">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-500 uppercase border-b border-gray-800">
              {['Ad / Creator','Format','Completion','Int. Rate','CPV','Earned Subs','Cost/Sub','Status'].map(h => (
                <th key={h} className="text-left py-2 pr-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.adName} className="border-b border-gray-900 hover:bg-gray-900/50">
                <td className="py-2 pr-3">
                  <div className="text-white font-medium">{ad.adName}</div>
                  <div className="text-gray-500">{ad.creator}</div>
                </td>
                <td className="pr-3 text-gray-400">{ad.format}</td>
                <td className={`pr-3 ${scoreAndColor('youtube', 'played100', ad.played100)}`}>
                  {ad.played100.toFixed(1)}%
                </td>
                <td className={`pr-3 ${scoreAndColor('youtube', 'interactionRate', ad.interactionRate)}`}>
                  {ad.interactionRate.toFixed(1)}%
                </td>
                <td className={`pr-3 ${scoreAndColor('youtube', 'avgCPV', ad.avgCPV)}`}>${ad.avgCPV.toFixed(3)}</td>
                <td className="pr-3 text-gray-300">{ad.earnedSubs || '—'}</td>
                <td className="pr-3 text-gray-300">
                  {ad.earnedSubs > 0 ? `$${ad.costPerConv.toFixed(2)}` : '—'}
                </td>
                <td>{ad.evaluation && <BenchmarkBadge status={ad.evaluation.status} signals={ad.evaluation.signals} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Creator Comparison</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {creators.map(creator => {
          const creatorAds = ads.filter(a => a.creator === creator);
          const totalSubs = creatorAds.reduce((s, a) => s + a.earnedSubs, 0);
          const bestCost  = creatorAds.filter(a => a.earnedSubs > 0).sort((a,b) => a.costPerConv - b.costPerConv)[0];
          const totalSpend = creatorAds.reduce((s, a) => s + a.cost, 0);
          return (
            <div key={creator} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="font-bold text-white mb-3">{creator}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Total Spend</span><span>${totalSpend.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Earned Subs</span><span className="text-green-400">{totalSubs}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Best Cost/Sub</span><span className="text-green-400">{bestCost ? `$${bestCost.costPerConv.toFixed(2)}` : '—'}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
