import type { Metadata } from 'next';
import { Bebas_Neue, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = { title: 'Wistia Performance Dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-bone-bg text-bone-hi min-h-screen flex font-sans">
        {/* Sidebar: hidden on mobile, visible sm+ */}
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 pb-20 sm:pb-8">
          {children}
        </main>
        {/* Bottom nav: visible on mobile only */}
        <MobileNav />
      </body>
    </html>
  );
}
