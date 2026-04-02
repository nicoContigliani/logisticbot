import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'LogisticBot - Logistics Management System',
  description: 'Modern logistics management platform for tracking, inventory, and supply chain operations',
  keywords: ['logistics', 'tracking', 'inventory', 'supply chain', 'management'],
  authors: [{ name: 'LogisticBot' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
