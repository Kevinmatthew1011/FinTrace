'use client';

import React, { useState } from 'react';
import { RiskBadge } from '../common/RiskBadge';
import Link from 'next/link';

interface CaseNetworkTabProps {
  caseId: string;
  primaryEntityId?: string;
  primaryEntityName?: string;
  networkFindings: any;
  onRefresh: () => void;
}

export const CaseNetworkTab: React.FC<CaseNetworkTabProps> = ({
  caseId,
  primaryEntityId,
  primaryEntityName,
  networkFindings,
  onRefresh,
}) => {
  const [attaching, setAttaching] = useState(false);

  if (!networkFindings) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}
      >
        No network graph analysis available for this case. Link a primary entity to explore graph intelligence.
      </div>
    );
  }

  const handleAttachNetworkEvidence = async () => {
    setAttaching(true);
    try {
      const cycleCount = networkFindings.cycles?.length || 0;
      const res = await fetch(`/api/v1/cases/${caseId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceType: 'NETWORK',
          title: `Network Intelligence Finding: ${primaryEntityName || 'Entity'} (Score: ${networkFindings.networkRiskScore}/100)`,
          description: `Graph engine identified ${cycleCount} circular fund cycles and ${networkFindings.highRiskConnections?.length || 0} high-risk counterparty links. Node Count: ${networkFindings.statistics?.nodeCount || 0}, Edge Count: ${networkFindings.statistics?.edgeCount || 0}.`,
          source: 'PHASE3_GRAPH_ENGINE',
          sourceId: primaryEntityId,
          severity: networkFindings.networkRiskLevel || 'HIGH',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Network findings attached to case evidence.');
        onRefresh();
      } else {
        alert(data.error?.message || 'Error attaching network evidence');
      }
    } catch {
      alert('Network error attaching network finding');
    } finally {
      setAttaching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Network Overview Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Network Intelligence & Topology
            </h3>
            <RiskBadge level={networkFindings.networkRiskLevel} score={networkFindings.networkRiskScore} />
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Multi-hop graph findings centered on {primaryEntityName || 'Subject Entity'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleAttachNetworkEvidence}
            disabled={attaching}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '5px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {attaching ? 'Attaching...' : '+ Attach Graph to Evidence'}
          </button>

          {primaryEntityId && (
            <Link
              href={`/network?entityId=${primaryEntityId}`}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '5px',
                backgroundColor: 'var(--accent-primary, #3b82f6)',
                color: '#ffffff',
                textDecoration: 'none',
              }}
            >
              Open Interactive Graph Explorer ↗
            </Link>
          )}
        </div>
      </div>

      {/* Network Topology Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {/* Detected Cycles */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Circular Fund Flow Cycles ({networkFindings.cycles?.length || 0})
            </h4>
            {networkFindings.cycles?.length > 0 && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>
                ⚠️ CAROUSEL SYNDICATE
              </span>
            )}
          </div>

          {networkFindings.cycles && networkFindings.cycles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {networkFindings.cycles.map((cy: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>
                    Cycle #{idx + 1}: {cy.length}-Node Loop
                  </div>
                  <div className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {cy.path?.join(' ➔ ') || 'A ➔ B ➔ C ➔ A'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              No closed circular fund loops detected within 3 hops.
            </p>
          )}
        </div>

        {/* High Risk Connections */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            High-Risk Neighbor Connections ({networkFindings.highRiskConnections?.length || 0})
          </h4>

          {networkFindings.highRiskConnections && networkFindings.highRiskConnections.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {networkFindings.highRiskConnections.map((conn: any, idx: number) => (
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
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {conn.name || conn.id}
                    </span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({conn.distance || 1} hop away)
                    </span>
                  </div>
                  <RiskBadge level={conn.riskLevel || 'HIGH'} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              No high-risk or sanctioned neighbor entities in immediate radius.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
