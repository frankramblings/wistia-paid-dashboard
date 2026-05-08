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
          className={`flex items-start gap-2 px-4 py-2.5 border text-sm ${
            r.type === 'warn'
              ? 'bg-bone-warn-bg border-bone-warn/50 text-bone-warn'
              : r.type === 'good'
              ? 'bg-bone-good-bg border-bone-good/50 text-bone-good'
              : 'bg-bone-info-bg border-bone-border text-bone-mid'
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
