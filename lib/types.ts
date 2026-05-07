export type AssetStatus = 'strong' | 'good' | 'warning' | 'below' | 'promote';
export type ContentType = 'ttl' | 'pov' | 'unknown';
export type VideoFormat = 'long-form' | 'short' | 'horizontal' | 'unknown';

export interface AssetEvaluation {
  status: AssetStatus;
  signals: string[];
}

export interface BenchmarkRange {
  min: number;
  max?: number;
}

export interface YouTubeAdRow {
  adName: string;
  creator: string;
  campaign: string;
  format: 'Short' | 'Long-form';
  cost: number;
  impressions: number;
  avgCPM: number;
  trueViewViews: number;
  avgCPV: number;
  instreamVR: number;
  shortsVR: number;
  played25: number;
  played50: number;
  played75: number;
  played100: number;
  interactions: number;
  interactionRate: number;
  earnedSubs: number;
  conversions: number;
  costPerConv: number;
  evaluation?: AssetEvaluation;
}

export interface YouTubeOrganicVideo {
  videoId: string;
  title: string;
  contentType: ContentType;
  format: VideoFormat;
  views: number;
  watchTimeMinutes: number;
  avgViewPercentage: number;
  ctr: number;
  subscribersGained: number;
  evaluation?: AssetEvaluation;
}

export interface TikTokVideo {
  videoId: string;
  title: string;
  views: number;
  profileViews: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  profileViewRate: number;
  evaluation?: AssetEvaluation;
}

export interface InstagramPost {
  mediaId: string;
  caption: string;
  mediaType: 'REEL' | 'IMAGE' | 'VIDEO';
  plays: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  evaluation?: AssetEvaluation;
}

export interface LinkedInPost {
  shareId: string;
  text: string;
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  evaluation?: AssetEvaluation;
}

export interface DashboardSummary {
  narrative: string;
  actionItem: string;
  generatedAt: string;
}

export interface RefreshResult {
  youtubeAds: YouTubeAdRow[];
  youtubeOrganic: YouTubeOrganicVideo[];
  tiktok: TikTokVideo[];
  instagram: InstagramPost[];
  linkedin: LinkedInPost[];
  summary: DashboardSummary;
  refreshedAt: string;
}
