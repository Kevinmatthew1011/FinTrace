'use client';

import React from 'react';
import { AnomalyDetectionResult } from '@/modules/ai-engine';

interface AnomalyScoreCardProps {
  anomalyResult: AnomalyDetectionResult;
}

export const AnomalyScoreCard: React.FC<AnomalyScoreCardProps> = ({ anomalyResult }) => {
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '#ef4444';
      case 'HIGH':
        return '#f97316';
      case 'MEDIUM':
        return '#eab308';
      default:
        return '#10b981';
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Behavioral Anomaly & Statistical Deviations
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Dynamic Z-scores, multi-sigma outliers, and account baseline deviations
          </p>
        </div>

        {/* Anomaly Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: anomalyResult.isAnomalous ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${anomalyResult.isAnomalous ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: anomalyResult.isAnomalous ? '#ef4444' : '#10b981',
              }}
            >
              Anomaly Score: {anomalyResult.anomalyScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Baseline Snapshot KPI strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          padding: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '6px',
          fontSize: '11px',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Baseline Mean Amount:</span>
          <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            ₹{anomalyResult.baselineSnapshot.meanAmount.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Baseline StdDev:</span>
          <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            ±₹{anomalyResult.baselineSnapshot.stdDevAmount.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Historical Profile Depth:</span>
          <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {anomalyResult.baselineSnapshot.historyCount} Transactions
          </div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Daily Expected Freq:</span>
          <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {anomalyResult.baselineSnapshot.meanDailyFrequency.toFixed(1)} / day
          </div>
        </div>
      </div>

      {/* Deviations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Detected Statistical Outliers ({anomalyResult.deviations.length})
        </span>

        {anomalyResult.deviations.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No anomalous multi-sigma deviations detected. Profile is strictly within historical parameters.
          </div>
        ) : (
          anomalyResult.deviations.map((dev, idx) => {
            const color = getSeverityBadgeColor(dev.severity);
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
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dev.feature}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: `${color}20`,
                        color: color,
                        fontWeight: 700,
                      }}
                    >
                      {dev.severity}
                    </span>
                    {dev.zScore !== 0 && (
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Z: {dev.zScore > 0 ? `+${dev.zScore}` : dev.zScore}σ
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  {dev.explanation}
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
                    Observed: <strong style={{ color: 'var(--text-primary)' }}>{dev.observedValue}</strong>
                  </span>
                  <span>
                    Baseline: <strong style={{ color: 'var(--text-muted)' }}>{dev.expectedBaseline}</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
