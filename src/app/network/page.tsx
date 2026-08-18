import React from 'react';
import { NetworkPreview } from '@/components/dashboard/NetworkPreview';
import { Header } from '@/components/common/Header';

export default function NetworkPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Fraud Network & Graph Analytics
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Relational graph preview connecting seeded entities, accounts, and transactional flows
        </p>
      </div>

      <NetworkPreview />
    </div>
  );
}
