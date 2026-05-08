import type { NextApiRequest, NextApiResponse } from 'next';
import type { MetaCampaign } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;

  if (!accessToken || !adAccountId) {
    return res.status(200).json({ campaigns: [], status: 'not_configured' });
  }

  const now = new Date();
  const days = parseInt(req.query.days as string ?? '0', 10);

  let dateParam: string;
  if (days > 0) {
    const since = new Date(now.getTime() - days * 86400000);
    const sinceDate = since.toISOString().slice(0, 10);
    const untilDate = now.toISOString().slice(0, 10);
    dateParam = `time_range=${encodeURIComponent(JSON.stringify({ since: sinceDate, until: untilDate }))}`;
  } else {
    dateParam = 'date_preset=this_year';
  }

  const url =
    `https://graph.facebook.com/v21.0/${adAccountId}/campaigns` +
    `?fields=name,status,objective,insights{impressions,clicks,spend,reach,ctr,cpc,actions}` +
    `&access_token=${accessToken}` +
    `&${dateParam}` +
    `&limit=20`;

  try {
    const apiRes = await fetch(url);
    const json = await apiRes.json() as Record<string, unknown>;

    if (json.error) {
      const err = json.error as Record<string, unknown>;
      return res.status(200).json({ error: err.message ?? 'Meta API error' });
    }

    const rawCampaigns = (json.data as Record<string, unknown>[]) ?? [];

    const campaigns: MetaCampaign[] = rawCampaigns.map((campaign) => {
      const insightsData = (campaign.insights as Record<string, unknown> | undefined)?.data as Record<string, unknown>[] | undefined;
      const insight = insightsData?.[0] ?? {};

      const actions = (insight.actions as Record<string, unknown>[] | undefined) ?? [];
      const conversions = actions
        .filter((a) => {
          const type = a.action_type as string ?? '';
          return type.includes('purchase') || type.includes('lead');
        })
        .reduce((sum, a) => sum + parseFloat((a.value as string) ?? '0'), 0);

      return {
        campaignId: campaign.id as string ?? '',
        name: campaign.name as string ?? '',
        status: campaign.status as string ?? '',
        objective: campaign.objective as string ?? '',
        impressions: parseInt((insight.impressions as string) ?? '0', 10),
        clicks: parseInt((insight.clicks as string) ?? '0', 10),
        spend: parseFloat((insight.spend as string) ?? '0'),
        reach: parseInt((insight.reach as string) ?? '0', 10),
        ctr: parseFloat((insight.ctr as string) ?? '0'),
        cpc: parseFloat((insight.cpc as string) ?? '0'),
        conversions: Math.round(conversions),
      };
    });

    campaigns.sort((a, b) => b.spend - a.spend);

    return res.status(200).json({ campaigns, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Meta Ads fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch Meta Ads data' });
  }
}
