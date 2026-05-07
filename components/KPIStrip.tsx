interface KPI { label: string; value: string; status?: 'good' | 'warning' | 'neutral' }

export default function KPIStrip({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {kpis.map(k => (
        <div key={k.label} className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <div className={`text-xl font-bold ${
            k.status === 'good' ? 'text-green-400' :
            k.status === 'warning' ? 'text-orange-400' : 'text-white'
          }`}>
            {k.value}
          </div>
          <div className="text-gray-500 text-xs mt-1">{k.label}</div>
        </div>
      ))}
    </div>
  );
}
