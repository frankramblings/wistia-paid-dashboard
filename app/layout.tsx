import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Breadcrumb from '@/components/Breadcrumb';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = { title: 'Wistia Paid Dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-w-canvas text-w-hi min-h-screen flex font-sans">
        <div className="hidden sm:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 pb-20 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            {children}
          </div>
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
