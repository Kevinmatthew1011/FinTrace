'use client';

import React from 'react';
import { RiskEvidence } from '@/modules/risk-engine';

interface EvidenceDossierProps {
  evidence: RiskEvidence[];
}

export const EvidenceDossier: React.FC<EvidenceDossierProps> = ({ evidence }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Forensic Evidence Statements ({evidence.length})
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 600 }}>
          Traceable Audit Trail
        </span>
      </div>

      {evidence.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          No anomalous evidence records generated for this subject.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {evidence.map((ev, i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                ▸ {ev.statement}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Metric: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{ev.metricName}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Value: </span>
                  <span className="font-mono" style={{ fontWeight: 600, color: '#ef4444' }}>{ev.metricValue}</span>
                </div>
                {ev.threshold && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Threshold: </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{ev.threshold}</span>
                  </div>
                )}
              </div>

              {ev.relatedTransactionIds && ev.relatedTransactionIds.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Linked Txns:</span>
                  {ev.relatedTransactionIds.slice(0, 5).map((tid) => (
                    <span
                      key={tid}
                      className="font-mono"
                      style={{ fontSize: '9px', padding: '1px 4px', backgroundColor: 'var(--bg-elevated)', borderRadius: '2px', color: 'var(--accent-blue)' }}
                    >
                      {tid}
                    </span>
                  ))}
                  {ev.relatedTransactionIds.length > 5 && (
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>+{ev.relatedTransactionIds.length - 5} more</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
