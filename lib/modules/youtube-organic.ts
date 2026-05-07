import type { YouTubeOrganicVideo, AssetEvaluation, AssetStatus } from '../types';
import { evaluateMetric, BENCHMARKS } from '../benchmarks';

export function evaluateYouTubeOrganic(video: YouTubeOrganicVideo): AssetEvaluation {
  const signals: string[] = [];

  if (video.format === 'short') {
    const raw = evaluateMetric(video.avgViewPercentage, BENCHMARKS.ytShorts.avgViewPercentage);
    // For shorts, cap worst status at 'warning' — 'below' is too harsh for organic shorts
    const s: AssetStatus = raw === 'below' ? 'warning' : raw;
    signals.push(`${video.avgViewPercentage.toFixed(1)}% watched`);
    return { status: s, signals };
  }

  // long-form or horizontal: use ctr + avgViewPercentage, worst wins
  const capStatus = (s: AssetStatus): AssetStatus => s === 'below' ? 'warning' : s;

  const ctrStatus  = video.ctr > 0
    ? capStatus(evaluateMetric(video.ctr, BENCHMARKS.ytLongForm.ctr))
    : 'warning';
  const watchStatus = capStatus(evaluateMetric(video.avgViewPercentage, BENCHMARKS.ytLongForm.avgViewPercentage));

  signals.push(`${video.ctr.toFixed(1)}% CTR`, `${video.avgViewPercentage.toFixed(1)}% watched`);

  // Higher index = worse status; pick the worst
  const order: AssetStatus[] = ['promote','strong','good','warning','below'];
  const worst = [ctrStatus, watchStatus].sort((a, b) => order.indexOf(b) - order.indexOf(a))[0];
  return { status: worst, signals };
}
