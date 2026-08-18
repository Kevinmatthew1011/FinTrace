'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingState, ErrorState } from '../common/StateViews';

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  priority: string;
  status: string;
  assignedInvestigator: string;
  alertCount: number;
}

export const InvestigationSummary: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await fetch('/api/v1/investigations?limit=6');
        const data = await res.json();
        if (data.success) {
          setCases(data.data);
        } else {
          throw new Error(data.error?.message || 'Error loading cases');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database error');
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

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
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Investigator Case Management (PostgreSQL)
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live database case dossiers and active forensic reviews</p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading cases from PostgreSQL..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Case ID & Title</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Priority</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Assigned Investigator</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Linked Alerts</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono">
                      {c.caseNumber}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <StatusBadge
                      label={c.priority}
                      variant={c.priority === 'URGENT' || c.priority === 'CRITICAL' ? 'danger' : 'warning'}
                    />
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                    {c.assignedInvestigator}
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                    {c.alertCount} alerts
                  </td>
                  <td style={{ padding: '10px' }}>
                    <StatusBadge
                      label={c.status.replace('_', ' ')}
                      variant={c.status === 'UNDER_REVIEW' || c.status === 'IN_REVIEW' ? 'purple' : c.status === 'OPEN' ? 'info' : 'success'}
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
