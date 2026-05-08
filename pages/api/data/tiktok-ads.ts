import type { NextApiRequest, NextApiResponse } from 'next';
import type { TikTokAdCampaign } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  const advertiserId = process.env.TIKTOK_ADVERTISER_ID;

  if (!accessToken || !advertiserId) {
    return res.status(200).json({ campaigns: [], status: 'not_configured' });
  }

  const now = new Date();
  const days = parseInt(req.query.days as string ?? '0', 10);

  const effectiveDays = days > 0 ? days : 30;
  const since = new Date(now.getTime() - effectiveDays * 86400000);
  const startDate = since.toISOString().slice(0, 10);
  const endDate = now.toISOString().slice(0, 10);

  const body = {
    advertiser_id: advertiserId,
    report_type: 'BASIC',
    dimensions: ['campaign_id'],
    metrics: [
      'campaign_name',
      'spend',
      'impressions',
      'clicks',
      'ctr',
      'cpc',
      'total_purchase',
      'video_play_actions',
    ],
    data_level: 'AUCTION_CAMPAIGN',
    start_date: startDate,
    end_date: endDate,
    page_size: 20,
  };

  try {
    const apiRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/', {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await apiRes.json() as Record<string, unknown>;

    if (json.code !== 0) {
      return res.status(200).json({ error: json.message ?? 'TikTok API error' });
    }

    const dataObj = json.data as Record<string, unknown> | undefined;
    const list = (dataObj?.list as Record<string, unknown>[]) ?? [];

    const campaigns: TikTokAdCampaign[] = list.map((item) => {
      const dimensions = (item.dimensions as Record<string, unknown>) ?? {};
      const metrics = (item.metrics as Record<string, unknown>) ?? {};

      const spend = parseFloat((metrics.spend as string) ?? '0');
      const impressions = parseInt((metrics.impressions as string) ?? '0', 10);
      const clicks = parseInt((metrics.clicks as string) ?? '0', 10);
      const ctr = parseFloat((metrics.ctr as string) ?? '0');
      const cpc = parseFloat((metrics.cpc as string) ?? '0');
      const conversions = parseInt((metrics.total_purchase as string) ?? '0', 10);
      const videoViews = parseInt((metrics.video_play_actions as string) ?? '0', 10);

      return {
        campaignId: dimensions.campaign_id as string ?? '',
        name: metrics.campaign_name as string ?? '',
        status: '',
        impressions,
        clicks,
        spend,
        ctr,
        cpc,
        conversions,
        videoViews,
      };
    });

    campaigns.sort((a, b) => b.spend - a.spend);

    return res.status(200).json({ campaigns, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('TikTok Ads fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch TikTok Ads data' });
  }
}
