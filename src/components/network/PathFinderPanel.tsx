'use client';

import React, { useState } from 'react';
import { GraphPath } from '@/modules/graph/graphTypes';
import { RiskBadge } from '../common/RiskBadge';

interface PathFinderPanelProps {
  onHighlightPath: (nodeIds: string[], txIds: string[]) => void;
}

export const PathFinderPanel: React.FC<PathFinderPanelProps> = ({ onHighlightPath }) => {
  const [source, setSource] = useState('ENT-8821'); // Apex Logistics
  const [target, setTarget] = useState('ENT-7731'); // Ramesh K (Mule Alpha)
  const [loading, setLoading] = useState(false);
  const [pathResult, setPathResult] = useState<GraphPath | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearchPath = async () => {
    if (!source || !target) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/v1/network/path?source=${encodeURIComponent(source.trim())}&target=${encodeURIComponent(target.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPathResult(json.data);
        onHighlightPath(json.data.nodePath, json.data.edgePath);
      } else {
        setPathResult(null);
      }
    } catch (err) {
      console.error('Path search failed:', err);
      setPathResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
        Forensic Path Discovery
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          type="text"
          placeholder="Source Entity ID (e.g. ENT-8821)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '12px',
            color: 'var(--text-primary)',
          }}
        />

        <input
          type="text"
          placeholder="Target Entity ID (e.g. ENT-7731)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '12px',
            color: 'var(--text-primary)',
          }}
        />

        <button
          onClick={handleSearchPath}
          disabled={loading || !source || !target}
          className="btn-primary"
          style={{ padding: '6px', fontSize: '12px', textAlign: 'center' }}
        >
          {loading ? 'Tracing Database Path...' : 'Trace Money Flow Path'}
        </button>
      </div>

      {searched && !loading && !pathResult && (
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          No transactional path found between {source} and {target} within 5 hops.
        </div>
      )}

      {pathResult && (
        <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-blue)' }}>
              Path Found: {pathResult.hops} Hops
            </span>
            <RiskBadge level={pathResult.highestRiskLevel} score={pathResult.highestRiskScore} />
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Total Value: <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(pathResult.totalValueRupees / 100000).toFixed(2)} Lakhs</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            {pathResult.transactions.map((tx, i) => (
              <div key={tx.id} style={{ fontSize: '10px', padding: '4px 6px', backgroundColor: 'var(--bg-card)', borderRadius: '4px' }}>
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>Hop {i + 1}:</span>{' '}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.senderEntity}</span> ➔{' '}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.receiverEntity}</span>{' '}
                <span className="font-mono" style={{ color: '#ef4444' }}>(₹{tx.amount.toLocaleString('en-IN')})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
