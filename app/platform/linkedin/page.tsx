'use client';
import { useState, useEffect } from 'react';
import type { LinkedInPost } from '@/lib/types';

export default function LinkedInPlatformPage() {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data/linkedin');
      const data = await res.json();
      setPosts(data.posts ?? []);
      setStatus(data.status ?? '');
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">LinkedIn</h1>
        <button onClick={refresh} disabled={loading}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded">
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>
      {status === 'not_configured' && (
        <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded mb-6 text-yellow-400 text-sm">
          LinkedIn API not configured. Add <code>LINKEDIN_ACCESS_TOKEN</code> and <code>LINKEDIN_ORGANIZATION_ID</code>.
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-gray-500 uppercase border-b border-gray-800">
              {['Post','Likes','Comments'].map(h => (
                <th key={h} className="text-left py-2 pr-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.shareId} className="border-b border-gray-900 hover:bg-gray-900/50">
                <td className="py-2 pr-3 text-white max-w-sm truncate">{p.text?.slice(0, 80) ?? '—'}</td>
                <td className="pr-3 text-gray-300">{p.likes}</td>
                <td className="pr-3 text-gray-300">{p.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && status !== 'not_configured' && !loading && (
          <p className="text-gray-600 text-sm py-8 text-center">No data — click Refresh</p>
        )}
      </div>
    </div>
  );
}
