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
          className={`flex items-start gap-3 px-4 py-3 rounded-md border text-sm ${
            r.type === 'warn'
              ? 'bg-w-warn-bg border-w-warn/30 text-w-warn'
              : r.type === 'good'
              ? 'bg-w-good-bg border-w-good/30 text-w-good'
              : 'bg-w-blue-bg border-w-blue/30 text-w-blue'
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
