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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Benchmarks</h1>
          <p className="text-gray-500 text-sm mt-1">Edit thresholds — changes affect all status badges across the dashboard</p>
        </div>
        <button onClick={save}
          className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm rounded">
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
              <th className="text-left p-3">Metric</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Min (Good)</th>
              <th className="p-3">Max (Strong)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-gray-800 last:border-0">
                <td className="p-3 text-gray-300">{row.label}</td>
                <td className="p-3 text-gray-500 text-center">{row.unit}</td>
                <td className="p-3">
                  <input
                    type="number" step="0.1" value={row.min ?? ''}
                    onChange={e => update(row.id, 'min', e.target.value)}
                    className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm text-center"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number" step="0.1" value={row.max ?? ''}
                    onChange={e => update(row.id, 'max', e.target.value)}
                    className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm text-center"
                    placeholder="—"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-gray-600 text-xs mt-3">Changes are saved to localStorage and persist across sessions. To reset, clear your browser data for this site.</p>
    </div>
  );
}
