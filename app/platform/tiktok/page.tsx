'use client';
import { useState, useEffect } from 'react';
import BenchmarkBadge from '@/components/BenchmarkBadge';
import type { TikTokVideo } from '@/lib/types';

export default function TikTokPlatformPage() {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data/tiktok');
      const data = await res.json();
      setVideos(data.videos ?? []);
      setStatus(data.status ?? '');
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">TikTok</h1>
        <button onClick={refresh} disabled={loading}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded">
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>
      {status === 'not_configured' && (
        <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded mb-6 text-yellow-400 text-sm">
          TikTok API not yet configured. Add <code>TIKTOK_ACCESS_TOKEN</code> and <code>TIKTOK_ADVERTISER_ID</code> to your environment variables.
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-500 uppercase border-b border-gray-800">
              {['Title','Views','Eng. Rate','Profile View Rate','Status'].map(h => (
                <th key={h} className="text-left py-2 pr-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {videos.map(v => (
              <tr key={v.videoId} className="border-b border-gray-900 hover:bg-gray-900/50">
                <td className="py-2 pr-3 text-white max-w-xs truncate">{v.title}</td>
                <td className="pr-3 text-gray-300">{v.views.toLocaleString()}</td>
                <td className="pr-3 text-gray-300">{v.engagementRate.toFixed(1)}%</td>
                <td className="pr-3 text-gray-300">{v.profileViewRate.toFixed(2)}%</td>
                <td>{v.evaluation && <BenchmarkBadge status={v.evaluation.status} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {videos.length === 0 && status !== 'not_configured' && !loading && (
          <p className="text-gray-600 text-sm py-8 text-center">No data — click Refresh</p>
        )}
      </div>
    </div>
  );
}
