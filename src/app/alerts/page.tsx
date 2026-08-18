import React from 'react';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
import { Header } from '@/components/common/Header';

export default function AlertsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Fraud Alerts Feed
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Real-time triage queue querying active alerts from PostgreSQL
        </p>
      </div>

      <AlertsSection limit={25} />
    </div>
  );
}
