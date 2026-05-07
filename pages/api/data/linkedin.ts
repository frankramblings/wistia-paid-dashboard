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
      'LinkedIn-Version': '202304',
      'X-Restli-Protocol-Version': '2.0.0',
    };

    const sharesRes = await fetch(
      `https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:${organizationId}&count=50`,
      { headers }
    );
    if (!sharesRes.ok) return res.status(sharesRes.status).json({ error: await sharesRes.json() });
    const sharesData = await sharesRes.json();
    const shares = sharesData.elements ?? [];

    const statsRes = await fetch(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}`,
      { headers }
    );
    const statsData = statsRes.ok ? await statsRes.json() : { elements: [] };
    const statsMap: Record<string, Record<string, number>> = {};
    for (const stat of statsData.elements ?? []) {
      statsMap[stat.share] = stat.totalShareStatistics ?? {};
    }

    const posts: LinkedInPost[] = shares.map((share: Record<string, unknown>) => {
      const shareUrn = share.activity as string ?? '';
      const stats = statsMap[shareUrn] ?? {};
      const impressions = stats.impressionCount ?? 0;
      const clicks      = stats.clickCount ?? 0;
      const likes       = stats.likeCount ?? 0;
      const comments    = stats.commentCount ?? 0;
      const shareCount  = stats.shareCount ?? 0;
      const engagementRate = impressions > 0
        ? ((clicks + likes + comments + shareCount) / impressions) * 100 : 0;

      const text = (share.text as Record<string, string>)?.text ?? '';
      const post: LinkedInPost = {
        shareId: shareUrn,
        text,
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
