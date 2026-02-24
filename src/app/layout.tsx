import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MagePanelProvider } from '@/contexts/MagePanelContext';
import MagePanel from '@/components/layout/MagePanel';

export const metadata: Metadata = {
  title: 'BGIN AI — Governance Intelligence',
  description: 'Three graphs, one identity. Sovereign governance intelligence for the BGIN constellation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <MagePanelProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <MagePanel />
        </MagePanelProvider>
      </body>
    </html>
  );
}
