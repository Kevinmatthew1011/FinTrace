import React from 'react';
import { InvestigationSummary } from '@/components/dashboard/InvestigationSummary';
import { Header } from '@/components/common/Header';

export default function InvestigationsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Investigator Case Dossiers
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Active case management with linked entities, alerts, and investigator assignments
        </p>
      </div>

      <InvestigationSummary />
    </div>
  );
}
