'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M23.5 6.2a3.03 3.03 0 0 0-2.13-2.14C19.51 3.6 12 3.6 12 3.6s-7.51 0-9.37.48A3.03 3.03 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.03 3.03 0 0 0 2.13 2.14C4.49 20.4 12 20.4 12 20.4s7.51 0 9.37-.46A3.03 3.03 0 0 0 23.5 17.8C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.6V8.4L15.87 12 9.6 15.6z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.195 0 11.755 0 14.009c0 1.129.353 2.543 1.196 3.431.845.89 1.965 1.26 3.04 1.26 1.527 0 2.745-.924 3.815-2.014 1.07-1.088 2.11-2.64 3.265-4.602l1.33 2.214c1.02 1.7 1.857 2.905 2.77 3.786.912.88 1.93 1.42 3.17 1.416 1.28 0 2.472-.45 3.343-1.476C22.538 16.84 23 15.4 23 13.97c0-1.898-.666-4.032-1.868-5.803C19.932 6.42 18.345 5.2 16.5 5.2c-1.12 0-2.127.547-3.012 1.416-.885.869-1.748 2.14-2.726 3.847l-.457.773c-.932 1.577-1.723 2.79-2.558 3.65-.835.86-1.59 1.314-2.247 1.314-.648 0-1.18-.35-1.54-.806-.36-.454-.56-1.104-.56-1.884 0-1.808.572-4.059 1.547-5.55.975-1.49 1.726-2.019 2.392-2.019.422 0 .835.136 1.232.42.396.285.78.7 1.16 1.273l1.05-1.772A6.05 6.05 0 0 0 8.87 5.12 4.95 4.95 0 0 0 6.91 4.03h.005zm9.58 1.17c1.12 0 2.24.756 3.075 2.062.835 1.306 1.432 3.146 1.432 4.706 0 1.038-.254 1.94-.68 2.555-.427.614-.982.93-1.632.93-.73 0-1.402-.413-2.159-1.232-.756-.82-1.59-2.105-2.572-3.87l-.546-.924c.909-1.55 1.718-2.698 2.527-3.488.808-.79 1.527-1.14 2.555-1.14z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.84a8.23 8.23 0 0 0 4.84 1.54V6.9a4.85 4.85 0 0 1-1.07-.21z"/>
    </svg>
  );
}

function BenchmarksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M3 3h18v2H3V3zm0 8h18v2H3v-2zm0 8h18v2H3v-2zm0-4h10v2H3v-2zm0-8h10v2H3V7z"/>
    </svg>
  );
}

function LoopsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
    </svg>
  );
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  );
}

const NAV = [
  { section: null,           label: 'Overview',      href: '/',               Icon: OverviewIcon },
  { section: 'Paid',         label: 'YouTube',        href: '/paid',           Icon: YouTubeIcon },
  { section: null,           label: 'LinkedIn',       href: '/paid/linkedin',  Icon: LinkedInIcon },
  { section: null,           label: 'Meta (FB+IG)',   href: '/paid/meta',      Icon: MetaIcon },
  { section: null,           label: 'TikTok',         href: '/paid/tiktok',    Icon: TikTokIcon },
  { section: 'Intelligence', label: 'Benchmarks',     href: '/benchmarks',     Icon: BenchmarksIcon },
  { section: null,           label: 'Learning Loops', href: '/learning-loops', Icon: LoopsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-[200px] shrink-0 h-screen sticky top-0 flex flex-col overflow-y-auto bg-w-blue">
      <div className="px-5 py-5 shrink-0">
        <Image
          src="/wistia-logo.png"
          alt="Wistia"
          width={90}
          height={24}
          className="object-contain object-left brightness-0 invert"
          priority
        />
      </div>

      <nav className="flex-1 px-3 pb-4">
        {NAV.map(({ section, label, href, Icon }) => {
          const active = pathname === href;
          return (
            <div key={href}>
              {section && (
                <div className="px-3 pt-5 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-white/50">
                  {section}
                </div>
              )}
              <Link
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-full transition-colors ${
                  active
                    ? 'bg-white text-w-blue font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="shrink-0 flex items-center justify-center w-[18px]">
                  <Icon />
                </span>
                <span className="text-[11px] font-medium leading-tight">{label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
