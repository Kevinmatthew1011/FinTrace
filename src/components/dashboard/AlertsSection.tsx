'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingState, ErrorState } from '../common/StateViews';
import { RiskLevel, AlertStatus } from '@/types/fraud';

interface AlertItem {
  id: string;
  alertNumber: string;
  title: string;
  description: string;
  typology: string;
  severity: RiskLevel;
  status: AlertStatus;
  sourceEntityName?: string;
  indicators: string[];
  caseId?: string;
  caseNumber?: string;
}

export const AlertsSection: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingAlertId, setOpeningAlertId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await fetch(`/api/v1/alerts?limit=${limit}`);
        const data = await res.json();
        if (data.success) {
          setAlerts(data.data);
        } else {
          throw new Error(data.error?.message || 'Error loading alerts');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database error');
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, [limit]);

  const handleCreateOrOpenInvestigation = async (targetAlert: AlertItem) => {
    setOpeningAlertId(targetAlert.id);
    try {
      const res = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: targetAlert.id }),
      });

      const data = await res.json();
      if (data.success && data.data?.caseDetails?.id) {
        router.push(`/investigations/${data.data.caseDetails.id}`);
      } else {
        alert(data.error?.message || 'Error initializing investigation case');
      }
    } catch {
      alert('Network error communicating with case service');
    } finally {
      setOpeningAlertId(null);
    }
  };

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
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Live Fraud Alerts (PostgreSQL)</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automated detection rules stored in database</p>
        </div>
        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>● Active Queue</span>
      </div>

      {loading ? (
        <LoadingState message="Loading alerts from PostgreSQL..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-secondary)',
                border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {alert.alertNumber}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {alert.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RiskBadge level={alert.severity} />
                  <StatusBadge
                    label={alert.status}
                    variant={alert.status === 'NEW' ? 'danger' : 'info'}
                  />
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                {alert.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {alert.indicators.map((ind, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      ▸ {ind}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleCreateOrOpenInvestigation(alert)}
                  disabled={openingAlertId === alert.id}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    backgroundColor: alert.caseId ? 'var(--bg-elevated)' : 'var(--accent-primary, #3b82f6)',
                    color: alert.caseId ? 'var(--accent-primary, #3b82f6)' : '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {openingAlertId === alert.id
                    ? 'Loading...'
                    : alert.caseId
                    ? `Open Case ${alert.caseNumber || ''} ↗`
                    : '🔍 Create Investigation'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
