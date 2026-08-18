'use client';

import React from 'react';
import { FullAIAssessment, AIClassification } from '@/modules/ai-engine';

interface AIPredictionCardProps {
  assessment: FullAIAssessment;
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}

export const AIPredictionCard: React.FC<AIPredictionCardProps> = ({
  assessment,
  onRecalculate,
  isRecalculating,
}) => {
  const getClassificationColor = (cls: AIClassification) => {
    switch (cls) {
      case 'HIGH_CONFIDENCE_FRAUD':
        return '#ef4444'; // Red
      case 'LIKELY_FRAUD':
        return '#f97316'; // Orange
      case 'SUSPICIOUS':
        return '#eab308'; // Yellow
      case 'NORMAL':
      default:
        return '#10b981'; // Green
    }
  };

  const getClassificationBadge = (cls: AIClassification) => {
    switch (cls) {
      case 'HIGH_CONFIDENCE_FRAUD':
        return '🚨 HIGH CONFIDENCE FRAUD';
      case 'LIKELY_FRAUD':
        return '⚠️ LIKELY FRAUD';
      case 'SUSPICIOUS':
        return '⚡ SUSPICIOUS ACTIVITY';
      case 'NORMAL':
      default:
        return '✓ NORMAL TRANSACTION';
    }
  };

  const classColor = getClassificationColor(assessment.classification);
  const probPct = Math.round(assessment.fraudProbability * 100);

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
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                color: '#38bdf8',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              PHASE 5 • AI PREDICTIVE INTELLIGENCE
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontFamily: 'monospace',
              }}
            >
              {assessment.modelMetadata.modelVersion}
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {assessment.targetLabel}
          </h2>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Target: {assessment.targetType} • ID: {assessment.targetId}{' '}
            {assessment.targetSublabel ? `• ${assessment.targetSublabel}` : ''}
          </div>
        </div>

        {onRecalculate && (
          <button
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isRecalculating ? 'Inference...' : '⚡ AI Re-Inference'}
          </button>
        )}
      </div>

      {/* Main AI Dial & Classification Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '20px',
          padding: '18px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: `1px solid ${classColor}40`,
        }}
      >
        {/* Fraud Probability Gauge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: '#0b1329',
            border: `4px solid ${classColor}`,
            boxShadow: `0 0 16px ${classColor}30`,
          }}
        >
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: classColor }}>
            {probPct}%
          </span>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            AI Fraud Prob
          </span>
        </div>

        {/* Classification & Confidence Stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: `${classColor}20`,
                color: classColor,
                border: `1px solid ${classColor}50`,
                letterSpacing: '0.03em',
              }}
            >
              {getClassificationBadge(assessment.classification)}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confidence:</span>
              <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                {(assessment.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Model Rationale / Suggested Action */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(0,0,0,0.25)',
              borderRadius: '4px',
              borderLeft: `3px solid ${classColor}`,
            }}
          >
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Investigator Recommendation:
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.4 }}>
              {assessment.suggestedAction}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>Model: {assessment.modelMetadata.modelName}</span>
            <span>Inference Timestamp: {new Date(assessment.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Engine Comparison: Deterministic vs AI vs Combined */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Phase 4 Deterministic Risk</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {assessment.deterministicRiskScore}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>

        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Phase 5 AI Probability Score</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: classColor }}>
              {assessment.fraudScore}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>

        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            border: '1px solid #38bdf850',
          }}
        >
          <span style={{ fontSize: '10px', color: '#38bdf8' }}>AI-Enhanced Combined Risk</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>
              {assessment.combinedScore}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100 ({assessment.combinedRiskLevel})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
