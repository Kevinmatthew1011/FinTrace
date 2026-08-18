'use client';

import React from 'react';
import { RiskFusionResult } from '@/modules/ai-engine';
import { RiskBadge } from '../common/RiskBadge';

interface RiskFusionMatrixProps {
  fusionResult: RiskFusionResult;
}

export const RiskFusionMatrix: React.FC<RiskFusionMatrixProps> = ({ fusionResult }) => {
  const components = [
    {
      name: 'Phase 4 Deterministic Risk',
      subtext: 'Forensic rules & statutory AML thresholds',
      score: fusionResult.deterministicScore,
      weight: fusionResult.fusionWeights.deterministic,
      weightedScore: fusionResult.deterministicScore * fusionResult.fusionWeights.deterministic,
      color: '#38bdf8',
    },
    {
      name: 'Phase 3 Graph Network Risk',
      subtext: 'Topology, cycles, clusters & mule chains',
      score: fusionResult.networkScore,
      weight: fusionResult.fusionWeights.network,
      weightedScore: fusionResult.networkScore * fusionResult.fusionWeights.network,
      color: '#a855f7',
    },
    {
      name: 'Phase 5 AI Fraud Prediction',
      subtext: 'Neural ensemble & non-linear patterns',
      score: fusionResult.aiFraudProbabilityScore,
      weight: fusionResult.fusionWeights.aiPredictive,
      weightedScore: fusionResult.aiFraudProbabilityScore * fusionResult.fusionWeights.aiPredictive,
      color: '#f97316',
    },
    {
      name: 'Phase 5 Behavioral Anomaly',
      subtext: 'Z-scores & baseline deviation model',
      score: fusionResult.anomalyScore,
      weight: fusionResult.fusionWeights.anomaly,
      weightedScore: fusionResult.anomalyScore * fusionResult.fusionWeights.anomaly,
      color: '#eab308',
    },
  ];

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
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            AI Risk Fusion Engine Matrix
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Deterministic baseline preserved • Multimodal synthesis across Rules, Graph & AI
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiskBadge level={fusionResult.fusedLevel} score={fusionResult.fusedScore} />
        </div>
      </div>

      {/* Fused Components Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {components.map((c, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '6px',
              borderLeft: `3px solid ${c.color}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {c.name}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  ({(c.weight * 100).toFixed(0)}% weight)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: c.color }}>
                  {c.score.toFixed(1)}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  ➔ +{c.weightedScore.toFixed(1)} pts
                </span>
              </div>
            </div>

            {/* Progress bar representing score & weight */}
            <div
              style={{
                width: '100%',
                height: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${c.score}%`,
                  height: '100%',
                  backgroundColor: c.color,
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Math Formula Ribbon */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#0a0f1d',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          FusedScore = (0.35 × {fusionResult.deterministicScore.toFixed(0)}) + (0.25 × {fusionResult.networkScore.toFixed(0)}) + (0.25 × {fusionResult.aiFraudProbabilityScore.toFixed(0)}) + (0.15 × {fusionResult.anomalyScore.toFixed(0)})
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI-Enhanced:</span>
          <span className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
            {fusionResult.fusedScore}/100
          </span>
        </div>
      </div>

      {/* Reconciliation Notes */}
      {fusionResult.reconciliationNotes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
            Engine Alignment & Reconciliation:
          </span>
          {fusionResult.reconciliationNotes.map((note, i) => (
            <p key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              • {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
