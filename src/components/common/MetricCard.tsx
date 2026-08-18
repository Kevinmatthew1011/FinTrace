import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  changePercentage?: number;
  periodComparison?: string;
  badge?: React.ReactNode;
  isAlert?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  changePercentage,
  periodComparison,
  badge,
  isAlert = false,
}) => {
  const isPositive = changePercentage !== undefined && changePercentage > 0;
  const isNeutral = changePercentage === 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${isAlert ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`,
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
        {badge}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '24px', fontWeight: 700, color: isAlert ? '#ef4444' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {subValue && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subValue}
          </div>
        )}
      </div>

      {(changePercentage !== undefined || periodComparison) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          {changePercentage !== undefined && (
            <span
              style={{
                fontWeight: 600,
                color: isAlert
                  ? '#ef4444'
                  : isPositive
                  ? '#10b981'
                  : isNeutral
                  ? 'var(--text-muted)'
                  : '#f59e0b',
              }}
            >
              {isPositive ? '↑' : isNeutral ? '•' : '↓'} {Math.abs(changePercentage)}%
            </span>
          )}
          {periodComparison && (
            <span style={{ color: 'var(--text-muted)' }}>{periodComparison}</span>
          )}
        </div>
      )}
    </div>
  );
};
