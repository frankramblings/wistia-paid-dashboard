interface CalloutRule {
  condition: boolean;
  message: string;
  type: 'warn' | 'good' | 'info';
}

interface Props {
  rules: CalloutRule[];
}

export default function ActionableCallout({ rules }: Props) {
  const active = rules.filter(r => r.condition).slice(0, 3);
  if (active.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {active.map((r, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 px-4 py-2.5 rounded border text-sm ${
            r.type === 'warn'
              ? 'bg-orange-950/40 border-orange-800 text-orange-300'
              : r.type === 'good'
              ? 'bg-green-950/40 border-green-800 text-green-300'
              : 'bg-blue-950/40 border-blue-800 text-blue-300'
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {r.type === 'warn' ? '⚠' : r.type === 'good' ? '✓' : '→'}
          </span>
          <span>{r.message}</span>
        </div>
      ))}
    </div>
  );
}
