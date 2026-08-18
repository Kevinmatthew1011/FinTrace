'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { LoadingState, ErrorState } from '@/components/common/StateViews';
import { CaseHeader } from '@/components/cases/CaseHeader';
import { CaseOverviewTab } from '@/components/cases/CaseOverviewTab';
import { CaseEvidenceTab } from '@/components/cases/CaseEvidenceTab';
import { CaseTransactionsTab } from '@/components/cases/CaseTransactionsTab';
import { CaseNetworkTab } from '@/components/cases/CaseNetworkTab';
import { CaseRiskTab } from '@/components/cases/CaseRiskTab';
import { CaseAlertsTab } from '@/components/cases/CaseAlertsTab';
import { CaseNotesTab } from '@/components/cases/CaseNotesTab';
import { CaseTimelineTab } from '@/components/cases/CaseTimelineTab';

export default function CaseDossierPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.caseId as string;

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const loadDossier = useCallback(async () => {
    if (!caseId) return;
    try {
      const res = await fetch(`/api/v1/cases/${caseId}`);
      const data = await res.json();
      if (data.success) {
        setDossier(data.data);
      } else {
        throw new Error(data.error?.message || 'Error loading case dossier');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database error loading case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadDossier();
  }, [loadDossier]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />

      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <button
          onClick={() => router.push('/investigations')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-primary, #3b82f6)',
            cursor: 'pointer',
            padding: 0,
            fontSize: '12px',
          }}
        >
          ← Back to Investigation Queue
        </button>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
          {dossier?.caseDetails?.caseNumber || caseId}
        </span>
      </div>

      {loading ? (
        <LoadingState message="Retrieving comprehensive case dossier from PostgreSQL..." />
      ) : error || !dossier ? (
        <ErrorState message={error || 'Case not found'} onRetry={loadDossier} />
      ) : (
        <>
          {/* Header Action Ribbon */}
          <CaseHeader caseData={dossier.caseDetails} onRefresh={loadDossier} />

          {/* Dossier Tabs Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-subtle)',
              gap: '4px',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'evidence', label: `Evidence (${dossier.evidences?.length || 0})` },
              { id: 'transactions', label: `Transactions (${dossier.transactions?.length || 0})` },
              { id: 'network', label: 'Network Graph' },
              { id: 'risk', label: 'Risk Assessment' },
              { id: 'alerts', label: `Alerts (${dossier.alerts?.length || 0})` },
              { id: 'notes', label: `Notes (${dossier.notes?.length || 0})` },
              { id: 'timeline', label: `Audit Timeline (${dossier.auditTimeline?.length || 0})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--accent-primary, #3b82f6)' : '2px solid transparent',
                    color: isActive ? 'var(--accent-primary, #3b82f6)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panes */}
          {activeTab === 'overview' && (
            <CaseOverviewTab dossier={dossier} onSelectTab={setActiveTab} />
          )}

          {activeTab === 'evidence' && (
            <CaseEvidenceTab
              caseId={dossier.caseDetails.id}
              evidences={dossier.evidences}
              onRefresh={loadDossier}
            />
          )}

          {activeTab === 'transactions' && (
            <CaseTransactionsTab
              caseId={dossier.caseDetails.id}
              transactions={dossier.transactions}
              onRefresh={loadDossier}
            />
          )}

          {activeTab === 'network' && (
            <CaseNetworkTab
              caseId={dossier.caseDetails.id}
              primaryEntityId={dossier.primaryEntity?.id}
              primaryEntityName={dossier.primaryEntity?.name}
              networkFindings={dossier.networkFindings}
              onRefresh={loadDossier}
            />
          )}

          {activeTab === 'risk' && (
            <CaseRiskTab
              caseId={dossier.caseDetails.id}
              deterministicRisk={dossier.deterministicRisk}
              aiRiskAssessment={dossier.aiRiskAssessment}
              onRefresh={loadDossier}
            />
          )}

          {activeTab === 'alerts' && (
            <CaseAlertsTab
              caseId={dossier.caseDetails.id}
              alerts={dossier.alerts}
              onRefresh={loadDossier}
            />
          )}

          {activeTab === 'notes' && (
            <CaseNotesTab
              caseId={dossier.caseDetails.id}
              notes={dossier.notes}
              onRefresh={loadDossier}
            />
          )}

          {activeTab === 'timeline' && (
            <CaseTimelineTab timeline={dossier.auditTimeline} />
          )}
        </>
      )}
    </div>
  );
}
