import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import type { YouTubeAdRow, YouTubeOrganicVideo, TikTokVideo, DashboardSummary } from '@/lib/types';

interface SummaryRequest {
  youtubeAds: YouTubeAdRow[];
  youtubeOrganic: YouTubeOrganicVideo[];
  tiktok: TikTokVideo[];
  dateRange: string;
}

function buildPrompt(data: SummaryRequest): string {
  const toPromote = data.youtubeAds.filter(a => a.evaluation?.status === 'promote');
  const bestCostSub = data.youtubeAds
    .filter(a => a.format === 'Long-form' && a.earnedSubs > 0)
    .sort((a, b) => a.costPerConv - b.costPerConv)[0];

  const avgCTR = data.youtubeOrganic.length
    ? (data.youtubeOrganic.reduce((s, v) => s + v.ctr, 0) / data.youtubeOrganic.length).toFixed(1)
    : 'N/A';

  const avgTTEngagement = data.tiktok.length
    ? (data.tiktok.reduce((s, v) => s + v.engagementRate, 0) / data.tiktok.length).toFixed(1)
    : 'N/A';

  return `You are a content performance analyst. Summarize this dashboard data in 2–3 sentences, then give ONE specific action item.

Period: ${data.dateRange}

YouTube Ads (paid):
- ${toPromote.length} short(s) ready to promote to Demand Gen: ${toPromote.map(a => a.adName).join(', ') || 'none'}
- Best long-form cost/sub: ${bestCostSub ? `$${bestCostSub.costPerConv.toFixed(2)} (${bestCostSub.creator})` : 'N/A'}

YouTube Organic:
- Average CTR: ${avgCTR}% (benchmark 3–5%)
- Videos tracked: ${data.youtubeOrganic.length}

TikTok:
- Average engagement rate: ${avgTTEngagement}% (benchmark 4–8%)
- Videos tracked: ${data.tiktok.length}

Return JSON: { "narrative": "...", "actionItem": "..." }`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing Anthropic API key' });

  try {
    const body = req.body as SummaryRequest;
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: buildPrompt(body) }],
    });

    const raw = (message.content[0] as { text: string }).text;
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}');

    const summary: DashboardSummary = {
      narrative:   parsed.narrative   ?? 'Summary unavailable.',
      actionItem:  parsed.actionItem  ?? '',
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
}
