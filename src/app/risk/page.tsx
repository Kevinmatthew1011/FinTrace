import React from 'react';
import { RiskDistribution } from '@/components/dashboard/RiskDistribution';
import { HighRiskEntities } from '@/components/dashboard/HighRiskEntities';
import { Header } from '@/components/common/Header';

export default function RiskPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Risk Intelligence Engine
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Aggregated risk distribution and top critical subjects from PostgreSQL
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
        <RiskDistribution />
        <HighRiskEntities limit={10} />
      </div>
    </div>
  );
}
