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
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-w-border">
              <th className="text-left py-3.5 px-4 font-walsheim text-sm font-semibold text-w-hi whitespace-nowrap">Asset</th>
              <th className="py-3.5 px-4 font-walsheim text-sm font-semibold text-w-hi whitespace-nowrap text-left">Format</th>
              <th className="py-3.5 px-4 font-walsheim text-sm font-semibold text-w-hi whitespace-nowrap text-left">YouTube</th>
              <th className="py-3.5 px-4 font-walsheim text-sm font-semibold text-w-hi whitespace-nowrap text-left">TikTok</th>
              <th className="py-3.5 px-4 font-walsheim text-sm font-semibold text-w-hi whitespace-nowrap text-left">Instagram</th>
              <th className="py-3.5 px-4 font-walsheim text-sm font-semibold text-w-hi whitespace-nowrap text-left">LinkedIn</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-w-border last:border-0 hover:bg-w-surface-alt">
                <td className="py-3.5 px-4 text-w-hi font-medium">{row.title}</td>
                <td className="px-5 text-w-mid capitalize">{row.format}</td>
                <td className="px-5">
                  {row.yt ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-w-mid text-xs tabular-nums">{row.yt.value}</span>
                      <BenchmarkBadge status={row.yt.status} />
                    </div>
                  ) : <span className="text-w-border">—</span>}
                </td>
                <td className="px-5">
                  {row.tiktok ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-w-mid text-xs tabular-nums">{row.tiktok.value}</span>
                      <BenchmarkBadge status={row.tiktok.status} />
                    </div>
                  ) : <span className="text-w-border">—</span>}
                </td>
                <td className="px-5">
                  {row.instagram ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-w-mid text-xs tabular-nums">{row.instagram.value}</span>
                      <BenchmarkBadge status={row.instagram.status} />
                    </div>
                  ) : <span className="text-w-border">—</span>}
                </td>
                <td className="px-5">
                  {row.linkedin ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-w-mid text-xs tabular-nums">{row.linkedin.value}</span>
                      <BenchmarkBadge status={row.linkedin.status} />
                    </div>
                  ) : <span className="text-w-border">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-w-mid text-sm py-8 text-center">No data — click Refresh</p>
        )}
      </div>
    </div>
  );
}
