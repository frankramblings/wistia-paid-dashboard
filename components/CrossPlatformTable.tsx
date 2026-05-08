import { scoreAndColor, calcCPM } from '@/lib/platformBenchmarks';

interface PlatformRow {
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export default function CrossPlatformTable({ rows }: { rows: PlatformRow[] }) {
  if (rows.length === 0) return null;

  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);

  return (
    <div className="mb-6 bg-w-surface border border-w-border rounded-lg shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-w-border">
        <h2 className="text-xs font-semibold text-w-mid uppercase tracking-wider">Platform Efficiency</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-w-border">
              {[
                { h: 'Platform',    align: 'left'  },
                { h: 'Spend',       align: 'right' },
                { h: 'Share',       align: 'right' },
                { h: 'Impressions', align: 'right' },
                { h: 'CPM',         align: 'right' },
                { h: 'Clicks',      align: 'right' },
                { h: 'CPC',         align: 'right' },
                { h: 'Conversions', align: 'right' },
              ].map(({ h, align }) => (
                <th key={h} className={`py-3 px-5 text-xs font-medium text-w-mid whitespace-nowrap text-${align} first:text-left`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.sort((a, b) => b.spend - a.spend).map(r => {
              const platform = r.platform.toLowerCase();
              const cpm = calcCPM(r.spend, r.impressions);
              const cpc = r.clicks > 0 ? r.spend / r.clicks : 0;
              const share = totalSpend > 0 ? (r.spend / totalSpend * 100).toFixed(0) : '0';

              return (
                <tr key={r.platform} className="border-b border-w-border last:border-0 hover:bg-w-canvas">
                  <td className="py-3 px-5 text-w-hi font-medium">{r.platform}</td>
                  <td className="py-3 px-5 text-w-mid text-right tabular-nums">${r.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td className="py-3 px-5 text-w-mid text-right tabular-nums">{share}%</td>
                  <td className="py-3 px-5 text-w-mid text-right tabular-nums">{r.impressions.toLocaleString()}</td>
                  <td className={`py-3 px-5 text-right tabular-nums ${scoreAndColor(platform, 'cpm', cpm)}`}>${cpm.toFixed(2)}</td>
                  <td className="py-3 px-5 text-w-mid text-right tabular-nums">{r.clicks.toLocaleString()}</td>
                  <td className={`py-3 px-5 text-right tabular-nums ${cpc > 0 ? scoreAndColor(platform, 'cpc', cpc) : 'text-w-mid'}`}>
                    {cpc > 0 ? `$${cpc.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 px-5 text-w-mid text-right tabular-nums">{r.conversions > 0 ? r.conversions.toLocaleString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
