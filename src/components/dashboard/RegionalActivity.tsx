import React from 'react';
import { demoDataService } from '@/modules/demo';
import { RiskBadge } from '../common/RiskBadge';

export const RegionalActivity: React.FC = () => {
  const regions = demoDataService.getRegionalActivity();

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
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Regional Activity Distribution
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>State-wise transaction volume and localized risk levels</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {regions.map((reg) => (
          <div key={reg.region}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{reg.region}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ₹{(reg.volumeRupees / 10000000).toFixed(1)} Cr ({reg.percentage}%)
                </span>
                <RiskBadge level={reg.riskLevel} />
              </div>
            </div>

            <div
              style={{
                height: '4px',
                width: '100%',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${reg.percentage * 2.5}%`,
                  backgroundColor:
                    reg.riskLevel === 'HIGH' ? '#f97316' : reg.riskLevel === 'MEDIUM' ? '#eab308' : '#3b82f6',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
