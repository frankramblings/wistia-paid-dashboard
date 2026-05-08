import type { NextApiRequest, NextApiResponse } from 'next';
import type { YouTubeAdRow, LinkedInCampaign, MetaCampaign, TikTokAdCampaign, DashboardSummary } from '@/lib/types';

interface SummaryRequest {
  youtubeAds: YouTubeAdRow[];
  linkedinAds: LinkedInCampaign[];
  metaAds: MetaCampaign[];
  tiktokAds: TikTokAdCampaign[];
  dateRange: string;
}

function fmt$(n: number) { return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`; }
function cpm(spend: number, imp: number) { return imp > 0 ? (spend / imp * 1000) : 0; }
function pct(a: number, b: number) { return b > 0 ? (a / b * 100).toFixed(1) : 'N/A'; }
function vs(val: number, benchmark: number, higherBetter: boolean) {
  const above = val > benchmark;
  return above === higherBetter ? `✓ ${higherBetter ? 'above' : 'below'} benchmark` : `✗ ${higherBetter ? 'below' : 'above'} benchmark`;
}

function buildPrompt(data: SummaryRequest): string {
  // ── YouTube ──────────────────────────────────────────
  const ytSpend = data.youtubeAds.reduce((s, a) => s + a.cost, 0);
  const toPromote = data.youtubeAds.filter(a => a.evaluation?.status === 'promote');
  const bestSub = data.youtubeAds.filter(a => a.earnedSubs > 0).sort((a, b) => a.costPerConv - b.costPerConv)[0];
  const worstCPV = data.youtubeAds.filter(a => a.avgCPV > 0).sort((a, b) => b.avgCPV - a.avgCPV)[0];
  const bestCompletion = data.youtubeAds.sort((a, b) => b.played100 - a.played100)[0];

  // ── LinkedIn ─────────────────────────────────────────
  const liSpend = data.linkedinAds.reduce((s, c) => s + c.spend, 0);
  const liImp   = data.linkedinAds.reduce((s, c) => s + c.impressions, 0);
  const liClk   = data.linkedinAds.reduce((s, c) => s + c.clicks, 0);
  const liTopCampaign = [...data.linkedinAds].sort((a, b) => b.ctr - a.ctr)[0];
  const liLowCTR = data.linkedinAds.filter(c => c.impressions > 5000 && c.ctr < 0.3);
  const liCPM = cpm(liSpend, liImp);
  const liBlendedCTR = liImp > 0 ? (liClk / liImp * 100) : 0;

  // ── Meta ─────────────────────────────────────────────
  const metaSpend = data.metaAds.reduce((s, c) => s + c.spend, 0);
  const metaImp   = data.metaAds.reduce((s, c) => s + c.impressions, 0);
  const metaClk   = data.metaAds.reduce((s, c) => s + c.clicks, 0);
  const metaCTR   = metaImp > 0 ? (metaClk / metaImp * 100) : 0;
  const metaCPM   = cpm(metaSpend, metaImp);
  const metaBest  = [...data.metaAds].sort((a, b) => b.ctr - a.ctr)[0];
  const metaEng   = data.metaAds.filter(c => c.objective?.includes('ENGAGEMENT'));
  const metaTraf  = data.metaAds.filter(c => c.objective?.includes('TRAFFIC'));
  const metaEngCPM  = cpm(metaEng.reduce((s,c)=>s+c.spend,0), metaEng.reduce((s,c)=>s+c.impressions,0));
  const metaTrafCPM = cpm(metaTraf.reduce((s,c)=>s+c.spend,0), metaTraf.reduce((s,c)=>s+c.impressions,0));

  // ── TikTok ───────────────────────────────────────────
  const ttSpend = data.tiktokAds.reduce((s, c) => s + c.spend, 0);
  const ttImp   = data.tiktokAds.reduce((s, c) => s + c.impressions, 0);
  const ttViews = data.tiktokAds.reduce((s, c) => s + c.videoViews, 0);
  const ttCPV   = ttViews > 0 ? ttSpend / ttViews : 0;
  const ttBest  = [...data.tiktokAds].sort((a, b) => {
    const ra = a.impressions > 0 ? a.videoViews / a.impressions : 0;
    const rb = b.impressions > 0 ? b.videoViews / b.impressions : 0;
    return rb - ra;
  })[0];
  const ttWorst = [...data.tiktokAds].sort((a, b) => {
    const ra = a.impressions > 0 ? a.videoViews / a.impressions : 0;
    const rb = b.impressions > 0 ? b.videoViews / b.impressions : 0;
    return ra - rb;
  })[0];
  const ttViewRate = parseFloat(pct(ttViews, ttImp));

  return `You are a blunt paid media analyst. Using ONLY the numbers below, write a 2-sentence narrative that cites specific dollar amounts, percentages, and campaign names. Then give ONE action item that names the exact campaign and exact action (e.g. "Pause X and reallocate $Y to Z").

HARD RULES — violating any of these makes the output useless:
- Every sentence must contain at least one specific number ($, %, or ratio).
- Name actual campaigns, not "some campaigns" or "certain platforms".
- Do NOT write: "mixed performance", "various platforms", "consider", "may want to", "could potentially".
- Action item must be ONE sentence with a specific campaign name, metric, and action.

Period: ${data.dateRange}

YOUTUBE (${fmt$(ytSpend)} spend):
- Shorts ready for Demand Gen: ${toPromote.length > 0 ? toPromote.map(a => `"${a.adName}"`).join(', ') : 'none'}
- Best cost/sub: ${bestSub ? `$${bestSub.costPerConv.toFixed(2)} — "${bestSub.adName}"` : 'N/A'} (benchmark $5.00)
- Worst CPV: ${worstCPV ? `$${worstCPV.avgCPV.toFixed(3)} — "${worstCPV.adName}"` : 'N/A'} (benchmark $0.030)
- Best completion: ${bestCompletion ? `${bestCompletion.played100.toFixed(0)}% — "${bestCompletion.adName}"` : 'N/A'} (benchmark 40%)

LINKEDIN (${fmt$(liSpend)} spend):
- Blended CTR: ${liBlendedCTR.toFixed(2)}% ${vs(liBlendedCTR, 0.6, true)} (0.6%)
- Blended CPM: $${liCPM.toFixed(2)} ${vs(liCPM, 50, false)} ($50)
- Top campaign: ${liTopCampaign ? `"${liTopCampaign.name}" at ${liTopCampaign.ctr.toFixed(2)}% CTR` : 'N/A'}
- Campaigns below 0.3% CTR: ${liLowCTR.length} ${liLowCTR.length > 0 ? `(${liLowCTR.map(c => `"${c.name}"`).join(', ')})` : ''}

META (${fmt$(metaSpend)} spend):
- Blended CTR: ${metaCTR.toFixed(2)}% ${vs(metaCTR, 1.0, true)} (1.0%)
- Blended CPM: $${metaCPM.toFixed(2)} ${vs(metaCPM, 8, false)} ($8)
- Best campaign: ${metaBest ? `"${metaBest.name}" at ${metaBest.ctr.toFixed(2)}% CTR` : 'N/A'}
${metaEngCPM > 0 && metaTrafCPM > 0 ? `- Engagement CPM $${metaEngCPM.toFixed(2)} vs Traffic CPM $${metaTrafCPM.toFixed(2)} (${(metaTrafCPM / metaEngCPM).toFixed(1)}x difference)` : ''}

TIKTOK (${fmt$(ttSpend)} spend):
- Blended view rate: ${pct(ttViews, ttImp)}% ${vs(ttViewRate, 30, true)} (30%)
- Cost/view: ${ttCPV > 0 ? `$${ttCPV.toFixed(4)}` : 'N/A'} ${ttCPV > 0 ? vs(ttCPV, 0.02, false) : ''} ($0.020)
- Best: ${ttBest ? `"${ttBest.name}" at ${pct(ttBest.videoViews, ttBest.impressions)}% view rate` : 'N/A'}
- Worst: ${ttWorst && ttWorst !== ttBest ? `"${ttWorst.name}" at ${pct(ttWorst.videoViews, ttWorst.impressions)}% view rate` : 'N/A'}

Return JSON only — no markdown, no extra text:
{
  "insights": [
    "1 sentence with a specific number and campaign name",
    "1 sentence with a specific number and campaign name",
    "1 sentence with a specific number and campaign name"
  ],
  "actionItem": "1 sentence naming the exact campaign + exact action + dollar amount if relevant"
}`;
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
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!groqRes.ok) throw new Error(`Groq error ${groqRes.status}`);
    const groqData = await groqRes.json();

    const raw: string = groqData.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}');

    const summary: DashboardSummary = {
      insights:   Array.isArray(parsed.insights) ? parsed.insights : parsed.narrative ? [parsed.narrative] : ['Summary unavailable.'],
      actionItem: parsed.actionItem ?? '',
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
}
