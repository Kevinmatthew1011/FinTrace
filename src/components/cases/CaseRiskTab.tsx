'use client';

import React from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';

interface CaseRiskTabProps {
  caseId: string;
  deterministicRisk: any;
  aiRiskAssessment: any;
  onRefresh: () => void;
}

export const CaseRiskTab: React.FC<CaseRiskTabProps> = ({
  caseId: _caseId,
  deterministicRisk,
  aiRiskAssessment,
  onRefresh: _onRefresh,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 2-Column Grid: Phase 4 Deterministic vs Phase 5 AI Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Phase 4 Deterministic Risk Engine */}
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
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Phase 4 — Deterministic Risk Engine
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                Explainable rule-based forensic factors
              </p>
            </div>
            {deterministicRisk && (
              <RiskBadge level={deterministicRisk.riskLevel} score={deterministicRisk.overallScore} />
            )}
          </div>

          {deterministicRisk ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deterministic Risk Score</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {deterministicRisk.overallScore}/100
                  </div>
                </div>
                <StatusBadge label={deterministicRisk.riskLevel} variant={deterministicRisk.riskLevel === 'CRITICAL' ? 'danger' : 'warning'} />
              </div>

              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Contributing Risk Factors:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {deterministicRisk.factors?.map((f: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{f.description}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: f.contribution > 15 ? '#ef4444' : 'var(--text-secondary)' }}>
                      +{f.contribution} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              No deterministic risk assessment available for this case.
            </p>
          )}
        </div>

        {/* Phase 5 AI Predictive Intelligence */}
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
            <div>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Phase 5 — Behavioral Anomaly & Risk Fusion
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                Behavioral anomaly baselines & risk fusion synthesis
              </p>
            </div>
            {aiRiskAssessment && (
              <StatusBadge
                label={aiRiskAssessment.classification}
                variant={
                  aiRiskAssessment.classification === 'HIGH_CONFIDENCE_FRAUD'
                    ? 'danger'
                    : aiRiskAssessment.classification === 'LIKELY_FRAUD'
                    ? 'warning'
                    : 'info'
                }
              />
            )}
          </div>

          {aiRiskAssessment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AI Fraud Probability</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary, #3b82f6)' }}>
                    {(aiRiskAssessment.fraudProbability * 100).toFixed(1)}%
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Anomaly Score</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>
                    {aiRiskAssessment.anomalyScore}/100
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                }}
              >
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>AI-Enhanced Combined Fused Score:</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {aiRiskAssessment.combinedScore}/100{' '}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    ({aiRiskAssessment.combinedRiskLevel})
                  </span>
                </div>
              </div>

              {aiRiskAssessment.evidence && aiRiskAssessment.evidence.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Key AI Evidence:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {aiRiskAssessment.evidence.slice(0, 3).map((ev: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          padding: '6px 8px',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '4px',
                        }}
                      >
                        ▸ {ev.statement || ev}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              No AI prediction available for this case.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
