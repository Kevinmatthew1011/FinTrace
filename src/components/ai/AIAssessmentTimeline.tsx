'use client';

import React from 'react';
import { AIOverviewStats, AIAssessmentTargetType, AIClassification } from '@/modules/ai-engine';

interface AIAssessmentTimelineProps {
  recentAssessments: AIOverviewStats['recentAssessments'];
  onSelectSubject?: (targetType: AIAssessmentTargetType, targetId: string) => void;
}

export const AIAssessmentTimeline: React.FC<AIAssessmentTimelineProps> = ({
  recentAssessments,
  onSelectSubject,
}) => {
  const getClassificationBadge = (cls: AIClassification) => {
    switch (cls) {
      case 'HIGH_CONFIDENCE_FRAUD':
        return { text: 'HIGH FRAUD', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'LIKELY_FRAUD':
        return { text: 'LIKELY FRAUD', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' };
      case 'SUSPICIOUS':
        return { text: 'SUSPICIOUS', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' };
      case 'NORMAL':
      default:
        return { text: 'NORMAL', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
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
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Recent AI Predictive Assessment Stream
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Real-time inference queue across transactions, accounts, and entity networks
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Target</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>AI Classification</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>AI Prob</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Fused Risk</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Key Forensic Evidence</th>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Inference Time</th>
              <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentAssessments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No recent AI assessments logged in database.
                </td>
              </tr>
            ) : (
              recentAssessments.map((rec) => {
                const badge = getClassificationBadge(rec.classification);
                return (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {rec.targetLabel}
                      </div>
                      <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {rec.targetType} • {rec.targetId}
                      </div>
                    </td>

                    <td style={{ padding: '10px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.color}40`,
                        }}
                      >
                        {badge.text}
                      </span>
                    </td>

                    <td style={{ padding: '10px' }}>
                      <span className="font-mono" style={{ fontWeight: 700, color: badge.color }}>
                        {(rec.fraudProbability * 100).toFixed(0)}%
                      </span>
                    </td>

                    <td style={{ padding: '10px' }}>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#38bdf8' }}>
                        {rec.combinedScore.toFixed(0)}/100
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        ({rec.combinedRiskLevel})
                      </span>
                    </td>

                    <td style={{ padding: '10px', maxWidth: '280px' }}>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={rec.topEvidence}
                      >
                        {rec.topEvidence}
                      </div>
                    </td>

                    <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {new Date(rec.createdAt).toLocaleTimeString()}
                    </td>

                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      {onSelectSubject && (
                        <button
                          onClick={() => onSelectSubject(rec.targetType, rec.targetId)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
