'use client';

import React from 'react';
import { RiskBadge } from '../common/RiskBadge';

interface CaseOverviewTabProps {
  dossier: {
    caseDetails: {
      id: string;
      caseNumber: string;
      title: string;
      description: string;
      findings?: string;
      tags: string[];
    };
    primaryEntity?: {
      id: string;
      name: string;
      entityType: string;
      registrationNum?: string | null;
      taxIdentifier?: string | null;
      jurisdiction: string;
      riskScore: number;
      riskLevel: string;
      isSanctioned: boolean;
      isPEP: boolean;
      accounts?: any[];
    } | null;
    evidenceSummary: {
      totalEvidenceCount: number;
      criticalEvidenceCount: number;
      linkedAlertsCount: number;
      linkedTransactionsCount: number;
      linkedEntitiesCount: number;
      linkedAccountsCount: number;
      networkCyclesCount: number;
      riskAssessmentsCount: number;
    };
  };
  onSelectTab: (tab: string) => void;
}

export const CaseOverviewTab: React.FC<CaseOverviewTabProps> = ({ dossier, onSelectTab }) => {
  const { caseDetails, primaryEntity, evidenceSummary } = dossier;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Evidence Summary KPI Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          onClick={() => onSelectTab('evidence')}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 14px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Evidence</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {evidenceSummary.totalEvidenceCount}
          </div>
          <div style={{ fontSize: '10px', color: '#ef4444' }}>
            {evidenceSummary.criticalEvidenceCount} Critical / High
          </div>
        </div>

        <div
          onClick={() => onSelectTab('alerts')}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 14px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Linked Alerts</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>
            {evidenceSummary.linkedAlertsCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Originating triggers</div>
        </div>

        <div
          onClick={() => onSelectTab('transactions')}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 14px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Transactions</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {evidenceSummary.linkedTransactionsCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Directly audited</div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Entities Involved</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {evidenceSummary.linkedEntitiesCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {evidenceSummary.linkedAccountsCount} Accounts
          </div>
        </div>

        <div
          onClick={() => onSelectTab('network')}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 14px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Network Cycles</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: evidenceSummary.networkCyclesCount > 0 ? '#ef4444' : 'var(--text-primary)' }}>
            {evidenceSummary.networkCyclesCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Phase 3 topologies</div>
        </div>

        <div
          onClick={() => onSelectTab('risk')}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 14px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Risk Syntheses</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>
            {evidenceSummary.riskAssessmentsCount > 0 ? 'Active' : 'Pending'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Phase 4 & 5 Engines</div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '16px' }}>
        {/* Left Column: Primary Entity Subject */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Primary Entity Subject
            </h3>
            {primaryEntity && (
              <RiskBadge level={primaryEntity.riskLevel as any} score={primaryEntity.riskScore} />
            )}
          </div>

          {primaryEntity ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {primaryEntity.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="font-mono">
                  {primaryEntity.id} • {primaryEntity.entityType}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tax ID (PAN/GSTIN): </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {primaryEntity.taxIdentifier || 'Not Provided'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Reg Number: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {primaryEntity.registrationNum || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Jurisdiction: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {primaryEntity.jurisdiction}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Linked Accounts: </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {primaryEntity.accounts?.length || 0} Accounts
                  </span>
                </div>
              </div>

              {(primaryEntity.isSanctioned || primaryEntity.isPEP) && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {primaryEntity.isSanctioned && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '10px',
                      }}
                    >
                      ⛔ SANCTIONED LISTED
                    </span>
                  )}
                  {primaryEntity.isPEP && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        fontWeight: 600,
                        fontSize: '10px',
                      }}
                    >
                      ⚠️ POLITICALLY EXPOSED PERSON (PEP)
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              No primary entity explicitly linked. (Attached alerts provide cross-entity context)
            </p>
          )}
        </div>

        {/* Right Column: Case Synopsis & Description */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Investigation Synopsis
          </h3>

          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              backgroundColor: 'var(--bg-secondary)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              maxHeight: '180px',
              overflowY: 'auto',
            }}
          >
            {caseDetails.description}
          </div>

          {caseDetails.tags && caseDetails.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {caseDetails.tags.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-muted)',
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
