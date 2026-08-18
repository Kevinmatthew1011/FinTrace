'use client';

import React from 'react';
import { XAIEvidenceItem, AIPredictionResult } from '@/modules/ai-engine';

interface XAIExplanationViewProps {
  evidenceList: XAIEvidenceItem[];
  predictionResult: AIPredictionResult;
}

export const XAIExplanationView: React.FC<XAIExplanationViewProps> = ({
  evidenceList,
  predictionResult,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AMOUNT_ANOMALY':
        return '#f97316';
      case 'VELOCITY_BURST':
        return '#ef4444';
      case 'NETWORK_TOPOLOGY':
        return '#a855f7';
      case 'COUNTERPARTY_RISK':
        return '#ec4899';
      case 'HISTORICAL_PATTERN':
        return '#eab308';
      case 'BEHAVIORAL_DEVIATION':
      default:
        return '#38bdf8';
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
        gap: '18px',
      }}
    >
      {/* Title */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Explainable AI (XAI) Evidence Dossier
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Feature attribution, plain-English rationale & non-linear predictive drivers
        </p>
      </div>

      {/* Key Drivers Waterfall Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Top Model Feature Attributions
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {predictionResult.keyPredictiveDrivers.map((driver, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {driver.feature}
                </span>
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                  {driver.impactPercentage}% Impact
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${driver.impactPercentage}%`,
                    height: '100%',
                    backgroundColor: '#38bdf8',
                    borderRadius: '2px',
                  }}
                />
              </div>

              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {driver.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Concrete Plain-English Evidence Statements */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Structured Forensic Evidence Statements ({evidenceList.length})
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {evidenceList.map((ev, idx) => {
            const catColor = getCategoryColor(ev.category);
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${catColor}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      backgroundColor: `${catColor}20`,
                      color: catColor,
                      fontWeight: 700,
                    }}
                  >
                    {ev.category.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Weight: +{ev.impactPercentage}%
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
                  &ldquo;{ev.statement}&rdquo;
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}
                >
                  <span>
                    Metric: <strong style={{ color: 'var(--text-secondary)' }}>{ev.metricName}</strong>
                  </span>
                  <span>
                    Value: <strong style={{ color: catColor }}>{ev.metricValue}</strong>
                  </span>
                  {ev.baselineValue && (
                    <span>
                      Baseline: <strong style={{ color: 'var(--text-muted)' }}>{ev.baselineValue}</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
