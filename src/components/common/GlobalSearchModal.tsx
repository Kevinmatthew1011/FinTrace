'use client';

import React, { useState, useEffect } from 'react';
import { RiskBadge } from './RiskBadge';
import { StatusBadge } from './StatusBadge';
import { RiskLevel } from '@/types/fraud';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    transactions: Array<{ id: string; referenceNumber: string; senderEntityName: string; receiverEntityName: string; amount: number; riskLevel: RiskLevel; riskScore: number }>;
    entities: Array<{ id: string; name: string; taxIdentifier: string; riskScore: number; riskLevel: RiskLevel }>;
    alerts: Array<{ id: string; alertNumber: string; title: string; severity: RiskLevel }>;
    investigations: Array<{ id: string; caseNumber: string; title: string; priority: string }>;
  }>({ transactions: [], entities: [], alerts: [], investigations: [] });

  useEffect(() => {
    if (query.trim().length <= 1) {
      setResults({ transactions: [], entities: [], alerts: [], investigations: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success && data.data) {
          setResults(data.data);
        }
      } catch (err) {
        console.error('Search API error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const totalResults =
    results.transactions.length +
    results.entities.length +
    results.alerts.length +
    results.investigations.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search PostgreSQL database for entities, accounts, txns, alerts, cases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
          {loading && <span style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>Searching...</span>}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              fontSize: '11px',
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            ESC
          </button>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px 20px' }}>
          {query.trim().length <= 1 && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              Type at least 2 characters to query PostgreSQL records.
            </p>
          )}

          {query.trim().length > 1 && !loading && totalResults === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              No database matches found for &quot;{query}&quot;.
            </p>
          )}

          {results.transactions.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                Transactions ({results.transactions.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.referenceNumber}</span>
                      <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{tx.senderEntityName} → {tx.receiverEntityName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontWeight: 600 }}>₹{tx.amount.toLocaleString('en-IN')}</span>
                      <RiskBadge level={tx.riskLevel} score={tx.riskScore} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.entities.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                Entities ({results.entities.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.entities.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</span>
                      <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>•</span>
                      <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{e.id} ({e.taxIdentifier})</span>
                    </div>
                    <RiskBadge level={e.riskLevel} score={e.riskScore} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.alerts.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                Alerts ({results.alerts.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.alerts.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: '6px' }}>{a.alertNumber}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{a.title}</span>
                    </div>
                    <RiskBadge level={a.severity} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.investigations.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                Investigations ({results.investigations.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {results.investigations.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: '6px' }}>{inv.caseNumber}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{inv.title}</span>
                    </div>
                    <StatusBadge label={inv.priority} variant={inv.priority === 'URGENT' || inv.priority === 'CRITICAL' ? 'danger' : 'warning'} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
