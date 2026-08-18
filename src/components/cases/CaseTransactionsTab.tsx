'use client';

import React, { useState } from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import Link from 'next/link';

interface TransactionItem {
  id: string;
  referenceNumber: string;
  amount: number | string;
  currency: string;
  paymentMethod: string;
  status: string;
  riskScore: number;
  riskLevel: any;
  isSuspicious: boolean;
  timestamp: string;
  senderAccount?: {
    accountNumber: string;
    bankName: string;
    entity?: { name: string; id: string };
  };
  receiverAccount?: {
    accountNumber: string;
    bankName: string;
    entity?: { name: string; id: string };
  };
}

interface CaseTransactionsTabProps {
  caseId: string;
  transactions: TransactionItem[];
  onRefresh: () => void;
}

export const CaseTransactionsTab: React.FC<CaseTransactionsTabProps> = ({ caseId, transactions, onRefresh }) => {
  const [attachingId, setAttachingId] = useState<string | null>(null);

  const handleAddToEvidence = async (tx: TransactionItem) => {
    setAttachingId(tx.id);
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceType: 'TRANSACTION',
          title: `Transaction Evidence: ${tx.referenceNumber} (₹${Number(tx.amount).toLocaleString('en-IN')})`,
          description: `Audited fund transfer from ${tx.senderAccount?.entity?.name || 'Sender'} to ${tx.receiverAccount?.entity?.name || 'Receiver'}. Payment Method: ${tx.paymentMethod} • Status: ${tx.status} • Risk Level: ${tx.riskLevel}`,
          source: 'TRANSACTION_STORE',
          sourceId: tx.id,
          severity: tx.riskLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Transaction added to case evidence.');
        onRefresh();
      } else {
        alert(data.error?.message || 'Error attaching transaction evidence');
      }
    } catch {
      alert('Network error attaching transaction');
    } finally {
      setAttachingId(null);
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
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Linked Case Transactions ({transactions.length})
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
            Transactions associated with attached alerts and subject entities
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          No linked transactions recorded for this case yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Reference</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Sender Entity</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Receiver Entity</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>Risk</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
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
                  <td style={{ padding: '10px' }}>
                    <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.referenceNumber}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{tx.paymentMethod}</div>
                  </td>

                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{Number(tx.amount).toLocaleString('en-IN')}
                  </td>

                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.senderAccount?.entity?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono">
                      {tx.senderAccount?.accountNumber}
                    </div>
                  </td>

                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.receiverAccount?.entity?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="font-mono">
                      {tx.receiverAccount?.accountNumber}
                    </div>
                  </td>

                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                    {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td style={{ padding: '10px' }}>
                    <RiskBadge level={tx.riskLevel} />
                  </td>

                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleAddToEvidence(tx)}
                        disabled={attachingId === tx.id}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {attachingId === tx.id ? 'Attaching...' : '+ Add Evidence'}
                      </button>

                      <Link
                        href={`/transactions?search=${tx.referenceNumber}`}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--accent-primary, #3b82f6)',
                          textDecoration: 'none',
                        }}
                      >
                        Open ↗
                      </Link>
                    </div>
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
