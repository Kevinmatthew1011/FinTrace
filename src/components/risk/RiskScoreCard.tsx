'use client';

import React from 'react';
import { RiskAssessment } from '@/modules/risk-engine';
import { RiskBadge } from '../common/RiskBadge';

interface RiskScoreCardProps {
  assessment: RiskAssessment;
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  assessment,
  onRecalculate,
  isRecalculating,
}) => {
  const riskColor =
    assessment.riskLevel === 'CRITICAL'
      ? '#ef4444'
      : assessment.riskLevel === 'HIGH'
      ? '#f97316'
      : assessment.riskLevel === 'MEDIUM'
      ? '#eab308'
      : '#38bdf8';

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
            {assessment.subjectType} MULTI-FACTOR RISK ASSESSMENT
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {assessment.subjectLabel}
          </h2>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ID: {assessment.subjectId} {assessment.subjectSublabel ? `• ${assessment.subjectSublabel}` : ''}
          </div>
        </div>

        {onRecalculate && (
          <button
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isRecalculating ? 'Calculating...' : '🔄 Recalculate'}
          </button>
        )}
      </div>

      {/* Score Dial & Badge Ribbon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '16px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: `1px solid ${assessment.riskLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-subtle)'}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            border: `3px solid ${riskColor}`,
          }}
        >
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: riskColor }}>
            {assessment.overallScore}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>/ 100</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RiskBadge level={assessment.riskLevel} score={assessment.overallScore} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Engine: {assessment.engineVersion}</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {assessment.summaryReasons.length > 0
              ? assessment.summaryReasons[0]
              : 'Deterministic evaluation completed with no anomalous risk indicators.'}
          </p>

          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Assessed on: {new Date(assessment.calculatedAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
