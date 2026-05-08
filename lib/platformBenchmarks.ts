export type MetricStatus = 'good' | 'ok' | 'poor';

interface Benchmark {
  good: number;
  ok: number;
  higherIsBetter: boolean;
}

const BENCHMARKS: Record<string, Record<string, Benchmark>> = {
  linkedin: {
    ctr:  { good: 0.6,  ok: 0.3,  higherIsBetter: true  },
    cpc:  { good: 8,    ok: 15,   higherIsBetter: false  },
    cpm:  { good: 50,   ok: 90,   higherIsBetter: false  },
  },
  meta: {
    ctr:  { good: 1.0,  ok: 0.5,  higherIsBetter: true  },
    cpc:  { good: 0.75, ok: 2.0,  higherIsBetter: false  },
    cpm:  { good: 8,    ok: 20,   higherIsBetter: false  },
  },
  tiktok: {
    ctr:      { good: 0.5,  ok: 0.2,  higherIsBetter: true  },
    cpc:      { good: 0.3,  ok: 1.0,  higherIsBetter: false  },
    cpm:      { good: 8,    ok: 18,   higherIsBetter: false  },
    viewRate: { good: 30,   ok: 15,   higherIsBetter: true  },
    cpv:      { good: 0.02, ok: 0.06, higherIsBetter: false  },
  },
  youtube: {
    played100:       { good: 40,   ok: 25,   higherIsBetter: true  },
    interactionRate: { good: 50,   ok: 30,   higherIsBetter: true  },
    avgCPV:          { good: 0.01, ok: 0.03, higherIsBetter: false  },
    cpm:             { good: 5,    ok: 15,   higherIsBetter: false  },
  },
};

export function scoreMetric(platform: string, metric: string, value: number): MetricStatus {
  const bench = BENCHMARKS[platform]?.[metric];
  if (!bench || isNaN(value)) return 'ok';
  if (bench.higherIsBetter) {
    return value >= bench.good ? 'good' : value >= bench.ok ? 'ok' : 'poor';
  } else {
    return value <= bench.good ? 'good' : value <= bench.ok ? 'ok' : 'poor';
  }
}

export function metricColor(status: MetricStatus): string {
  if (status === 'good') return 'text-green-400';
  if (status === 'poor') return 'text-red-400';
  return 'text-gray-300';
}

export function scoreAndColor(platform: string, metric: string, value: number): string {
  return metricColor(scoreMetric(platform, metric, value));
}

// CPM helpers — CPM isn't always returned directly, compute it
export function calcCPM(spend: number, impressions: number): number {
  return impressions > 0 ? (spend / impressions) * 1000 : 0;
}
