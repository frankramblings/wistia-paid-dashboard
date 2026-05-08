import type { Metadata } from 'next';
import { Bebas_Neue, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-plex',
  display: 'swap',
});

export const metadata: Metadata = { title: 'Wistia Paid Dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${ibmPlexSans.variable}`}>
      <body className="bg-w-canvas text-w-hi min-h-screen flex font-sans">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 pb-20 sm:pb-8">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
