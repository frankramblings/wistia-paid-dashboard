import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { evaluateYouTubeOrganic } from '@/lib/modules/youtube-organic';
import { classifyContentType, classifyVideoFormat } from '@/lib/content-map';
import type { YouTubeOrganicVideo } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const startDate = (req.query.startDate as string) ?? '2026-03-01';
  const endDate   = (req.query.endDate   as string) ?? '2026-04-30';

  const clientId     = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(500).json({ error: 'Missing Google OAuth config' });
  }

  try {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });

    const yt = google.youtubeAnalytics({ version: 'v2', auth: oauth2 });
    const response = await yt.reports.query({
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewPercentage,annotationClickThroughRate,subscribersGained',
      dimensions: 'video',
      sort: '-views',
      maxResults: 50,
    });

    const ytData = google.youtube({ version: 'v3', auth: oauth2 });
    const rows = response.data.rows ?? [];
    const videoIds = rows.map((r: unknown[]) => r[0] as string);

    let titleMap: Record<string, string> = {};
    if (videoIds.length > 0) {
      const videoRes = await ytData.videos.list({
        part: ['snippet', 'contentDetails'],
        id: videoIds,
      });
      for (const item of videoRes.data.items ?? []) {
        const duration = item.contentDetails?.duration ?? '';
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const seconds = match
          ? (parseInt(match[1] ?? '0') * 3600 + parseInt(match[2] ?? '0') * 60 + parseInt(match[3] ?? '0'))
          : undefined;
        titleMap[item.id!] = `${item.snippet?.title ?? ''}|||${seconds ?? ''}`;
      }
    }

    const videos: YouTubeOrganicVideo[] = rows.map((row: unknown[]) => {
      const videoId = row[0] as string;
      const titleRaw = titleMap[videoId] ?? '|||';
      const [title, secStr] = titleRaw.split('|||');
      const durationSec = secStr ? parseInt(secStr) : undefined;
      const format = classifyVideoFormat(title, durationSec);
      const contentType = classifyContentType(title, videoId);

      const video: YouTubeOrganicVideo = {
        videoId,
        title: title || videoId,
        contentType,
        format,
        views:              parseInt(row[1] as string) || 0,
        watchTimeMinutes:   parseFloat(row[2] as string) || 0,
        avgViewPercentage:  parseFloat(row[3] as string) || 0,
        ctr:                parseFloat(row[4] as string) || 0,
        subscribersGained:  parseInt(row[5] as string) || 0,
      };
      return { ...video, evaluation: evaluateYouTubeOrganic(video) };
    });

    res.status(200).json({ videos, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error('YouTube Organic fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube Organic data' });
  }
}
