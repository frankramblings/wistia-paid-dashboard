'use client';
import { useState, useEffect } from 'react';
import type { YouTubeOrganicVideo } from '@/lib/types';

type HookType = 'question' | 'contrarian' | 'story' | 'stakes-led' | 'other';
type TopicType = 'ai' | 'marketing-shift' | 'founder-story' | 'growth' | 'other';

interface TaggedAsset {
  videoId: string;
  title: string;
  format: string;
  primaryMetric: number;
  metricLabel: string;
  hook: HookType | '';
  topic: TopicType | '';
}

const HOOK_OPTIONS: HookType[] = ['question','contrarian','story','stakes-led','other'];
const TOPIC_OPTIONS: TopicType[] = ['ai','marketing-shift','founder-story','growth','other'];

export default function LearningLoopsPage() {
  const [assets, setAssets] = useState<TaggedAsset[]>([]);
  const [pattern, setPattern] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data/youtube-organic');
      const data = await res.json();
      const stored = JSON.parse(localStorage.getItem('wistia_tags') ?? '{}');
      const tagged: TaggedAsset[] = (data.videos ?? [])
        .sort((a: YouTubeOrganicVideo, b: YouTubeOrganicVideo) => {
          const aMetric = a.format === 'short' ? a.avgViewPercentage : a.ctr;
          const bMetric = b.format === 'short' ? b.avgViewPercentage : b.ctr;
          return bMetric - aMetric;
        })
        .slice(0, 20)
        .map((v: YouTubeOrganicVideo) => ({
          videoId: v.videoId,
          title: v.title,
          format: v.format,
          primaryMetric: v.format === 'short' ? v.avgViewPercentage : v.ctr,
          metricLabel: v.format === 'short' ? '% watched' : 'CTR',
          hook:  stored[v.videoId]?.hook  ?? '',
          topic: stored[v.videoId]?.topic ?? '',
        }));
      setAssets(tagged);
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, []);

  const updateTag = (videoId: string, field: 'hook' | 'topic', value: string) => {
    setAssets(prev => prev.map(a => a.videoId === videoId ? { ...a, [field]: value } : a));
    const stored = JSON.parse(localStorage.getItem('wistia_tags') ?? '{}');
    stored[videoId] = { ...stored[videoId], [field]: value };
    localStorage.setItem('wistia_tags', JSON.stringify(stored));
  };

  const analyzePatterns = async () => {
    setAnalyzing(true);
    try {
      const tagged = assets.filter(a => a.hook || a.topic);
      const top5 = assets.slice(0, 5);
      const prompt = `Top 5 performing assets:\n${top5.map(a =>
        `- "${a.title}" (${a.primaryMetric.toFixed(1)}${a.metricLabel}) hook:${a.hook||'untagged'} topic:${a.topic||'untagged'}`
      ).join('\n')}\n\nAll tagged: ${tagged.length} assets.\nIn 2-3 sentences, what patterns do you see across the top performers?`;

      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeAds: [], youtubeOrganic: [], tiktok: [],
          dateRange: 'Learning Loops Analysis',
          _customPrompt: prompt,
        }),
      });
      const data = await res.json();
      setPattern(data.narrative ?? '');
    } finally { setAnalyzing(false); }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-bold text-w-hi">Learning Loops</h1>
          <p className="text-w-mid text-sm mt-0.5">Tag top assets by hook type and topic, then find patterns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} disabled={loading}
            className="px-4 py-1.5 bg-w-surface border border-w-border text-w-mid hover:text-w-hi text-xs font-medium rounded-full transition-colors disabled:opacity-50">
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
          <button onClick={analyzePatterns} disabled={analyzing || assets.length === 0}
            className="px-4 py-1.5 bg-w-hi hover:bg-[#0f0f1a] disabled:opacity-50 text-white text-xs font-medium rounded-full transition-colors">
            {analyzing ? 'Analyzing…' : '✦ Find Patterns'}
          </button>
        </div>
      </div>

      {pattern && (
        <div className="mb-6 bg-[#f9f9fb] border border-w-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-w-border">
            <div className="font-walsheim text-sm font-semibold text-w-hi">✦ Pattern Analysis</div>
          </div>
          <div className="mx-5 my-4 px-4 py-3 bg-w-blue-bg rounded-md border-l-4 border-w-blue">
            <p className="text-sm text-w-hi leading-relaxed">{pattern}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#ebebed]">
                <th className="text-left py-4 px-4 font-walsheim text-sm font-semibold text-w-hi">Asset</th>
                <th className="py-4 px-4 font-walsheim text-sm font-semibold text-w-hi text-left whitespace-nowrap">Format</th>
                <th className="py-4 px-4 font-walsheim text-sm font-semibold text-w-hi text-left whitespace-nowrap">Primary Metric</th>
                <th className="py-4 px-4 font-walsheim text-sm font-semibold text-w-hi text-left whitespace-nowrap">Hook Type</th>
                <th className="py-4 px-4 font-walsheim text-sm font-semibold text-w-hi text-left whitespace-nowrap">Topic</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a, i) => (
                <tr key={a.videoId} className={`${i % 2 === 0 ? 'bg-[#f9f9fb]' : 'bg-white'} border-b border-[#ebebed] last:border-0 hover:bg-[#eeeef0] transition-colors`}>
                  <td className="py-4 px-4 text-w-hi font-medium max-w-xs truncate">{a.title}</td>
                  <td className="py-4 px-4 text-w-hi capitalize whitespace-nowrap">{a.format}</td>
                  <td className="py-4 px-4 text-w-hi whitespace-nowrap tabular-nums">{a.primaryMetric.toFixed(1)}% <span className="text-w-mid">{a.metricLabel}</span></td>
                  <td className="py-4 px-4">
                    <select value={a.hook} onChange={e => updateTag(a.videoId, 'hook', e.target.value)}
                      className="bg-w-canvas border border-w-border rounded px-2 py-1 text-w-hi text-xs focus:outline-none focus:border-w-blue">
                      <option value="">— tag</option>
                      {HOOK_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </td>
                  <td className="px-5">
                    <select value={a.topic} onChange={e => updateTag(a.videoId, 'topic', e.target.value)}
                      className="bg-w-canvas border border-w-border rounded px-2 py-1 text-w-hi text-xs focus:outline-none focus:border-w-blue">
                      <option value="">— tag</option>
                      {TOPIC_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assets.length === 0 && !loading && (
            <p className="text-w-mid text-sm py-8 text-center">No data — click Refresh</p>
          )}
        </div>
      </div>
    </div>
  );
}
