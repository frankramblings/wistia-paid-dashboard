import type { NextApiRequest, NextApiResponse } from 'next';
import type { LinkedInCampaign } from '@/lib/types';

const ACCOUNT_ID = '504039197';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(200).json({ campaigns: [], status: 'not_configured', fetchedAt: new Date().toISOString() });
  }

  const now = new Date();
  const startYear = now.getFullYear();
  const startMonth = 1;

  const analyticsHeaders = {
    Authorization: `Bearer ${accessToken}`,
    'X-Restli-Protocol-Version': '1.0.0',
  };
  const v2Headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    // Fetch campaign-level analytics for current year
    const analyticsUrl = [
      'https://api.linkedin.com/v2/adAnalyticsV2',
      '?q=analytics&pivot=CAMPAIGN&timeGranularity=ALL',
      `&accounts[0]=urn:li:sponsoredAccount:${ACCOUNT_ID}`,
      `&dateRange.start.year=${startYear}&dateRange.start.month=${startMonth}&dateRange.start.day=1`,
      `&dateRange.end.year=${now.getFullYear()}&dateRange.end.month=${now.getMonth() + 1}&dateRange.end.day=${now.getDate()}`,
      '&fields=impressions,clicks,costInLocalCurrency,externalWebsiteConversions',
      '&count=20',
    ].join('');

    const analyticsRes = await fetch(analyticsUrl, { headers: analyticsHeaders });
    if (!analyticsRes.ok) {
      const err = await analyticsRes.json();
      return res.status(analyticsRes.status).json({ error: err });
    }
    const analyticsData = await analyticsRes.json();
    const elements: Record<string, unknown>[] = analyticsData.elements ?? [];

    // Fetch campaign names in parallel
    const campaignIds = elements.map(el => {
      const ent = (el.adEntities as Record<string, unknown>[])?.[0];
      const val = (ent?.value as Record<string, string>) ?? {};
      const urn = val.campaign ?? '';
      return urn.split(':').pop() ?? '';
    }).filter(Boolean);

    const nameMap: Record<string, { name: string; status: string }> = {};
    await Promise.all(
      campaignIds.map(async (id) => {
        try {
          const r = await fetch(`https://api.linkedin.com/v2/adCampaignsV2/${id}`, { headers: v2Headers });
          if (r.ok) {
            const c = await r.json() as Record<string, unknown>;
            nameMap[id] = { name: c.name as string ?? id, status: c.status as string ?? '—' };
          }
        } catch { /* skip */ }
      })
    );

    const campaigns: LinkedInCampaign[] = elements.map((el, i) => {
      const id = campaignIds[i] ?? '';
      const impressions  = (el.impressions as number) ?? 0;
      const clicks       = (el.clicks as number) ?? 0;
      const spend        = parseFloat((el.costInLocalCurrency as string) ?? '0');
      const conversions  = (el.externalWebsiteConversions as number) ?? 0;
      const ctr          = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc          = clicks > 0 ? spend / clicks : 0;
      return {
        campaignId: id,
        name:        nameMap[id]?.name ?? id,
        status:      nameMap[id]?.status ?? '—',
        impressions, clicks, spend, conversions,
        ctr:  parseFloat(ctr.toFixed(2)),
        cpc:  parseFloat(cpc.toFixed(2)),
      };
    });

    // Sort by spend descending
    campaigns.sort((a, b) => b.spend - a.spend);

    res.status(200).json({ campaigns, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('LinkedIn Ads fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn Ads data' });
  }
}
