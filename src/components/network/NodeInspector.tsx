'use client';

import React from 'react';
import { GraphNode } from '@/modules/graph/graphTypes';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';

interface NodeInspectorProps {
  node: GraphNode | null;
  onClose: () => void;
  onSetRoot: (nodeId: string) => void;
  onExpandDepth: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onClose,
  onSetRoot,
  onExpandDepth,
}) => {
  if (!node) return null;

  const isEntity = node.type === 'ENTITY';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
            {node.type} INSPECTION DOSSIER
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {node.label}
          </h3>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {node.id}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <RiskBadge level={node.riskLevel} score={node.riskScore} />
        {node.isMule && <StatusBadge label="MULE ACCOUNT" variant="danger" />}
        {node.isFrozen && <StatusBadge label="FROZEN" variant="danger" />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px' }}>
        {isEntity ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Entity Type:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.entityType?.replace('_', ' ')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sublabel / Tax ID:</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{node.sublabel}</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bank Institution:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.bankName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account Number:</span>
              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{node.accountNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Linked Subject:</span>
              <span className="font-mono" style={{ color: 'var(--accent-blue)' }}>{node.entityId}</span>
            </div>
          </>
        )}
      </div>

      {/* Forensic Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={() => onSetRoot(node.id)}
          className="btn-primary"
          style={{ flex: 1, padding: '6px 10px', fontSize: '11px', textAlign: 'center' }}
        >
          Center As Root Node
        </button>
        <button
          onClick={onExpandDepth}
          className="btn-secondary"
          style={{ padding: '6px 10px', fontSize: '11px' }}
        >
          +1 Hop
        </button>
      </div>
    </div>
  );
};
