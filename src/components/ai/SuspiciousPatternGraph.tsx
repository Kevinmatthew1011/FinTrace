'use client';

import React from 'react';
import { SuspiciousPattern } from '@/modules/ai-engine';

interface SuspiciousPatternGraphProps {
  patterns: SuspiciousPattern[];
}

export const SuspiciousPatternGraph: React.FC<SuspiciousPatternGraphProps> = ({ patterns }) => {
  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'CAROUSEL_ROUND_TRIP':
        return '🔄';
      case 'RAPID_SMURFING_DISPERSAL':
        return '🌊';
      case 'MULE_FAN_IN_AGGREGATION':
        return '🕸️';
      case 'DORMANT_HIGH_VALUE_SPIKE':
        return '⚡';
      default:
        return '⚠️';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Emergent Fraud Topology & Complex Patterns
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Detected circular carousels, smurfing dispersal trees, and fan-in aggregation clusters
          </p>
        </div>

        <span
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            fontWeight: 700,
          }}
        >
          {patterns.length} Active Pattern Rings
        </span>
      </div>

      {patterns.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          No organized syndicate topologies or multi-hop smurfing patterns detected for this subject.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {patterns.map((pat, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '14px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{getPatternIcon(pat.patternType)}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {pat.title}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    fontWeight: 700,
                  }}
                >
                  {(pat.confidence * 100).toFixed(0)}% Conf
                </span>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {pat.description}
              </p>

              {/* Evidence Bullet Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                {pat.evidence.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span style={{ color: '#ef4444' }}>•</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>

              {pat.totalVolume > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    marginTop: '4px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Estimated Volume at Risk:</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#f97316' }}>
                    ₹{(pat.totalVolume / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
