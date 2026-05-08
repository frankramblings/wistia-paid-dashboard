'use client';
import { useState } from 'react';
import { BENCHMARKS } from '@/lib/benchmarks';

const INITIAL_ROWS = [
  { id: 'ytLongForm.ctr',               label: 'YT Long-Form CTR',                              unit: '%',   min: BENCHMARKS.ytLongForm.ctr.min,                max: BENCHMARKS.ytLongForm.ctr.max },
  { id: 'ytLongForm.avgViewPercentage', label: 'YT Long-Form Avg % Watched',                   unit: '%',   min: BENCHMARKS.ytLongForm.avgViewPercentage.min,   max: BENCHMARKS.ytLongForm.avgViewPercentage.max },
  { id: 'ytLongForm.watchTimeMinutes',  label: 'YT Long-Form AVD (minutes)',                   unit: 'min', min: BENCHMARKS.ytLongForm.watchTimeMinutes.min,     max: BENCHMARKS.ytLongForm.watchTimeMinutes.max },
  { id: 'ytShorts.avgViewPercentage',   label: 'YT Shorts Avg % Watched',                      unit: '%',   min: BENCHMARKS.ytShorts.avgViewPercentage.min,      max: BENCHMARKS.ytShorts.avgViewPercentage.max },
  { id: 'ytShorts.shortsVR',            label: 'YT Shorts Viewed vs Swiped',                   unit: '%',   min: BENCHMARKS.ytShorts.shortsVR.min,               max: BENCHMARKS.ytShorts.shortsVR.max },
  { id: 'ytAdsShorts.completionRate',   label: 'YT Ads Shorts — Completion (Promote Threshold)', unit: '%', min: BENCHMARKS.ytAdsShorts.completionRate.min,      max: undefined },
  { id: 'ytAdsShorts.interactionRate',  label: 'YT Ads Shorts — Interaction (Promote Threshold)', unit: '%',min: BENCHMARKS.ytAdsShorts.interactionRate.min,     max: undefined },
  { id: 'tiktok.engagementRate',        label: 'TikTok Engagement Rate',                       unit: '%',   min: BENCHMARKS.tiktok.engagementRate.min,           max: BENCHMARKS.tiktok.engagementRate.max },
  { id: 'tiktok.profileViewRate',       label: 'TikTok Profile View Rate',                     unit: '%',   min: BENCHMARKS.tiktok.profileViewRate.min,          max: BENCHMARKS.tiktok.profileViewRate.max },
];

export default function BenchmarksPage() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [saved, setSaved] = useState(false);

  const update = (id: string, field: 'min' | 'max', value: string) => {
    setRows(r => r.map(row =>
      row.id === id ? { ...row, [field]: value === '' ? undefined : parseFloat(value) } : row
    ));
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem('wistia_benchmarks', JSON.stringify(rows));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-w-hi">Benchmarks</h1>
          <p className="text-w-mid text-sm mt-0.5">Edit thresholds — changes affect all status badges across the dashboard</p>
        </div>
        <button onClick={save}
          className={`px-4 py-1.5 text-white text-xs font-medium rounded-full transition-colors ${
            saved ? 'bg-w-good' : 'bg-w-blue hover:bg-[#1f38c5]'
          }`}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <div className="bg-w-surface border border-w-border rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-w-border">
              <th className="text-left py-3 px-5 text-xs font-medium text-w-mid">Metric</th>
              <th className="py-3 px-5 text-xs font-medium text-w-mid text-center">Unit</th>
              <th className="py-3 px-5 text-xs font-medium text-w-mid text-center">Min (Good)</th>
              <th className="py-3 px-5 text-xs font-medium text-w-mid text-center">Max (Strong)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-w-border last:border-0 hover:bg-w-canvas">
                <td className="py-3 px-5 text-w-hi">{row.label}</td>
                <td className="px-5 text-w-mid text-center">{row.unit}</td>
                <td className="px-5 text-center">
                  <input
                    type="number" step="0.1" value={row.min ?? ''}
                    onChange={e => update(row.id, 'min', e.target.value)}
                    className="w-20 bg-w-canvas border border-w-border rounded px-2 py-1 text-w-hi text-sm text-center focus:outline-none focus:border-w-blue"
                  />
                </td>
                <td className="px-5 text-center">
                  <input
                    type="number" step="0.1" value={row.max ?? ''}
                    onChange={e => update(row.id, 'max', e.target.value)}
                    className="w-20 bg-w-canvas border border-w-border rounded px-2 py-1 text-w-hi text-sm text-center focus:outline-none focus:border-w-blue"
                    placeholder="—"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-w-mid text-xs mt-3">Changes are saved to localStorage and persist across sessions. To reset, clear your browser data for this site.</p>
    </div>
  );
}
