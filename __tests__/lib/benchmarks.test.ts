import { evaluateMetric, BENCHMARKS } from '@/lib/benchmarks';

describe('evaluateMetric', () => {
  it('returns strong when value >= max', () => {
    expect(evaluateMetric(6, { min: 3, max: 5 })).toBe('strong');
  });

  it('returns good when value is within range', () => {
    expect(evaluateMetric(4, { min: 3, max: 5 })).toBe('good');
  });

  it('returns good when value equals min', () => {
    expect(evaluateMetric(3, { min: 3, max: 5 })).toBe('good');
  });

  it('returns warning when value is 80–99% of min', () => {
    expect(evaluateMetric(2.5, { min: 3, max: 5 })).toBe('warning');
  });

  it('returns below when value is under 80% of min', () => {
    expect(evaluateMetric(1, { min: 3, max: 5 })).toBe('below');
  });

  it('handles ranges with no max', () => {
    expect(evaluateMetric(45, { min: 40 })).toBe('good');
    expect(evaluateMetric(38, { min: 40 })).toBe('warning');
  });
});

describe('BENCHMARKS', () => {
  it('has expected keys', () => {
    expect(BENCHMARKS).toHaveProperty('ytLongForm');
    expect(BENCHMARKS).toHaveProperty('ytShorts');
    expect(BENCHMARKS).toHaveProperty('ytAdsShorts');
    expect(BENCHMARKS).toHaveProperty('tiktok');
  });
});
