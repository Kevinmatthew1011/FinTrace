'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RiskBadge } from '@/components/common/RiskBadge';
import { LoadingState, ErrorState } from '@/components/common/StateViews';
import { CreateCaseModal } from '@/components/cases/CreateCaseModal';

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  priority: any;
  status: any;
  riskScore: number;
  riskLevel: any;
  primaryEntityName?: string;
  assignedInvestigator: string;
  investigatorBadge?: string;
  alertCount: number;
  evidenceCount: number;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}

interface OverviewKPIs {
  totalCases: number;
  openCases: number;
  pendingReviewCount: number;
  inReviewCount: number;
  escalatedCount: number;
  resolvedCount: number;
  criticalPriorityCount: number;
}

export default function InvestigationsPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [casesRes, kpiRes] = await Promise.all([
        fetch(
          `/api/v1/cases?search=${encodeURIComponent(search)}&status=${statusFilter}&priority=${priorityFilter}&limit=50`
        ),
        fetch('/api/v1/cases/overview'),
      ]);

      const casesData = await casesRes.json();
      const kpiData = await kpiRes.json();

      if (casesData.success) {
        setCases(casesData.data);
      } else {
        throw new Error(casesData.error?.message || 'Error loading cases');
      }

      if (kpiData.success) {
        setKpis(kpiData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database error loading cases');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />

      {/* Title & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Forensic Investigation Workspace
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Comprehensive case management, multi-source evidence docketing, and audit-grade resolution
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '6px',
            backgroundColor: 'var(--accent-primary, #3b82f6)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          + Open New Case
        </button>
      </div>

      {/* KPI Ribbon */}
      {kpis && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Cases</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {kpis.totalCases}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Active registry</div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Open Intake</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary, #3b82f6)' }}>
              {kpis.openCases}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Awaiting triage</div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In Active Review</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#8b5cf6' }}>
              {kpis.inReviewCount + kpis.pendingReviewCount}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Forensic analysis</div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Escalated Cases</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>
              {kpis.escalatedCount}
            </div>
            <div style={{ fontSize: '10px', color: '#ef4444' }}>Senior FIU attention</div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Critical Priority</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>
              {kpis.criticalPriorityCount}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>High impact</div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Resolved / Closed</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
              {kpis.resolvedCount}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>STR / Archival</div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case ID, title, description, or subject entity..."
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '12px',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '12px',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="PENDING_REVIEW">PENDING REVIEW</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '12px',
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="URGENT">URGENT</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Case Queue Table */}
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
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Active Case Queue ({cases.length})
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Live investigation cases from PostgreSQL
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading investigation cases..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : cases.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No investigation cases match your filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Case ID & Title</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Subject Entity</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Risk</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Assigned Investigator</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Docket</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <td style={{ padding: '10px' }}>
                      <Link
                        href={`/investigations/${c.id}`}
                        style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                      >
                        {c.title}
                      </Link>
                      <div style={{ fontSize: '10px', color: 'var(--accent-primary, #3b82f6)' }} className="font-mono">
                        {c.caseNumber}
                      </div>
                    </td>

                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                      {c.primaryEntityName || 'Multiple / Network'}
                    </td>

                    <td style={{ padding: '10px' }}>
                      <StatusBadge
                        label={c.priority}
                        variant={c.priority === 'URGENT' || c.priority === 'CRITICAL' ? 'danger' : 'warning'}
                      />
                    </td>

                    <td style={{ padding: '10px' }}>
                      <RiskBadge level={c.riskLevel} score={c.riskScore} />
                    </td>

                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                      {c.assignedInvestigator}
                      {c.investigatorBadge && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          ({c.investigatorBadge})
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {c.alertCount} alerts • {c.evidenceCount} ev
                    </td>

                    <td style={{ padding: '10px' }}>
                      <StatusBadge
                        label={c.status.replace(/_/g, ' ')}
                        variant={
                          c.status === 'ESCALATED'
                            ? 'danger'
                            : c.status === 'RESOLVED' || c.status === 'CLOSED'
                            ? 'success'
                            : c.status === 'IN_REVIEW' || c.status === 'UNDER_REVIEW'
                            ? 'purple'
                            : 'info'
                        }
                      />
                    </td>

                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <Link
                        href={`/investigations/${c.id}`}
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--accent-primary, #3b82f6)',
                          textDecoration: 'none',
                        }}
                      >
                        Inspect Dossier ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Intake Modal */}
      <CreateCaseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
