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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Learning Loops</h1>
          <p className="text-gray-500 text-sm mt-1">Tag top assets by hook type and topic, then find patterns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} disabled={loading}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded">
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
          <button onClick={analyzePatterns} disabled={analyzing || assets.length === 0}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-sm rounded">
            {analyzing ? 'Analyzing…' : '✦ Find Patterns'}
          </button>
        </div>
      </div>

      {pattern && (
        <div className="mb-6 p-4 bg-gray-900 border-l-4 border-blue-500 rounded-r-lg">
          <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">✦ Pattern Analysis</div>
          <p className="text-gray-200 text-sm leading-relaxed">{pattern}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-500 uppercase border-b border-gray-800">
              <th className="text-left py-2 pr-3">Asset</th>
              <th className="pr-3">Format</th>
              <th className="pr-3">Primary Metric</th>
              <th className="pr-3">Hook Type</th>
              <th>Topic</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.videoId} className="border-b border-gray-900 hover:bg-gray-900/50">
                <td className="py-2 pr-3 text-white max-w-xs truncate">{a.title}</td>
                <td className="pr-3 text-gray-400 capitalize">{a.format}</td>
                <td className="pr-3 text-gray-300">{a.primaryMetric.toFixed(1)}% {a.metricLabel}</td>
                <td className="pr-3">
                  <select value={a.hook} onChange={e => updateTag(a.videoId, 'hook', e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 text-xs">
                    <option value="">— tag</option>
                    {HOOK_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </td>
                <td>
                  <select value={a.topic} onChange={e => updateTag(a.videoId, 'topic', e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 text-xs">
                    <option value="">— tag</option>
                    {TOPIC_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assets.length === 0 && !loading && (
          <p className="text-gray-600 text-sm py-8 text-center">No data — click Refresh</p>
        )}
      </div>
    </div>
  );
}
