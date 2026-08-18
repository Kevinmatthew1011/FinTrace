import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading intelligence dataset...' }) => (
  <div
    style={{
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
    }}
  >
    <div
      style={{
        display: 'inline-block',
        width: '24px',
        height: '24px',
        border: '2px solid var(--border-subtle)',
        borderTopColor: 'var(--accent-blue)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '12px',
      }}
    />
    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{message}</p>
  </div>
);

export const EmptyState: React.FC<{ title?: string; message?: string }> = ({
  title = 'No records found',
  message = 'No data matches the selected filters or query parameters.',
}) => (
  <div
    style={{
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
    }}
  >
    <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.6 }}>📂</div>
    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h4>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{message}</p>
  </div>
);

export const ErrorState: React.FC<{ title?: string; message?: string; onRetry?: () => void }> = ({
  title = 'Error loading data',
  message = 'Unable to fetch data from the intelligence service.',
  onRetry,
}) => (
  <div
    style={{
      padding: '32px 24px',
      textAlign: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
    }}
  >
    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>{title}</h4>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary" style={{ fontSize: '12px' }}>
        Retry Request
      </button>
    )}
  </div>
);
