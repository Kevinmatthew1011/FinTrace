'use client';

import React, { useState } from 'react';
import { GraphFinding, GraphCycle } from '@/modules/graph/graphTypes';
import { RiskBadge } from '../common/RiskBadge';

interface FindingsPanelProps {
  findings: GraphFinding[];
  cycles: GraphCycle[];
  onHighlightNodes: (nodeIds: string[], edgeIds?: string[]) => void;
}

type FindingFilterCategory = 'ALL' | 'CYCLES' | 'MULES' | 'HIGH_RISK';

export const FindingsPanel: React.FC<FindingsPanelProps> = ({
  findings,
  cycles,
  onHighlightNodes,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FindingFilterCategory>('ALL');

  const muleFindings = findings.filter((f) => f.type === 'MULE_CHAIN' || f.title.toLowerCase().includes('mule'));
  const highRiskFindings = findings.filter((f) => f.type === 'HIGH_RISK_CONNECTION' || (!muleFindings.includes(f)));

  const showCycles = selectedCategory === 'ALL' || selectedCategory === 'CYCLES';
  const filteredFindings =
    selectedCategory === 'ALL'
      ? findings
      : selectedCategory === 'MULES'
      ? muleFindings
      : selectedCategory === 'HIGH_RISK'
      ? highRiskFindings
      : [];

  const totalFindingsCount = cycles.length + findings.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Forensic Findings ({totalFindingsCount})
        </span>
      </div>

      {/* Sub-Category Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <button
          onClick={() => setSelectedCategory('ALL')}
          style={{
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            border: selectedCategory === 'ALL' ? '1px solid var(--accent-primary, #3b82f6)' : '1px solid var(--border-subtle)',
            backgroundColor: selectedCategory === 'ALL' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
            color: selectedCategory === 'ALL' ? 'var(--accent-primary, #3b82f6)' : 'var(--text-secondary)',
          }}
        >
          All ({totalFindingsCount})
        </button>

        {cycles.length > 0 && (
          <button
            onClick={() => setSelectedCategory('CYCLES')}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === 'CYCLES' ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
              backgroundColor: selectedCategory === 'CYCLES' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-secondary)',
              color: selectedCategory === 'CYCLES' ? '#ef4444' : 'var(--text-secondary)',
            }}
          >
            🔄 Cycles ({cycles.length})
          </button>
        )}

        {muleFindings.length > 0 && (
          <button
            onClick={() => setSelectedCategory('MULES')}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === 'MULES' ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
              backgroundColor: selectedCategory === 'MULES' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-secondary)',
              color: selectedCategory === 'MULES' ? '#f59e0b' : 'var(--text-secondary)',
            }}
          >
            ⚡ Mule Chains ({muleFindings.length})
          </button>
        )}

        {highRiskFindings.length > 0 && (
          <button
            onClick={() => setSelectedCategory('HIGH_RISK')}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === 'HIGH_RISK' ? '1px solid #a855f7' : '1px solid var(--border-subtle)',
              backgroundColor: selectedCategory === 'HIGH_RISK' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-secondary)',
              color: selectedCategory === 'HIGH_RISK' ? '#a855f7' : 'var(--text-secondary)',
            }}
          >
            ⚠️ High-Risk ({highRiskFindings.length})
          </button>
        )}
      </div>

      {totalFindingsCount === 0 ? (
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          No anomalous graph patterns detected in this subgraph.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
          {/* Render Cycles */}
          {showCycles &&
            cycles.map((c) => (
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
                    🔄 Circular Flow ({c.hopCount} Hops)
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

          {/* Render Filtered Findings */}
          {filteredFindings.map((f) => (
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
                  Trace on Graph
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
