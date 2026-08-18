'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { LoadingState, ErrorState } from '@/components/common/StateViews';

export default function AdminPage() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/system/info');
      const json = await res.json();
      if (json.success) {
        setInfo(json.data);
      } else {
        throw new Error(json.error?.message || 'Failed to fetch telemetry data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching telemetry data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header onRefresh={fetchSystemInfo} />

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            System Telemetry & Architecture Status
          </h1>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            SIH 2026 PROTOTYPE READY
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Live PostgreSQL 16 database verification, subsystem telemetry, and component operational health.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Retrieving database telemetry and service health..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSystemInfo} />
      ) : info ? (
        <>
          {/* Top Database Counts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Entities Tracked</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{info.counts?.entities || 0}</div>
              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>● Individuals & Corporations</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bank Accounts</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{info.counts?.accounts || 0}</div>
              <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px' }}>● Across 8 Commercial Banks</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Transactions Analyzed</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{info.counts?.transactions || 0}</div>
              <div style={{ fontSize: '11px', color: '#a855f7', marginTop: '4px' }}>● Graph Edges & Flow Records</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px 20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Cases & Alerts</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {info.counts?.cases || 0} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>({info.counts?.alerts || 0} alerts)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>● Dossiers in Registry</div>
            </div>
          </div>

          {/* Subsystem Health Table */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--text-primary)' }}>
              Subsystem & Engine Status
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {info.modules?.map((m: any) => (
                <div
                  key={m.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {m.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ({m.phase})
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor:
                          m.status === 'ACTIVE'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color: m.status === 'ACTIVE' ? '#10b981' : '#f59e0b',
                        border:
                          m.status === 'ACTIVE'
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      {m.status === 'ACTIVE' ? 'OPERATIONAL' : 'COMING SOON'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
