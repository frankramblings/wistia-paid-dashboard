import { evaluateYouTubeAd, parseSheetRows } from '@/lib/modules/youtube-ads';
import type { YouTubeAdRow } from '@/lib/types';

const shortBase: YouTubeAdRow = {
  adName: 'TTL_Short 1_Amanda', creator: 'Amanda Natividad',
  campaign: 'Video Views', format: 'Short',
  cost: 155, impressions: 17989, avgCPM: 8.66, trueViewViews: 8719,
  avgCPV: 0.018, instreamVR: 77.23, shortsVR: 12.72,
  played25: 58.95, played50: 51.73, played75: 47.92,
  played100: 45.78, interactions: 10492, interactionRate: 58.32,
  earnedSubs: 0, conversions: 0, costPerConv: 0,
};

describe('evaluateYouTubeAd — Shorts', () => {
  it('returns promote when completion >= 40 AND interaction >= 50', () => {
    const result = evaluateYouTubeAd(shortBase);
    expect(result.status).toBe('promote');
    expect(result.signals).toContain('45.8% completion');
  });

  it('returns warning when only one threshold met', () => {
    const result = evaluateYouTubeAd({ ...shortBase, played100: 35, interactionRate: 55 });
    expect(result.status).toBe('warning');
  });

  it('returns good when neither threshold met', () => {
    const result = evaluateYouTubeAd({ ...shortBase, played100: 20, interactionRate: 30 });
    expect(result.status).toBe('good');
  });
});

describe('evaluateYouTubeAd — Long-form', () => {
  it('returns good when cost per sub is low', () => {
    const longForm: YouTubeAdRow = { ...shortBase, format: 'Long-form', earnedSubs: 504, costPerConv: 0.66 };
    const result = evaluateYouTubeAd(longForm);
    expect(result.status).toBe('good');
    expect(result.signals).toContain('$0.66/sub');
  });

  it('returns warning when no subs yet', () => {
    const longForm: YouTubeAdRow = { ...shortBase, format: 'Long-form', earnedSubs: 0, costPerConv: 0 };
    expect(evaluateYouTubeAd(longForm).status).toBe('warning');
  });
});

describe('parseSheetRows', () => {
  it('parses a raw sheet row into YouTubeAdRow', () => {
    const headers = ['Ad Name','Creator','Campaign','Format','Cost','Impressions','Avg CPM',
      'TrueView Views','Avg CPV','In-stream VR','In-feed VR','Shorts VR',
      'Played 25%','Played 50%','Played 75%','Played 100%',
      'Interactions','Interaction Rate','Earned Subs','Conversions','Cost/Conv.'];
    const row = ['TTL_Short 1_Amanda','Amanda Natividad','Video Views','Short',
      '$155.81','17,989','$8.66','8,719','$0.018','77.23%','2.58%','12.72%',
      '58.95%','51.73%','47.92%','45.78%','10,492','58.32%','—','—','—'];
    const result = parseSheetRows([headers, row]);
    expect(result).toHaveLength(1);
    expect(result[0].format).toBe('Short');
    expect(result[0].played100).toBeCloseTo(45.78);
    expect(result[0].earnedSubs).toBe(0);
  });
});
