import type { NextApiRequest, NextApiResponse } from 'next';
import type { YouTubeAdRow, LinkedInCampaign, MetaCampaign, TikTokAdCampaign, DashboardSummary } from '@/lib/types';

interface SummaryRequest {
  youtubeAds: YouTubeAdRow[];
  linkedinAds: LinkedInCampaign[];
  metaAds: MetaCampaign[];
  tiktokAds: TikTokAdCampaign[];
  dateRange: string;
}

function buildPrompt(data: SummaryRequest): string {
  const toPromote = data.youtubeAds.filter(a => a.evaluation?.status === 'promote');
  const bestCostSub = data.youtubeAds
    .filter(a => a.format === 'Long-form' && a.earnedSubs > 0)
    .sort((a, b) => a.costPerConv - b.costPerConv)[0];

  const liTotalSpend = data.linkedinAds.reduce((s, c) => s + c.spend, 0);
  const liTopCTR = data.linkedinAds.length
    ? Math.max(...data.linkedinAds.map(c => c.ctr)).toFixed(2)
    : 'N/A';

  const metaTotalSpend = data.metaAds.reduce((s, c) => s + c.spend, 0);
  const metaBlendedCTR = (() => {
    const imp = data.metaAds.reduce((s, c) => s + c.impressions, 0);
    const clk = data.metaAds.reduce((s, c) => s + c.clicks, 0);
    return imp > 0 ? (clk / imp * 100).toFixed(2) : 'N/A';
  })();

  const ttTotalSpend = data.tiktokAds.reduce((s, c) => s + c.spend, 0);
  const ttTotalViews = data.tiktokAds.reduce((s, c) => s + c.videoViews, 0);
  const ttTotalImp   = data.tiktokAds.reduce((s, c) => s + c.impressions, 0);
  const ttViewRate   = ttTotalImp > 0 ? (ttTotalViews / ttTotalImp * 100).toFixed(1) : 'N/A';

  return `You are a content performance analyst. Summarize this dashboard data in 2–3 sentences, then give ONE specific action item.

Period: ${data.dateRange}

YouTube Ads (paid):
- ${toPromote.length} short(s) ready to promote to Demand Gen: ${toPromote.map(a => a.adName).join(', ') || 'none'}
- Best long-form cost/sub: ${bestCostSub ? `$${bestCostSub.costPerConv.toFixed(2)} (${bestCostSub.creator})` : 'N/A'}

LinkedIn Ads:
- Total spend: $${liTotalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
- Top campaign CTR: ${liTopCTR}% (benchmark 0.6%)

Meta Ads (FB + IG):
- Total spend: $${metaTotalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
- Blended CTR: ${metaBlendedCTR}% (benchmark 1%)

TikTok Ads:
- Total spend: $${ttTotalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
- Blended video view rate: ${ttViewRate}% (benchmark 30%)

Return JSON: { "narrative": "...", "actionItem": "..." }`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing Groq API key' });

  try {
    const body = req.body as SummaryRequest & { _customPrompt?: string };
    const prompt = body._customPrompt ?? buildPrompt(body);

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!groqRes.ok) throw new Error(`Groq error ${groqRes.status}`);
    const groqData = await groqRes.json();

    const raw: string = groqData.choices?.[0]?.message?.content ?? '';
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
