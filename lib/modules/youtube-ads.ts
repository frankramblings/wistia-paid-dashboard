import type { YouTubeAdRow, AssetEvaluation } from '../types';

function parseNumber(val: string): number {
  if (!val || val === '—') return 0;
  return parseFloat(val.replace(/[$,%]/g, '').replace(/,/g, ''));
}

export function parseSheetRows(rows: string[][]): YouTubeAdRow[] {
  if (rows.length < 2) return [];
  const [headers, ...dataRows] = rows;
  const idx = (name: string) => headers.findIndex(h => h.trim() === name.trim());

  return dataRows
    .filter(row => row[0] && !row[0].startsWith('TOTAL'))
    .map(row => ({
      adName:          row[idx('Ad Name')] ?? '',
      creator:         row[idx('Creator')] ?? '',
      campaign:        row[idx('Campaign')] ?? '',
      format:          (row[idx('Format')] ?? '') as 'Short' | 'Long-form',
      cost:            parseNumber(row[idx('Cost')]),
      impressions:     parseNumber(row[idx('Impressions')]),
      avgCPM:          parseNumber(row[idx('Avg CPM')]),
      trueViewViews:   parseNumber(row[idx('TrueView Views')]),
      avgCPV:          parseNumber(row[idx('Avg CPV')]),
      instreamVR:      parseNumber(row[idx('In-stream VR')]),
      shortsVR:        parseNumber(row[idx('Shorts VR')]),
      played25:        parseNumber(row[idx('Played 25%')]),
      played50:        parseNumber(row[idx('Played 50%')]),
      played75:        parseNumber(row[idx('Played 75%')]),
      played100:       parseNumber(row[idx('Played 100%')]),
      interactions:    parseNumber(row[idx('Interactions')]),
      interactionRate: parseNumber(row[idx('Interaction Rate')]),
      earnedSubs:      parseNumber(row[idx('Earned Subs')]),
      conversions:     parseNumber(row[idx('Conversions')]),
      costPerConv:     parseNumber(row[idx('Cost/Conv.')]),
    }));
}

export function evaluateYouTubeAd(ad: YouTubeAdRow): AssetEvaluation {
  if (ad.format === 'Short') {
    const completionOk  = ad.played100       >= 40;
    const interactionOk = ad.interactionRate >= 50;
    if (completionOk && interactionOk) {
      return { status: 'promote', signals: [`${ad.played100.toFixed(1)}% completion`, `${ad.interactionRate.toFixed(1)}% interaction`] };
    }
    if (completionOk || interactionOk) {
      return { status: 'warning', signals: [`${ad.played100.toFixed(1)}% completion`, `${ad.interactionRate.toFixed(1)}% interaction`] };
    }
    return { status: 'good', signals: [`${ad.played100.toFixed(1)}% completion`] };
  }
  // Long-form
  if (ad.earnedSubs > 0) {
    return { status: 'good', signals: [`$${ad.costPerConv.toFixed(2)}/sub`] };
  }
  return { status: 'warning', signals: ['no subs yet'] };
}
