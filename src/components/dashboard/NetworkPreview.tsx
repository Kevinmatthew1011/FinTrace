'use client';

import React, { useState, useEffect } from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { LoadingState } from '../common/StateViews';

export const NetworkPreview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    sourceLabel: string;
    targetLabel: string;
    hops: number;
    totalValueRupees: number;
    highestRiskScore: number;
    highestRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    transactions: Array<{
      id: string;
      referenceNumber: string;
      senderEntity: string;
      receiverEntity: string;
      amount: number;
      channel: string;
    }>;
  } | null>(null);

  useEffect(() => {
    async function loadPreview() {
      try {
        const res = await fetch('/api/v1/network/path?source=ENT-8821&target=ENT-7731');
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
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
            Live Multi-Hop Fraud Network Trail (PostgreSQL)
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Database-derived topological path: Apex Logistics ➔ Layering Accounts ➔ Ramesh K. (Mule Node Alpha)
          </p>
        </div>
        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>● Active Path</span>
      </div>

      {loading ? (
        <LoadingState message="Tracing financial graph path in PostgreSQL..." />
      ) : data ? (
        <div
          style={{
            padding: '14px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {data.transactions.map((tx, i) => (
              <React.Fragment key={tx.id}>
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {i === 0 ? 'ORIGIN ENTITY' : `INTERMEDIARY HOP ${i}`}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.senderEntity}</div>
                </div>

                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>➔</span>

                <div style={{ padding: '6px 10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 700 }}>{tx.channel}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444' }}>₹{tx.amount.toLocaleString('en-IN')}</div>
                </div>

                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>➔</span>

                {i === data.transactions.length - 1 && (
                  <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 700 }}>DESTINATION MULE</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.receiverEntity}</div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>Total Value: ₹{(data.totalValueRupees / 100000).toFixed(2)} Lakhs across {data.hops} hops</span>
            <RiskBadge level={data.highestRiskLevel} score={data.highestRiskScore} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
