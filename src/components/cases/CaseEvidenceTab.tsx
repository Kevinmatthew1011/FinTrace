'use client';

import React, { useState } from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { EvidenceType, RiskLevel } from '@prisma/client';

interface EvidenceItem {
  id: string;
  evidenceType: EvidenceType;
  title: string;
  description: string;
  source: string;
  sourceId?: string | null;
  severity: RiskLevel;
  metadata?: any;
  createdBy?: {
    id: string;
    name: string;
    badgeNumber?: string | null;
  } | null;
  createdAt: string;
}

interface CaseEvidenceTabProps {
  caseId: string;
  evidences: EvidenceItem[];
  onRefresh: () => void;
}

export const CaseEvidenceTab: React.FC<CaseEvidenceTabProps> = ({ caseId, evidences, onRefresh }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formType, setFormType] = useState<EvidenceType>('SYSTEM_FINDING');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSource, setFormSource] = useState('INVESTIGATOR_FINDING');
  const [formSourceId, setFormSourceId] = useState('');
  const [formSeverity, setFormSeverity] = useState<RiskLevel>('HIGH');

  const filteredEvidences =
    filterType === 'ALL' ? evidences : evidences.filter((e) => e.evidenceType === filterType);

  const getSourceNavigationLink = (ev: EvidenceItem) => {
    if (ev.evidenceType === 'TRANSACTION' && ev.sourceId) {
      return `/transactions?search=${encodeURIComponent(ev.sourceId)}`;
    }
    if (ev.evidenceType === 'ENTITY' && ev.sourceId) {
      return `/network?entityId=${encodeURIComponent(ev.sourceId)}`;
    }
    if (ev.evidenceType === 'ACCOUNT' && ev.sourceId) {
      return `/network?search=${encodeURIComponent(ev.sourceId)}`;
    }
    if (ev.evidenceType === 'ALERT' && ev.sourceId) {
      return `/alerts?search=${encodeURIComponent(ev.sourceId)}`;
    }
    if (ev.evidenceType === 'NETWORK') {
      return `/network`;
    }
    if (ev.evidenceType === 'RISK_ASSESSMENT') {
      return `/risk`;
    }
    return null;
  };

  const handleAddEvidence = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Please enter evidence title and description');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceType: formType,
          title: formTitle,
          description: formDescription,
          source: formSource,
          sourceId: formSourceId || undefined,
          severity: formSeverity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormTitle('');
        setFormDescription('');
        setFormSourceId('');
        onRefresh();
      } else {
        alert(data.error?.message || 'Error adding evidence');
      }
    } catch {
      alert('Network error adding evidence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Action Header & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            'ALL',
            'ALERT',
            'TRANSACTION',
            'ENTITY',
            'NETWORK',
            'RISK_ASSESSMENT',
            'SYSTEM_FINDING',
            'INVESTIGATOR_NOTE',
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: filterType === type ? 'var(--accent-primary, #3b82f6)' : 'var(--bg-secondary)',
                color: filterType === type ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '5px',
            border: 'none',
            backgroundColor: 'var(--accent-primary, #3b82f6)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          + Add Evidence Item
        </button>
      </div>

      {/* Evidence List */}
      {filteredEvidences.length === 0 ? (
        <div
          style={{
            padding: '30px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          No evidence items matching filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredEvidences.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvidence(ev)}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary, #3b82f6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--accent-primary, #3b82f6)',
                    }}
                  >
                    {ev.evidenceType}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ev.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RiskBadge level={ev.severity} />
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {ev.description}
              </p>

              {/* Source & Creator Metadata Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '8px',
                  marginTop: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>
                    Source: <strong style={{ color: 'var(--text-secondary)' }}>{ev.source}</strong>
                  </span>
                  {ev.sourceId && (
                    <span className="font-mono">
                      Ref ID: <strong style={{ color: 'var(--text-secondary)' }}>{ev.sourceId}</strong>
                    </span>
                  )}
                  {ev.createdBy && (
                    <span>
                      Logged by: <strong style={{ color: 'var(--text-secondary)' }}>{ev.createdBy.name}</strong>
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>
                    {new Date(ev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent-primary, #3b82f6)', fontWeight: 600 }}>
                    Inspect ↗
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forensic Evidence Detail Modal */}
      {selectedEvidence && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--accent-primary, #3b82f6)',
                    }}
                  >
                    {selectedEvidence.evidenceType}
                  </span>
                  <RiskBadge level={selectedEvidence.severity} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
                  {selectedEvidence.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px' }}>
              {selectedEvidence.description}
            </div>

            {/* Forensic Detail Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                fontSize: '12px',
                backgroundColor: 'var(--bg-secondary)',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Evidence ID</span>
                <span className="font-mono" style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {selectedEvidence.id}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Case ID</span>
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                  {caseId}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Originating Source</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {selectedEvidence.source}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Source Record ID</span>
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                  {selectedEvidence.sourceId || 'None'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Logged By</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {selectedEvidence.createdBy?.name || 'System Engine'} {selectedEvidence.createdBy?.badgeNumber ? `(${selectedEvidence.createdBy.badgeNumber})` : ''}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Timestamp</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {new Date(selectedEvidence.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Metadata Payload Box */}
            {selectedEvidence.metadata && Object.keys(selectedEvidence.metadata).length > 0 && (
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                  Evidence Snapshot Metadata (JSON)
                </span>
                <pre
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                  }}
                >
                  {JSON.stringify(selectedEvidence.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <div>
                {getSourceNavigationLink(selectedEvidence) ? (
                  <a
                    href={getSourceNavigationLink(selectedEvidence)!}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      color: 'var(--accent-primary, #3b82f6)',
                      borderRadius: '5px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      textDecoration: 'none',
                    }}
                  >
                    Open Source ↗
                  </a>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Source record direct link unavailable
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedEvidence(null)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Evidence Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '24px',
              width: '460px',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Add Evidence to Case Dossier
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Evidence Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as EvidenceType)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                >
                  <option value="SYSTEM_FINDING">SYSTEM FINDING</option>
                  <option value="TRANSACTION">TRANSACTION</option>
                  <option value="ENTITY">ENTITY</option>
                  <option value="NETWORK">NETWORK FINDING</option>
                  <option value="RISK_ASSESSMENT">RISK ASSESSMENT</option>
                  <option value="INVESTIGATOR_NOTE">INVESTIGATOR NOTE</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Severity Level
                </label>
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value as RiskLevel)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Evidence Title *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Sub-Threshold IMPS Burst Pattern"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Description & Forensic Findings *
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Detailed explanation of the evidence, anomalies observed, and significance..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Source Label
                </label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="e.g. FORENSIC_LOGS"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Source Reference ID (Optional)
                </label>
                <input
                  type="text"
                  value={formSourceId}
                  onChange={(e) => setFormSourceId(e.target.value)}
                  placeholder="e.g. TXN-2026-0881"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvidence}
                disabled={loading}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-primary, #3b82f6)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Attaching...' : 'Attach Evidence'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
