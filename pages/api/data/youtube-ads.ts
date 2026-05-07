import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { parseSheetRows, evaluateYouTubeAd } from '@/lib/modules/youtube-ads';
import type { YouTubeAdRow } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const sheetId = process.env.YOUTUBE_ADS_SHEET_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sheetId || !serviceAccountJson) {
    return res.status(500).json({ error: 'Missing Google Sheets config' });
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A2:U50',
    });

    const rows: string[][] = (response.data.values as string[][]) ?? [];
    const ads: YouTubeAdRow[] = parseSheetRows(rows).map(ad => ({
      ...ad,
      evaluation: evaluateYouTubeAd(ad),
    }));

    res.status(200).json({ ads, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('YouTube Ads fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube Ads data' });
  }
}
