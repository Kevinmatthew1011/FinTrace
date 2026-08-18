import React from 'react';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { Header } from '@/components/common/Header';

export default function TransactionsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Transaction Intelligence Explorer
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Paginated, indexed database queries across 560+ financial transfers
        </p>
      </div>

      <TransactionTable limit={25} showFilters={true} />
    </div>
  );
}
