import type { NextApiRequest, NextApiResponse } from 'next';
import { evaluateInstagram } from '@/lib/modules/instagram';
import type { InstagramPost } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken  = process.env.META_ACCESS_TOKEN;
  const igAccountId  = process.env.META_INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !igAccountId) {
    return res.status(200).json({ posts: [], status: 'not_configured', fetchedAt: new Date().toISOString() });
  }

  try {
    const mediaRes = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media?` +
      new URLSearchParams({
        access_token: accessToken,
        fields: 'id,caption,media_type,timestamp',
        limit: '50',
      })
    );
    if (!mediaRes.ok) return res.status(mediaRes.status).json({ error: await mediaRes.json() });
    const mediaData = await mediaRes.json();
    const mediaItems = mediaData.data ?? [];

    const posts: InstagramPost[] = await Promise.all(
      mediaItems.map(async (item: Record<string, string>) => {
        const insightsRes = await fetch(
          `https://graph.facebook.com/v18.0/${item.id}/insights?` +
          new URLSearchParams({
            access_token: accessToken,
            metric: 'plays,reach,likes,comments,shares',
          })
        );
        const insightsData = insightsRes.ok ? await insightsRes.json() : { data: [] };
        const metrics: Record<string, number> = {};
        for (const m of insightsData.data ?? []) {
          metrics[m.name] = m.values?.[0]?.value ?? 0;
        }
        const plays    = metrics.plays ?? 0;
        const likes    = metrics.likes ?? 0;
        const comments = metrics.comments ?? 0;
        const shares   = metrics.shares ?? 0;
        const reach    = metrics.reach ?? 0;
        const engagementRate = reach > 0 ? ((likes + comments + shares) / reach) * 100 : 0;

        const post: InstagramPost = {
          mediaId:         item.id,
          caption:         item.caption ?? '',
          mediaType:       (item.media_type as InstagramPost['mediaType']) ?? 'IMAGE',
          plays, reach, likes, comments, shares,
          engagementRate: parseFloat(engagementRate.toFixed(2)),
        };
        return { ...post, evaluation: evaluateInstagram(post) };
      })
    );

    res.status(200).json({ posts, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Instagram fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch Instagram data' });
  }
}
