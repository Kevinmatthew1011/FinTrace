'use client';

import React, { useState } from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { RiskBadge } from '../common/RiskBadge';
import { CasePriority, CaseStatus, CaseResolutionType, RiskLevel } from '@prisma/client';

interface CaseHeaderProps {
  caseData: {
    id: string;
    caseNumber: string;
    title: string;
    description: string;
    priority: CasePriority;
    status: CaseStatus;
    riskScore: number;
    riskLevel: RiskLevel;
    assignedInvestigator: {
      id: string;
      name: string;
      email: string;
      badgeNumber?: string | null;
      role: string;
    } | null;
    escalationReason?: string;
    escalatedAt?: string;
    resolutionType?: CaseResolutionType;
    resolutionSummary?: string;
    resolvedAt?: string;
    resolvedBy?: {
      id: string;
      name: string;
      badgeNumber?: string | null;
    } | null;
    createdAt: string;
    updatedAt: string;
  };
  onRefresh: () => void;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({ caseData, onRefresh }) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState<CaseStatus>(caseData.status);
  const [statusReason, setStatusReason] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationPriority, setEscalationPriority] = useState<CasePriority>('CRITICAL');
  const [resolutionType, setResolutionType] = useState<CaseResolutionType>('CONFIRMED_FRAUD');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [closureSummary, setClosureSummary] = useState('');

  const handleUpdateStatus = async () => {
    setLoadingAction('status');
    try {
      const res = await fetch(`/api/v1/cases/${caseData.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason: statusReason }),
      });
      const data = await res.json();
      if (data.success) {
        setShowStatusModal(false);
        setStatusReason('');
        onRefresh();
      } else {
        alert(data.error?.message || 'Error updating status');
      }
    } catch {
      alert('Network error updating status');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEscalate = async () => {
    if (!escalationReason.trim()) {
      alert('Please enter an escalation reason');
      return;
    }
    setLoadingAction('escalate');
    try {
      const res = await fetch(`/api/v1/cases/${caseData.id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: escalationReason, priority: escalationPriority }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEscalateModal(false);
        setEscationReason('');
        onRefresh();
      } else {
        alert(data.error?.message || 'Error escalating case');
      }
    } catch {
      alert('Network error escalating case');
    } finally {
      setLoadingAction(null);
    }
  };

  function setEscationReason(val: string) {
    setEscalationReason(val);
  }

  const handleResolve = async () => {
    if (!resolutionSummary.trim()) {
      alert('Please enter a resolution summary');
      return;
    }
    setLoadingAction('resolve');
    try {
      const res = await fetch(`/api/v1/cases/${caseData.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionType, summary: resolutionSummary }),
      });
      const data = await res.json();
      if (data.success) {
        setShowResolveModal(false);
        setResolutionSummary('');
        onRefresh();
      } else {
        alert(data.error?.message || 'Error resolving case');
      }
    } catch {
      alert('Network error resolving case');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleClose = async () => {
    if (!closureSummary.trim()) {
      alert('Please enter a closure summary');
      return;
    }
    setLoadingAction('close');
    try {
      const res = await fetch(`/api/v1/cases/${caseData.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: closureSummary }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCloseModal(false);
        setClosureSummary('');
        onRefresh();
      } else {
        alert(data.error?.message || 'Error closing case');
      }
    } catch {
      alert('Network error closing case');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRecalculateRisk = async () => {
    setLoadingAction('recalculate-risk');
    try {
      const res = await fetch(`/api/v1/cases/${caseData.id}/recalculate-risk`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        alert(data.error?.message || 'Error recalculating risk');
      }
    } catch {
      alert('Network error recalculating risk');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Top Bar: Case ID, Badges, and Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span
              className="font-mono"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--accent-primary, #3b82f6)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              {caseData.caseNumber}
            </span>
            <StatusBadge
              label={caseData.status.replace(/_/g, ' ')}
              variant={
                caseData.status === 'ESCALATED'
                  ? 'danger'
                  : caseData.status === 'RESOLVED' || caseData.status === 'CLOSED'
                  ? 'success'
                  : caseData.status === 'IN_REVIEW' || caseData.status === 'UNDER_REVIEW'
                  ? 'purple'
                  : 'info'
              }
            />
            <StatusBadge
              label={`Priority: ${caseData.priority}`}
              variant={caseData.priority === 'CRITICAL' || caseData.priority === 'URGENT' ? 'danger' : 'warning'}
            />
            <RiskBadge level={caseData.riskLevel} score={caseData.riskScore} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {caseData.title}
          </h1>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowStatusModal(true)}
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
            Change Status
          </button>

          {caseData.status !== 'ESCALATED' && caseData.status !== 'CLOSED' && (
            <button
              onClick={() => setShowEscalateModal(true)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '5px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                cursor: 'pointer',
              }}
            >
              ⚠️ Escalate Case
            </button>
          )}

          {caseData.status !== 'RESOLVED' && caseData.status !== 'CLOSED' && (
            <button
              onClick={() => setShowResolveModal(true)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '5px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                cursor: 'pointer',
              }}
            >
              ✓ Resolve Case
            </button>
          )}

          {caseData.status !== 'CLOSED' && (
            <button
              onClick={() => setShowCloseModal(true)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '5px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          )}

          <button
            onClick={handleRecalculateRisk}
            disabled={loadingAction === 'recalculate-risk'}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '5px',
              border: '1px solid var(--accent-primary, #3b82f6)',
              backgroundColor: 'var(--accent-primary, #3b82f6)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {loadingAction === 'recalculate-risk' ? 'Calculating...' : '🔄 Recalculate Risk'}
          </button>
        </div>
      </div>

      {/* Meta Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '12px 14px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '6px',
          fontSize: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Assigned Investigator: </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {caseData.assignedInvestigator?.name || 'Unassigned'}
          </span>
          {caseData.assignedInvestigator?.badgeNumber && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>
              ({caseData.assignedInvestigator.badgeNumber})
            </span>
          )}
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)' }}>Created: </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {new Date(caseData.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)' }}>Last Updated: </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {new Date(caseData.updatedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {caseData.resolvedBy && (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Resolved By: </span>
            <span style={{ fontWeight: 600, color: '#10b981' }}>{caseData.resolvedBy.name}</span>
          </div>
        )}
      </div>

      {/* Escalation / Resolution Banner if applicable */}
      {caseData.status === 'ESCALATED' && caseData.escalationReason && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: '2px' }}>
            ⚠️ Case Escalation Record
          </div>
          <p style={{ margin: 0, color: 'var(--text-primary)' }}>{caseData.escalationReason}</p>
        </div>
      )}

      {caseData.resolutionType && caseData.resolutionSummary && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '2px' }}>
            ✓ Resolution: {caseData.resolutionType.replace(/_/g, ' ')}
          </div>
          <p style={{ margin: 0, color: 'var(--text-primary)' }}>{caseData.resolutionSummary}</p>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
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
              width: '420px',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Update Case Status
            </h3>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as CaseStatus)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                <option value="OPEN">OPEN — Fresh intake</option>
                <option value="PENDING_REVIEW">PENDING_REVIEW — Awaiting lead review</option>
                <option value="IN_REVIEW">IN_REVIEW — Active forensic analysis</option>
                <option value="SUSPENDED">SUSPENDED — Blocked on external data</option>
                <option value="RESOLVED">RESOLVED — Investigation completed</option>
                <option value="CLOSED">CLOSED — Archived dossier</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Justification / Reason (Required if reopening)
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Enter transition rationale for the audit log..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowStatusModal(false)}
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
                onClick={handleUpdateStatus}
                disabled={loadingAction === 'status'}
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
                {loadingAction === 'status' ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
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
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '24px',
              width: '460px',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ef4444' }}>
              ⚠️ Escalate Case to Senior FIU / Management
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Escalation Priority Level
              </label>
              <select
                value={escalationPriority}
                onChange={(e) => setEscalationPriority(e.target.value as CasePriority)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                <option value="CRITICAL">CRITICAL — Immediate syndicate ring action</option>
                <option value="URGENT">URGENT — Rapid fund dissipation risk</option>
                <option value="HIGH">HIGH — Elevated exposure</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Escalation Justification & Findings *
              </label>
              <textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Explain why this case requires escalation (e.g. multi-hop circular fund flows, mule aggregations)..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowEscalateModal(false)}
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
                onClick={handleEscalate}
                disabled={loadingAction === 'escalate'}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {loadingAction === 'escalate' ? 'Escalating...' : 'Confirm Escalation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
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
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '24px',
              width: '460px',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#10b981' }}>
              ✓ Resolve Case Investigation
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Resolution Outcome
              </label>
              <select
                value={resolutionType}
                onChange={(e) => setResolutionType(e.target.value as CaseResolutionType)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                <option value="CONFIRMED_FRAUD">CONFIRMED_FRAUD — Fraud substantiated, STR recommended</option>
                <option value="SUSPICIOUS_ACTIVITY">SUSPICIOUS_ACTIVITY — Continued monitoring warranted</option>
                <option value="FALSE_POSITIVE">FALSE_POSITIVE — Legitimate commercial transaction confirmed</option>
                <option value="INSUFFICIENT_EVIDENCE">INSUFFICIENT_EVIDENCE — Inconclusive forensic evidence</option>
                <option value="REFERRED">REFERRED — Handed off to law enforcement</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Investigator Final Findings & Summary *
              </label>
              <textarea
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                placeholder="Document the comprehensive findings, evidence evaluated, and next steps taken..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowResolveModal(false)}
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
                onClick={handleResolve}
                disabled={loadingAction === 'resolve'}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {loadingAction === 'resolve' ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
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
              width: '420px',
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Finalize Case Closure
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              Closing the case archives this dossier. All evidence, notes, and the append-only audit trail are preserved permanently.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Closure Remarks *
              </label>
              <textarea
                value={closureSummary}
                onChange={(e) => setClosureSummary(e.target.value)}
                placeholder="Final remarks before dossier archival..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowCloseModal(false)}
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
                onClick={handleClose}
                disabled={loadingAction === 'close'}
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
                {loadingAction === 'close' ? 'Closing...' : 'Close & Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
