import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MagePanelProvider } from '@/contexts/MagePanelContext';
import MagePanel from '@/components/layout/MagePanel';

export const metadata: Metadata = {
  title: 'BGIN AI — Governance Intelligence',
  description: 'Three graphs, one identity. Sovereign governance intelligence for the BGIN constellation.',
  icons: { icon: '/icon' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <MagePanelProvider>
          <Header />
          <div className="flex-1 min-h-0 flex flex-col">{children}</div>
          <Footer />
          <MagePanel />
        </MagePanelProvider>
      </body>
    </html>
  );
}
