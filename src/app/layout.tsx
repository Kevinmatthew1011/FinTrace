import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/common/Sidebar';

export const metadata: Metadata = {
  title: 'FinTrace | AI-Powered Financial Fraud Intelligence Platform',
  description: 'Financial fraud network detection, graph analysis, and explainable risk intelligence built for SIH 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <main className="page-wrapper">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
