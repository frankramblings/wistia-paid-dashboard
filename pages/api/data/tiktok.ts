import type { NextApiRequest, NextApiResponse } from 'next';
import { evaluateTikTok } from '@/lib/modules/tiktok';
import type { TikTokVideo } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken   = process.env.TIKTOK_ACCESS_TOKEN;
  const advertiserId  = process.env.TIKTOK_ADVERTISER_ID;

  if (!accessToken) {
    return res.status(200).json({ videos: [], status: 'not_configured', fetchedAt: new Date().toISOString() });
  }

  try {
    const response = await fetch(
      'https://business-api.tiktok.com/open_api/v1.3/video/list/?' +
      new URLSearchParams({ advertiser_id: advertiserId ?? '', fields: '["video_id","video_name","metrics"]' }),
      { headers: { 'Access-Token': accessToken } }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const items = data.data?.list ?? [];

    const videos: TikTokVideo[] = items.map((item: Record<string, unknown>) => {
      const metrics = (item.metrics as Record<string, number>) ?? {};
      const views        = metrics.play_count ?? 0;
      const profileViews = metrics.profile_visits ?? 0;
      const likes        = metrics.like_count ?? 0;
      const comments     = metrics.comment_count ?? 0;
      const shares       = metrics.share_count ?? 0;
      const engagementRate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;
      const profileViewRate = views > 0 ? (profileViews / views) * 100 : 0;

      const video: TikTokVideo = {
        videoId: item.video_id as string,
        title: item.video_name as string ?? '',
        views, profileViews, likes, comments, shares,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        profileViewRate: parseFloat(profileViewRate.toFixed(3)),
      };
      return { ...video, evaluation: evaluateTikTok(video) };
    });

    res.status(200).json({ videos, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('TikTok fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch TikTok data' });
  }
}
