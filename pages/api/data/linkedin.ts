import type { NextApiRequest, NextApiResponse } from 'next';
import { evaluateLinkedIn } from '@/lib/modules/linkedin';
import type { LinkedInPost } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken    = process.env.LINKEDIN_ACCESS_TOKEN;
  const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;

  if (!accessToken || !organizationId) {
    return res.status(200).json({ posts: [], status: 'not_configured', fetchedAt: new Date().toISOString() });
  }

  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': '202411',
      'X-Restli-Protocol-Version': '2.0.0',
    };

    // Fetch org posts via the REST posts API
    const postsRes = await fetch(
      `https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aorganization%3A${organizationId}&q=author&count=20&sortBy=LAST_MODIFIED`,
      { headers }
    );
    if (!postsRes.ok) return res.status(postsRes.status).json({ error: await postsRes.json() });
    const postsData = await postsRes.json();
    const elements: Record<string, unknown>[] = postsData.elements ?? [];

    // Fetch per-post stats
    const urns = elements.map(p => p.id as string).filter(Boolean);
    const statsMap: Record<string, Record<string, number>> = {};

    if (urns.length > 0) {
      const statsRes = await fetch(
        `https://api.linkedin.com/rest/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn%3Ali%3Aorganization%3A${organizationId}&count=20`,
        { headers }
      );
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        for (const stat of statsData.elements ?? []) {
          const urn = stat.organizationalEntity ?? stat.share ?? '';
          statsMap[urn] = stat.totalShareStatistics ?? {};
        }
      }
    }

    const posts: LinkedInPost[] = elements.map(el => {
      const shareId = el.id as string ?? '';
      const stats   = statsMap[shareId] ?? {};
      const impressions    = (stats.impressionCount as number) ?? 0;
      const clicks         = (stats.clickCount as number) ?? 0;
      const likes          = (stats.likeCount as number) ?? 0;
      const comments       = (stats.commentCount as number) ?? 0;
      const shareCount     = (stats.shareCount as number) ?? 0;
      const engagementRate = impressions > 0
        ? ((clicks + likes + comments + shareCount) / impressions) * 100 : 0;

      const commentary = el.commentary as string ?? '';
      const post: LinkedInPost = {
        shareId,
        text: commentary,
        impressions, clicks, likes, comments,
        shares: shareCount,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
      };
      return { ...post, evaluation: evaluateLinkedIn(post) };
    });

    res.status(200).json({ posts, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('LinkedIn fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn data' });
  }
}
