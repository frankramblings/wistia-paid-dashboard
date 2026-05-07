import type { ContentType, VideoFormat } from './types';

// Add video IDs here for titles that don't follow TTL_/POV_ prefix convention
const MANUAL_OVERRIDES: Record<string, ContentType> = {
  'manual-ttl-id': 'ttl',
};

export function classifyContentType(title: string, videoId?: string): ContentType {
  if (videoId && MANUAL_OVERRIDES[videoId]) return MANUAL_OVERRIDES[videoId];
  const upper = title.toUpperCase();
  if (upper.startsWith('TTL_') || upper.startsWith('TTL ')) return 'ttl';
  if (upper.startsWith('POV_') || upper.startsWith('POV ')) return 'pov';
  return 'unknown';
}

export function classifyVideoFormat(title: string, durationSeconds?: number): VideoFormat {
  const upper = title.toUpperCase();
  if (upper.includes('SHORT')) return 'short';
  if (upper.includes('HORIZONTAL') || upper.includes('CLIP')) return 'horizontal';
  if (durationSeconds !== undefined) {
    if (durationSeconds < 180) return 'short';
    if (durationSeconds >= 600) return 'long-form';
  }
  return 'unknown';
}
