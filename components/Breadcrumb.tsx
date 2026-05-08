'use client';
import { usePathname } from 'next/navigation';

const CRUMB_MAP: Record<string, { section: string; page: string }> = {
  '/paid':            { section: 'Paid Ads', page: 'YouTube' },
  '/paid/linkedin':   { section: 'Paid Ads', page: 'LinkedIn' },
  '/paid/meta':       { section: 'Paid Ads', page: 'Meta (FB + IG)' },
  '/paid/tiktok':     { section: 'Paid Ads', page: 'TikTok' },
  '/benchmarks':      { section: 'Intelligence', page: 'Benchmarks' },
  '/learning-loops':  { section: 'Intelligence', page: 'Learning Loops' },
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const crumb = pathname ? CRUMB_MAP[pathname] : undefined;
  if (!crumb) return null;

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-w-mid mb-5">
      <span>Analytics</span>
      <span className="text-w-border select-none">/</span>
      <span>{crumb.section}</span>
      <span className="text-w-border select-none">/</span>
      <span className="text-w-hi font-medium">{crumb.page}</span>
    </nav>
  );
}
