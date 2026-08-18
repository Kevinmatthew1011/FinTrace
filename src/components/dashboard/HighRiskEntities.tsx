'use client';

import React, { useState, useEffect } from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingState, ErrorState } from '../common/StateViews';
import { RiskLevel } from '@/types/fraud';

interface EntityItem {
  id: string;
  name: string;
  type: string;
  taxIdentifier: string;
  riskScore: number;
  riskLevel: RiskLevel;
  accountsCount: number;
  alertCount: number;
  totalBalanceRupees: number;
  status: string;
}

export const HighRiskEntities: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const [entities, setEntities] = useState<EntityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntities() {
      try {
        const res = await fetch(`/api/v1/entities?limit=${limit}&riskLevel=CRITICAL`);
        const data = await res.json();
        if (data.success) {
          setEntities(data.data);
        } else {
          throw new Error(data.error?.message || 'Error loading entities');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database error');
      } finally {
        setLoading(false);
      }
    }
    loadEntities();
  }, [limit]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>High-Risk Entities (PostgreSQL)</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top subjects queried by composite risk rating</p>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live DB Query</span>
      </div>

      {loading ? (
        <LoadingState message="Loading entities from PostgreSQL..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Entity Name & ID</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Risk Score</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Accounts / Alerts</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Balance</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((e) => (
                <tr
                  key={e.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono">
                      {e.id} • PAN: {e.taxIdentifier}
                    </div>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                    {e.type.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <RiskBadge level={e.riskLevel} score={e.riskScore} />
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                    {e.accountsCount} accs ({e.alertCount} alerts)
                  </td>
                  <td style={{ padding: '10px', fontWeight: 600 }} className="font-mono">
                    ₹{(e.totalBalanceRupees / 100000).toFixed(1)}L
                  </td>
                  <td style={{ padding: '10px' }}>
                    <StatusBadge
                      label={e.status}
                      variant={e.status === 'FROZEN' ? 'danger' : e.status === 'UNDER_INVESTIGATION' ? 'purple' : 'warning'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
