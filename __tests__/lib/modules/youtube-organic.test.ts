import { evaluateYouTubeOrganic } from '@/lib/modules/youtube-organic';
import type { YouTubeOrganicVideo } from '@/lib/types';

const longFormBase: YouTubeOrganicVideo = {
  videoId: 'abc123', title: 'TTL Full Ep 42', contentType: 'ttl',
  format: 'long-form', views: 5000, watchTimeMinutes: 45000,
  avgViewPercentage: 38, ctr: 4.2, subscribersGained: 12,
};

const shortBase: YouTubeOrganicVideo = {
  ...longFormBase, title: 'TTL_Short 1', format: 'short',
  avgViewPercentage: 88, ctr: 0,
};

describe('evaluateYouTubeOrganic — long-form', () => {
  it('returns good when avgViewPercentage and ctr are in range', () => {
    expect(evaluateYouTubeOrganic(longFormBase).status).toBe('good');
  });

  it('returns warning when ctr is below 80% of min (3%)', () => {
    const result = evaluateYouTubeOrganic({ ...longFormBase, ctr: 2.0 });
    expect(result.status).toBe('warning');
  });
});

describe('evaluateYouTubeOrganic — short', () => {
  it('returns good when avgViewPercentage >= 85', () => {
    expect(evaluateYouTubeOrganic({ ...shortBase, avgViewPercentage: 95 }).status).toBe('good');
  });

  it('returns warning when avgViewPercentage below 68 (80% of 85)', () => {
    expect(evaluateYouTubeOrganic({ ...shortBase, avgViewPercentage: 65 }).status).toBe('warning');
  });
});
