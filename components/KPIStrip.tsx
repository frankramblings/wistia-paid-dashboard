interface KPI { label: string; value: string; status?: 'good' | 'warning' | 'neutral' }

export default function KPIStrip({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {kpis.map(k => (
        <div key={k.label} className="bg-w-surface rounded-lg p-4 border border-w-border shadow-card">
          <div className="text-w-mid text-xs font-medium mb-2">{k.label}</div>
          <div className={`font-bebas text-3xl leading-none ${
            k.status === 'good'    ? 'text-w-good' :
            k.status === 'warning' ? 'text-w-warn' : 'text-w-hi'
          }`}>
            {k.value}
          </div>
        </div>
      ))}
    </div>
  );
}
