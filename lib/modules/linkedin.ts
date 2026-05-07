import type { LinkedInPost, AssetEvaluation } from '../types';

// Benchmarks TBD — placeholder returns 'good' for all posts until metrics are defined
export function evaluateLinkedIn(post: LinkedInPost): AssetEvaluation {
  const signals: string[] = [];
  if (post.impressions > 0) signals.push(`${post.impressions.toLocaleString()} impressions`);
  if (post.engagementRate > 0) signals.push(`${post.engagementRate.toFixed(1)}% engagement`);
  return { status: 'good', signals };
}
