interface KPI { label: string; value: string; status?: 'good' | 'warning' | 'neutral' }

export default function KPIStrip({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {kpis.map(k => (
        <div key={k.label} className="bg-bone-alt rounded p-3 border border-bone-border">
          <div className={`font-bebas text-3xl leading-none ${
            k.status === 'good'    ? 'text-bone-good' :
            k.status === 'warning' ? 'text-bone-warn' : 'text-bone-hi'
          }`}>
            {k.value}
          </div>
          <div className="text-bone-mid text-[10px] uppercase tracking-wide mt-1 truncate">{k.label}</div>
        </div>
      ))}
    </div>
  );
}
