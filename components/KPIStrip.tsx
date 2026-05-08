interface KPI { label: string; value: string; status?: 'good' | 'warning' | 'neutral' }

export default function KPIStrip({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {kpis.map(k => (
        <div key={k.label} className="bg-[#f0f0f3] rounded-2xl p-5">
          <div className="font-walsheim text-[14px] font-semibold text-w-hi mb-2">{k.label}</div>
          <div className="font-walsheim text-[26px] font-bold text-w-hi tabular-nums tracking-tight">{k.value}</div>
        </div>
      ))}
    </div>
  );
}
