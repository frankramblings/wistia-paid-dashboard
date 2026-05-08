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
    <div className="mb-6 bg-white rounded-2xl overflow-hidden">
      <div className="px-5 py-4 bg-white">
        <h2 className="text-[15px] font-semibold text-w-hi">Platform Efficiency</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#ebebed]">
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
                <th key={h} className={`py-3 px-4 font-walsheim text-sm font-semibold text-w-hi whitespace-nowrap text-${align} first:text-left`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.sort((a, b) => b.spend - a.spend).map((r, i) => {
              const platform = r.platform.toLowerCase();
              const cpm = calcCPM(r.spend, r.impressions);
              const cpc = r.clicks > 0 ? r.spend / r.clicks : 0;
              const share = totalSpend > 0 ? (r.spend / totalSpend * 100).toFixed(0) : '0';
              const rowBg = i % 2 === 0 ? 'bg-[#f9f9fb]' : 'bg-white';

              return (
                <tr key={r.platform} className={`${rowBg} border-b border-[#ebebed] last:border-0 hover:bg-[#eeeef0] transition-colors`}>
                  <td className="py-4 px-4 text-w-hi font-semibold">{r.platform}</td>
                  <td className="py-4 px-4 text-w-hi text-right tabular-nums">${r.spend.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td className="py-4 px-4 text-w-hi text-right tabular-nums">{share}%</td>
                  <td className="py-4 px-4 text-w-hi text-right tabular-nums">{r.impressions.toLocaleString()}</td>
                  <td className={`py-4 px-4 text-right tabular-nums ${scoreAndColor(platform, 'cpm', cpm)}`}>${cpm.toFixed(2)}</td>
                  <td className="py-4 px-4 text-w-hi text-right tabular-nums">{r.clicks.toLocaleString()}</td>
                  <td className={`py-4 px-4 text-right tabular-nums ${cpc > 0 ? scoreAndColor(platform, 'cpc', cpc) : 'text-w-mid'}`}>
                    {cpc > 0 ? `$${cpc.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-4 px-4 text-w-hi text-right tabular-nums">{r.conversions > 0 ? r.conversions.toLocaleString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
