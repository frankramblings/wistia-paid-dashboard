import type { TikTokVideo, AssetEvaluation, AssetStatus } from '../types';
import { evaluateMetric, BENCHMARKS } from '../benchmarks';

export function evaluateTikTok(video: TikTokVideo): AssetEvaluation {
  const engRaw = evaluateMetric(video.engagementRate, BENCHMARKS.tiktok.engagementRate);
  const signals = [
    `${video.engagementRate.toFixed(1)}% engagement`,
    `${video.profileViewRate.toFixed(2)}% profile view rate`,
  ];
  // engagementRate is the primary TikTok signal; cap 'below' at 'warning'
  const status: AssetStatus = engRaw === 'below' ? 'warning' : engRaw;
  return { status, signals };
}
