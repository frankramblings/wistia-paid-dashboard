'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const SIDEBAR_BG  = '#233293';
const TEXT_ACTIVE = '#233293';
const TEXT_IDLE   = '#edeff6';

// Outline/stroke icons ────────────────────────────────────────────────────────

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
      <line x1="18" x2="18" y1="20" y2="10"/>
      <line x1="12" x2="12" y1="20" y2="4"/>
      <line x1="6"  x2="6"  y1="20" y2="14"/>
    </svg>
  );
}

function BenchmarksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
      <line x1="8" y1="9"  x2="10" y2="9"/>
    </svg>
  );
}

function LoopsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
      <polyline points="1 4 1 10 7 10"/>
      <polyline points="23 20 23 14 17 14"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  );
}

// Brand platform icons ────────────────────────────────────────────────────────

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] shrink-0">
      <path d="M23.5 6.2a3.03 3.03 0 0 0-2.13-2.14C19.51 3.6 12 3.6 12 3.6s-7.51 0-9.37.48A3.03 3.03 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.03 3.03 0 0 0 2.13 2.14C4.49 20.4 12 20.4 12 20.4s7.51 0 9.37-.46A3.03 3.03 0 0 0 23.5 17.8C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.6V8.4L15.87 12 9.6 15.6z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] shrink-0">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 290 191" fill="currentColor" className="w-[18px] h-[18px] shrink-0">
      <path d="m31.06,125.96c0,10.98 2.41,19.41 5.56,24.51 4.13,6.68 10.29,9.51 16.57,9.51 8.1,0 15.51-2.01 29.79-21.76 11.44-15.83 24.92-38.05 33.99-51.98l15.36-23.6c10.67-16.39 23.02-34.61 37.18-46.96 11.56-10.08 24.03-15.68 36.58-15.68 21.07,0 41.14,12.21 56.5,35.11 16.81,25.08 24.97,56.67 24.97,89.27 0,19.38-3.82,33.62-10.32,44.87-6.28,10.88-18.52,21.75-39.11,21.75l0-31.02c17.63,0 22.03-16.2 22.03-34.74 0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75-15.95,21.24-29.57,29.29-47.5,29.29-21.27,0-34.72-9.21-43.05-23.09-6.8-11.31-10.14-26.15-10.14-43.06z"/>
      <path d="m24.49,37.3c14.24-21.95 34.79-37.3 58.36-37.3 13.65,0 27.22,4.04 41.39,15.61 15.5,12.65 32.02,33.48 52.63,67.81l7.39,12.32c17.84,29.72 27.99,45.01 33.93,52.22 7.64,9.26 12.99,12.02 19.94,12.02 17.63,0 22.03-16.2 22.03-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87-6.28,10.88-18.52,21.75-39.11,21.75-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71l-25.79-43.08c-12.94-21.62-24.81-37.74-31.68-45.04-7.39-7.85-16.89-17.33-32.05-17.33-12.27,0-22.69,8.61-31.41,21.78z"/>
      <path d="m82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78-12.33,18.61-19.88,46.33-19.88,72.95 0,10.98 2.41,19.41 5.56,24.51l-26.48,17.44c-6.8-11.31-10.14-26.15-10.14-43.06 0-30.75 8.44-62.8 24.49-87.55 14.24-21.95 34.79-37.3 58.36-37.3z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] shrink-0">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.84a8.23 8.23 0 0 0 4.84 1.54V6.9a4.85 4.85 0 0 1-1.07-.21z"/>
    </svg>
  );
}

const NAV = [
  { label: 'Overview',      href: '/',               Icon: OverviewIcon },
  { label: 'YouTube',        href: '/paid',           Icon: YouTubeIcon },
  { label: 'LinkedIn',       href: '/paid/linkedin',  Icon: LinkedInIcon },
  { label: 'Meta (FB+IG)',   href: '/paid/meta',      Icon: MetaIcon },
  { label: 'TikTok',         href: '/paid/tiktok',    Icon: TikTokIcon },
  { label: 'Benchmarks',     href: '/benchmarks',     Icon: BenchmarksIcon },
  { label: 'Learning Loops', href: '/learning-loops', Icon: LoopsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col overflow-y-auto"
      style={{ background: SIDEBAR_BG }}
    >
      {/* Logo */}
      <div className="px-5 py-5 shrink-0">
        <Image
          src="/wistia-logo.png"
          alt="Wistia"
          width={88}
          height={22}
          className="object-contain object-left brightness-0 invert"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 pb-4 overflow-y-auto space-y-0.5">
        {NAV.map(({ label, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-full text-[15px] font-medium leading-none transition-colors"
              style={
                active
                  ? { background: '#ffffff', color: TEXT_ACTIVE }
                  : { color: TEXT_IDLE }
              }
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
