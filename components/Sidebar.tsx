'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { section: null,          label: 'Overview',         href: '/' },
  { section: 'CONTENT',    label: 'TTL (w/ Guest)',    href: '/content/ttl' },
  { section: null,          label: 'POV (Savage-Only)', href: '/content/pov' },
  { section: 'PAID',        label: 'YT Ads',            href: '/paid' },
  { section: 'BY PLATFORM', label: 'YouTube',           href: '/platform/youtube' },
  { section: null,          label: 'TikTok',            href: '/platform/tiktok' },
  { section: null,          label: 'Instagram',         href: '/platform/instagram' },
  { section: null,          label: 'LinkedIn',          href: '/platform/linkedin' },
  { section: 'INTELLIGENCE',label: 'Benchmarks',        href: '/benchmarks' },
  { section: null,          label: 'Learning Loops',    href: '/learning-loops' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-44 shrink-0 bg-gray-950 border-r border-gray-800 h-screen sticky top-0 py-4 overflow-y-auto">
      <div className="px-4 pb-4 text-blue-400 text-xs font-bold tracking-widest uppercase">
        Wistia
      </div>
      {NAV.map(({ section, label, href }) => (
        <div key={href}>
          {section && (
            <div className="px-4 pt-3 pb-1 text-gray-600 text-xs tracking-widest uppercase">
              {section}
            </div>
          )}
          <Link
            href={href}
            className={`block px-4 py-2 text-sm transition-colors ${
              pathname === href
                ? 'text-red-400 bg-red-950/30 border-l-2 border-red-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            {label}
          </Link>
        </div>
      ))}
    </aside>
  );
}
