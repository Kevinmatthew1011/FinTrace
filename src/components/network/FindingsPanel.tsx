'use client';

import React from 'react';
import { GraphFinding, GraphCycle } from '@/modules/graph/graphTypes';
import { RiskBadge } from '../common/RiskBadge';

interface FindingsPanelProps {
  findings: GraphFinding[];
  cycles: GraphCycle[];
  onHighlightNodes: (nodeIds: string[], edgeIds?: string[]) => void;
}

export const FindingsPanel: React.FC<FindingsPanelProps> = ({
  findings,
  cycles,
  onHighlightNodes,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
        Forensic Graph Findings ({findings.length + cycles.length})
      </div>

      {findings.length === 0 && cycles.length === 0 ? (
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          No anomalous graph patterns detected in this subgraph.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Render Cycles */}
          {cycles.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
                  🔄 Circular Carousel Flow ({c.hopCount} Hops)
                </span>
                <RiskBadge level={c.riskLevel} score={c.riskScore} />
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                {c.evidence}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Volume: ₹{(c.totalTransactionValue / 100000).toFixed(2)}L
                </span>
                <button
                  onClick={() => onHighlightNodes(c.entities.map((e) => e.id), c.transactions.map((t) => t.id))}
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '10px', color: 'var(--accent-blue)' }}
                >
                  Trace on Graph
                </button>
              </div>
            </div>
          ))}

          {/* Render Other Findings */}
          {findings.map((f) => (
            <div
              key={f.id}
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                border: `1px solid ${f.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {f.type === 'MULE_CHAIN' ? '⚡ ' : '⚠️ '}
                  {f.title}
                </span>
                <RiskBadge level={f.severity} score={f.riskScore} />
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                {f.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
                {f.evidence.map((ev, i) => (
                  <div key={i} style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    • {ev}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#a855f7' }}>Focus: {f.recommendedFocus}</span>
                <button
                  onClick={() => onHighlightNodes(f.relatedNodeIds, f.relatedTransactionIds)}
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '10px' }}
                >
                  Highlight
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
