import type { AssetStatus, BenchmarkRange } from './types';

export const BENCHMARKS = {
  ytLongForm: {
    ctr:              { min: 3,  max: 5   } as BenchmarkRange,  // %
    avgViewPercentage:{ min: 35, max: 45  } as BenchmarkRange,  // %
    watchTimeMinutes: { min: 10, max: 15  } as BenchmarkRange,
  },
  ytShorts: {
    avgViewPercentage:{ min: 85, max: 100 } as BenchmarkRange,  // %
    shortsVR:         { min: 70, max: 80  } as BenchmarkRange,  // viewed vs swiped %
  },
  ytAdsShorts: {
    completionRate:   { min: 40           } as BenchmarkRange,  // % for promote
    interactionRate:  { min: 50           } as BenchmarkRange,  // % for promote
  },
  tiktok: {
    engagementRate:   { min: 4,  max: 8   } as BenchmarkRange,  // %
    profileViewRate:  { min: 0.5, max: 1  } as BenchmarkRange,  // %
  },
  instagram: {} as Record<string, BenchmarkRange>,
  linkedin:  {} as Record<string, BenchmarkRange>,
} as const;

export function evaluateMetric(value: number, range: BenchmarkRange): AssetStatus {
  const { min, max } = range;
  if (max !== undefined && value >= max) return 'strong';
  if (value >= min) return 'good';
  if (value >= min * 0.8) return 'warning';
  return 'below';
}
