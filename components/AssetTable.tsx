import BenchmarkBadge from './BenchmarkBadge';
import type { AssetStatus } from '@/lib/types';

interface AssetRow {
  title: string;
  format: string;
  yt?: { value: string; status: AssetStatus };
  tiktok?: { value: string; status: AssetStatus };
  instagram?: { value: string; status: AssetStatus };
  linkedin?: { value: string; status: AssetStatus };
}

export default function AssetTable({ rows }: { rows: AssetRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
            <th className="text-left py-2 pr-4">Asset</th>
            <th className="pr-4">Format</th>
            <th className="pr-4">YouTube</th>
            <th className="pr-4">TikTok</th>
            <th className="pr-4">Instagram</th>
            <th>LinkedIn</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-900 hover:bg-gray-900/50">
              <td className="py-2 pr-4 text-white font-medium">{row.title}</td>
              <td className="pr-4 text-gray-400 capitalize">{row.format}</td>
              <td className="pr-4">
                {row.yt ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-300 text-xs">{row.yt.value}</span>
                    <BenchmarkBadge status={row.yt.status} />
                  </div>
                ) : <span className="text-gray-700">—</span>}
              </td>
              <td className="pr-4">
                {row.tiktok ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-300 text-xs">{row.tiktok.value}</span>
                    <BenchmarkBadge status={row.tiktok.status} />
                  </div>
                ) : <span className="text-gray-700">—</span>}
              </td>
              <td className="pr-4">
                {row.instagram ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-300 text-xs">{row.instagram.value}</span>
                    <BenchmarkBadge status={row.instagram.status} />
                  </div>
                ) : <span className="text-gray-700">—</span>}
              </td>
              <td>
                {row.linkedin ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-300 text-xs">{row.linkedin.value}</span>
                    <BenchmarkBadge status={row.linkedin.status} />
                  </div>
                ) : <span className="text-gray-700">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="text-gray-600 text-sm py-8 text-center">No data — click Refresh</p>
      )}
    </div>
  );
}
