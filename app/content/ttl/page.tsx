'use client';
import { useState, useEffect } from 'react';
import AssetTable from '@/components/AssetTable';
import type { YouTubeOrganicVideo } from '@/lib/types';

export default function TTLPage() {
  const [videos, setVideos] = useState<YouTubeOrganicVideo[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data/youtube-organic');
      const data = await res.json();
      setVideos((data.videos ?? []).filter((v: YouTubeOrganicVideo) => v.contentType === 'ttl'));
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, []);

  const rows = videos.map(v => ({
    title: v.title,
    format: v.format,
    yt: v.evaluation ? {
      value: v.format === 'short'
        ? `${v.avgViewPercentage.toFixed(1)}% watched`
        : `${v.ctr.toFixed(1)}% CTR · ${v.avgViewPercentage.toFixed(1)}% watched`,
      status: v.evaluation.status,
    } : undefined,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">TTL — Talking Too Loud (w/ Guest)</h1>
          <p className="text-gray-500 text-sm mt-1">{videos.length} assets · YouTube only for now</p>
        </div>
        <button onClick={refresh} disabled={loading}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded">
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>
      <AssetTable rows={rows} />
    </div>
  );
}
