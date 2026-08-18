'use client';

import React from 'react';
import { RiskFactor } from '@/modules/risk-engine';

interface FactorBreakdownProps {
  factors: RiskFactor[];
}

export const FactorBreakdown: React.FC<FactorBreakdownProps> = ({ factors }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Risk Factor Contribution Breakdown
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {factors.filter((f) => f.contribution > 0).length} Contributing Signals
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {factors.map((factor) => {
          const pct = Math.round((factor.contribution / Math.max(1, factor.weight)) * 100);
          const barColor =
            factor.contribution >= 18
              ? '#ef4444'
              : factor.contribution >= 12
              ? '#f97316'
              : factor.contribution > 0
              ? '#eab308'
              : '#334155';

          return (
            <div
              key={factor.id}
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                border: `1px solid ${factor.contribution > 0 ? 'var(--border-subtle)' : 'transparent'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    {factor.category}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {factor.name}
                  </span>
                </div>

                <div className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: factor.contribution > 0 ? barColor : 'var(--text-muted)' }}>
                  +{factor.contribution} <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>/ {factor.weight} pts</span>
                </div>
              </div>

              {/* Contribution Progress Bar */}
              <div style={{ width: '100%', height: '4px', backgroundColor: '#0f172a', borderRadius: '2px', overflow: 'hidden', margin: '6px 0' }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: barColor,
                    borderRadius: '2px',
                  }}
                />
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
