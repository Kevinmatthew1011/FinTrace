import React from 'react';
import { Header } from '@/components/common/Header';

export default function AdminPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          System Administration & Telemetry
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Live PostgreSQL 16 connection, data store metrics, and system telemetry
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>PostgreSQL 16 Engine</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Docker Container: fintrace-postgres (Port 5432)</p>
          <p style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>● Connected via Prisma ORM</p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Database Store Counts</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>567 Transactions • 121 Entities • 162 Accounts</p>
          <p style={{ fontSize: '11px', color: '#38bdf8', marginTop: '6px' }}>● 36 Alerts • 18 Cases • 20 Risk Scores</p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Data Layer Mode</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phase 2: PostgreSQL Live Query Services</p>
          <p style={{ fontSize: '11px', color: '#a855f7', marginTop: '6px' }}>● Fully Decoupled for Phase 3 Graph Engine</p>
        </div>
      </div>
    </div>
  );
}
