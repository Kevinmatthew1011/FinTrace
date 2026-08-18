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
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
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

                <div>
                  {new Date(ev.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
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
