import React from 'react';
import { demoDataService } from '@/modules/demo';
import { RiskBadge } from '../common/RiskBadge';

export const RiskDistribution: React.FC = () => {
  const tiers = demoDataService.getRiskDistribution();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
      }}
    >
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Risk Level Distribution</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Network transaction segmentation by risk score threshold</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tiers.map((tier) => (
          <div key={tier.level}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RiskBadge level={tier.level} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{tier.label}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: '6px' }}>
                  {tier.count.toLocaleString('en-IN')}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({tier.percentage}%)</span>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: '6px',
                width: '100%',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${tier.percentage}%`,
                  backgroundColor:
                    tier.level === 'CRITICAL'
                      ? '#ef4444'
                      : tier.level === 'HIGH'
                      ? '#f97316'
                      : tier.level === 'MEDIUM'
                      ? '#eab308'
                      : '#3b82f6',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
