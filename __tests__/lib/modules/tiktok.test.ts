import { evaluateTikTok } from '@/lib/modules/tiktok';
import type { TikTokVideo } from '@/lib/types';

const base: TikTokVideo = {
  videoId: 'tt1', title: 'TTL Short', views: 10000, profileViews: 70,
  likes: 400, comments: 50, shares: 90, engagementRate: 5.4, profileViewRate: 0.7,
};

describe('evaluateTikTok', () => {
  it('returns good when both metrics in range', () => {
    expect(evaluateTikTok(base).status).toBe('good');
  });

  it('returns warning when engagementRate below 80% of 4', () => {
    expect(evaluateTikTok({ ...base, engagementRate: 2.5 }).status).toBe('warning');
  });

  it('returns strong when engagementRate >= 8', () => {
    expect(evaluateTikTok({ ...base, engagementRate: 9 }).status).toBe('strong');
  });
});
