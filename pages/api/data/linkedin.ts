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
    const restHeaders = {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': '202604',
      'X-Restli-Protocol-Version': '2.0.0',
    };
    const v2Headers = {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    };

    // Fetch recent org posts
    const postsRes = await fetch(
      `https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aorganization%3A${organizationId}&q=author&count=20&sortBy=LAST_MODIFIED`,
      { headers: restHeaders }
    );
    if (!postsRes.ok) return res.status(postsRes.status).json({ error: await postsRes.json() });
    const postsData = await postsRes.json();
    const elements: Record<string, unknown>[] = postsData.elements ?? [];

    // Fetch social actions (likes + comments) for each post in parallel
    const socialActions = await Promise.all(
      elements.map(async (el) => {
        const urn = el.id as string;
        if (!urn) return { urn, likes: 0, comments: 0 };
        try {
          const r = await fetch(
            `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(urn)}`,
            { headers: v2Headers }
          );
          if (!r.ok) return { urn, likes: 0, comments: 0 };
          const d = await r.json();
          return {
            urn,
            likes:    d.likesSummary?.totalLikes ?? 0,
            comments: d.commentsSummary?.totalFirstLevelComments ?? 0,
          };
        } catch {
          return { urn, likes: 0, comments: 0 };
        }
      })
    );

    const actionsMap = Object.fromEntries(socialActions.map(a => [a.urn, a]));

    const posts: LinkedInPost[] = elements.map(el => {
      const shareId  = el.id as string ?? '';
      const actions  = actionsMap[shareId] ?? { likes: 0, comments: 0 };
      const likes    = actions.likes;
      const comments = actions.comments;
      // Impressions not available without partner API — use 0
      const post: LinkedInPost = {
        shareId,
        text: el.commentary as string ?? '',
        impressions: 0,
        clicks: 0,
        likes,
        comments,
        shares: 0,
        engagementRate: 0,
      };
      return { ...post, evaluation: evaluateLinkedIn(post) };
    });

    res.status(200).json({ posts, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('LinkedIn fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn data' });
  }
}
