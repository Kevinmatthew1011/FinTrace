'use client';

import React, { useState, useEffect } from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';

interface AlertItem {
  id: string;
  alertNumber: string;
  title: string;
  description: string;
  severity: any;
  status: any;
  alertType?: string;
  indicators?: any;
  sourceEntity?: { name: string };
  targetEntity?: { name: string };
  createdAt: string;
}

interface CaseAlertsTabProps {
  caseId: string;
  alerts: AlertItem[];
  onRefresh: () => void;
}

export const CaseAlertsTab: React.FC<CaseAlertsTabProps> = ({ caseId, alerts, onRefresh }) => {
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [availableAlerts, setAvailableAlerts] = useState<AlertItem[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [attachingId, setAttachingId] = useState<string | null>(null);

  useEffect(() => {
    if (showAttachModal) {
      async function loadAvailable() {
        setLoadingAvailable(true);
        try {
          const res = await fetch('/api/v1/alerts?limit=20');
          const data = await res.json();
          if (data.success) {
            // Filter out alerts already attached to this case
            const currentIds = new Set(alerts.map((a) => a.id));
            setAvailableAlerts(data.data.filter((a: any) => !currentIds.has(a.id)));
          }
        } catch {
          // ignore
        } finally {
          setLoadingAvailable(false);
        }
      }
      loadAvailable();
    }
  }, [showAttachModal, alerts]);

  const handleAttachAlert = async (alertId: string) => {
    setAttachingId(alertId);
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAttachModal(false);
        onRefresh();
      } else {
        alert(data.error?.message || 'Error attaching alert');
      }
    } catch {
      alert('Network error attaching alert');
    } finally {
      setAttachingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Attached Fraud Alerts ({alerts.length})
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
            Alert triggers and anomalies driving this forensic investigation
          </p>
        </div>

        <button
          onClick={() => setShowAttachModal(true)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '5px',
            backgroundColor: 'var(--accent-primary, #3b82f6)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Attach Existing Alert
        </button>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div
          style={{
            padding: '30px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '12px',
          }}
        >
          No fraud alerts currently attached to this case.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((al) => (
            <div
              key={al.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {al.alertNumber}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {al.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RiskBadge level={al.severity} />
                  <StatusBadge label={al.status} variant={al.status === 'NEW' ? 'danger' : 'info'} />
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {al.description}
              </p>

              {al.indicators && Array.isArray(al.indicators) && al.indicators.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {al.indicators.map((ind: string, i: number) => (
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
              )}
            </div>
          ))}
        </div>
      )}

      {/* Attach Modal */}
      {showAttachModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '24px',
              width: '560px',
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Attach Alert to Case Dossier
              </h3>
              <button
                onClick={() => setShowAttachModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {loadingAvailable ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                Loading available alerts from database...
              </div>
            ) : availableAlerts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No additional unattached alerts found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '350px' }}>
                {availableAlerts.map((al) => (
                  <div
                    key={al.id}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {al.alertNumber}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {al.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {al.sourceEntity?.name || 'Entity'} • {al.alertType}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAttachAlert(al.id)}
                      disabled={attachingId === al.id}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'var(--accent-primary, #3b82f6)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {attachingId === al.id ? 'Attaching...' : '+ Attach'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
