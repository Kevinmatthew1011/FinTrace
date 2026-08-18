'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../common/StateViews';
import { RiskLevel, TransactionStatus } from '@/types/fraud';

interface TransactionRecord {
  id: string;
  referenceNumber: string;
  timestamp: string;
  senderAccount: string;
  senderEntityName: string;
  receiverAccount: string;
  receiverEntityName: string;
  amount: number;
  currency: string;
  channel: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  isSuspicious: boolean;
  flags: string[];
}

export const TransactionTable: React.FC<{ limit?: number; showFilters?: boolean; initialRisk?: string }> = ({
  limit = 25,
  showFilters = true,
  initialRisk = 'ALL',
}) => {
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState<string>(initialRisk);
  const [status, setStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search.trim()) params.set('search', search.trim());
      if (riskLevel !== 'ALL') params.set('riskLevel', riskLevel);
      if (status !== 'ALL') params.set('status', status);

      const res = await fetch(`/api/v1/transactions?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalCount(json.pagination.total);
      } else {
        throw new Error(json.error?.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database query failed');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, riskLevel, status]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Live PostgreSQL Transaction Store
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Indexed queries from PostgreSQL (Showing {transactions.length} of {totalCount} records)
            </p>
          </div>

          {/* Pagination controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="btn-secondary"
              style={{ padding: '3px 8px', fontSize: '11px' }}
            >
              ◀ Prev
            </button>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="btn-secondary"
              style={{ padding: '3px 8px', fontSize: '11px' }}
            >
              Next ▶
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search reference, account, narrative..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
                minWidth: '220px',
              }}
            />

            <select
              value={riskLevel}
              onChange={(e) => {
                setRiskLevel(e.target.value);
                setPage(1);
              }}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical (80–100)</option>
              <option value="HIGH">High (60–79)</option>
              <option value="MEDIUM">Medium (30–59)</option>
              <option value="LOW">Low (0–29)</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="FLAGGED">FLAGGED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingState message="Fetching live records from PostgreSQL..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTransactions} />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions match the query parameters." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Reference</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Sender (Source)</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Receiver (Target)</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Amount (INR)</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Risk Score</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <td style={{ padding: '10px', fontWeight: 600 }} className="font-mono">
                    <span style={{ color: 'var(--text-primary)' }}>{tx.referenceNumber}</span>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tx.channel}</div>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                    {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.senderEntityName}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono">{tx.senderAccount}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.receiverEntityName}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono">{tx.receiverAccount}</div>
                  </td>
                  <td style={{ padding: '10px', fontWeight: 600 }} className="font-mono">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <RiskBadge level={tx.riskLevel} score={tx.riskScore} />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <StatusBadge
                      label={tx.status}
                      variant={
                        tx.status === 'BLOCKED'
                          ? 'danger'
                          : tx.status === 'FLAGGED'
                          ? 'warning'
                          : tx.status === 'UNDER_REVIEW'
                          ? 'purple'
                          : 'success'
                      }
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
