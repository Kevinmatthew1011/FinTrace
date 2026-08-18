import React from 'react';
import { demoDataService } from '@/modules/demo';
import { RiskBadge } from '../common/RiskBadge';

export const NetworkPreview: React.FC = () => {
  const graph = demoDataService.getNetworkGraph();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Fraud Network Relationship Flow
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Entity ➔ Account ➔ Transaction ➔ Account ➔ Entity topological path
          </p>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {graph.nodes.length} Nodes • {graph.edges.length} Edges
        </span>
      </div>

      {/* Visual Relationship Chain */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
          Active Multi-Hop Money Laundering Trail (Case #2026-0881):
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {/* Node 1: Origin Entity */}
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>ORIGIN ENTITY</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Apex Logistics</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ENT-8821</div>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>➔</span>

          {/* Node 2: Sender Account */}
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>SOURCE ACC</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>HDFC - 9912</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Layering Hub</div>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>➔</span>

          {/* Node 3: Txn */}
          <div style={{ padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>RTGS TRANSFER</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>₹8,90,000</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TXN-2026-0891</div>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>➔</span>

          {/* Node 4: Target Account */}
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>RECEIVER ACC</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>ICICI - 4410</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Dispersal Hub</div>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>➔</span>

          {/* Node 5: Split Txn */}
          <div style={{ padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>IMPS SPLIT</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>₹2,50,000</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TXN-2026-0892</div>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>➔</span>

          {/* Node 6: Mule Node */}
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>MULE ENDPOINT</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Ramesh K.</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SBI - 1082 (Crypto Exit)</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>Detected Topology: Rapid Dispersal + Mule Consolidation</span>
          <RiskBadge level="CRITICAL" score={95} />
        </div>
      </div>
    </div>
  );
};
