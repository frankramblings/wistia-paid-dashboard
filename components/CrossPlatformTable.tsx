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
    <div className="mb-6">
      <h2 className="text-[8px] font-bold text-bone-mid uppercase tracking-[.22em] mb-3">Platform Efficiency</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-bone-mid uppercase border-b border-bone-border">
              {['Platform', 'Spend', 'Share', 'Impressions', 'CPM', 'Clicks', 'CPC', 'Conversions'].map(h => (
                <th key={h} className="text-left py-2 pr-5 whitespace-nowrap">{h}</th>
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
                <tr key={r.platform} className="border-b border-bone-border hover:bg-bone-alt">
                  <td className="py-2 pr-5 text-bone-hi font-medium">{r.platform}</td>
                  <td className="pr-5 text-bone-mid">${r.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td className="pr-5 text-bone-mid">{share}%</td>
                  <td className="pr-5 text-bone-mid">{r.impressions.toLocaleString()}</td>
                  <td className={`pr-5 ${scoreAndColor(platform, 'cpm', cpm)}`}>
                    ${cpm.toFixed(2)}
                  </td>
                  <td className="pr-5 text-bone-mid">{r.clicks.toLocaleString()}</td>
                  <td className={`pr-5 ${cpc > 0 ? scoreAndColor(platform, 'cpc', cpc) : 'text-bone-mid'}`}>
                    {cpc > 0 ? `$${cpc.toFixed(2)}` : '—'}
                  </td>
                  <td className="pr-5 text-bone-mid">{r.conversions > 0 ? r.conversions.toLocaleString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
