import type { InstagramPost, AssetEvaluation } from '../types';

// Benchmarks TBD — placeholder returns 'good' for all posts until metrics are defined
export function evaluateInstagram(post: InstagramPost): AssetEvaluation {
  const signals: string[] = [];
  if (post.plays > 0) signals.push(`${post.plays.toLocaleString()} plays`);
  if (post.engagementRate > 0) signals.push(`${post.engagementRate.toFixed(1)}% engagement`);
  return { status: 'good', signals };
}
