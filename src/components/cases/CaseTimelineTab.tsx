'use client';

import React from 'react';

interface AuditLogItem {
  id: string;
  action: string;
  resource: string;
  metadata?: any;
  user?: {
    name: string;
    badgeNumber?: string | null;
  } | null;
  createdAt: string;
}

interface CaseTimelineTabProps {
  timeline: AuditLogItem[];
}

export const CaseTimelineTab: React.FC<CaseTimelineTabProps> = ({ timeline }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Append-Only Forensic Case Timeline & Audit Trail
        </h3>
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
          Immutable system log capturing state transitions, evidence submissions, notes, and investigator assignments
        </p>
      </div>

      {timeline.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          No audit entries recorded for this case.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
          {timeline.map((log, idx) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                gap: '14px',
                paddingBottom: idx === timeline.length - 1 ? '0' : '20px',
                position: 'relative',
              }}
            >
              {/* Timeline Connector Line */}
              {idx !== timeline.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '22px',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: 'var(--border-subtle)',
                  }}
                />
              )}

              {/* Timeline Dot */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor:
                    log.action.includes('ESCALATED')
                      ? '#ef4444'
                      : log.action.includes('RESOLVED')
                      ? '#10b981'
                      : log.action.includes('EVIDENCE')
                      ? '#8b5cf6'
                      : 'var(--accent-primary, #3b82f6)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                ●
              </div>

              {/* Log Content */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono">
                      {log.resource}
                    </span>
                  </div>

                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Actor: <strong>{log.user?.name || 'System Engine'}</strong>
                  {log.user?.badgeNumber && ` (${log.user.badgeNumber})`}
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div
                    className="font-mono"
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-elevated)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginTop: '2px',
                    }}
                  >
                    {JSON.stringify(log.metadata)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
