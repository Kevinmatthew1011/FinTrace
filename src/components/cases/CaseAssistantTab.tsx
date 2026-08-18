'use client';

import React from 'react';

interface CaseAssistantTabProps {
  caseId: string;
  caseNumber: string;
  primaryEntityName?: string;
}

export const CaseAssistantTab: React.FC<CaseAssistantTabProps> = ({
  caseNumber,
  primaryEntityName,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Main Coming Soon Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--accent-primary, #3b82f6)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                AI Investigation Assistant
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Coming Soon
              </span>
            </div>

            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
              Automated Forensic Assistant — {caseNumber}
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              AI-assisted investigation will help investigators summarize complex cases, explain multi-factor risk drivers, and surface relevant forensic evidence.
            </p>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Subject: <strong style={{ color: 'var(--text-primary)' }}>{primaryEntityName || 'Assigned Subject'}</strong>
          </div>
        </div>

        {/* Current Active Features vs Planned AI Capability */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Active Features Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ✓ Current FinTrace Intelligence Active
            </span>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Deterministic Risk Intelligence:</strong> Multi-factor rule-based risk evaluation with transparent factor points.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Fraud Network Analysis:</strong> Circular loop and mule-chain graph traversal algorithms.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Evidence-Backed Findings:</strong> Structured evidence docketing with immutable audit logging.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Investigation Workflows:</strong> Case state transitions, assignment, escalation, resolution, and closure.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Case-Level Risk Explanations:</strong> Direct breakdown of transaction velocity and counterparty exposure in the Risk tab.
              </li>
            </ul>
          </div>

          {/* Planned AI Assistance Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⏳ Planned AI Capabilities (Coming Soon)
            </span>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Natural Language Case Summaries:</strong> Automated synthesis of multi-source investigation dossiers.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Interactive Investigation Q&A:</strong> Natural language querying across subpoenaed bank ledgers.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Evidence Gap Discovery:</strong> Automated flagging of missing regulatory compliance documentation.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Automated STR Report Drafting:</strong> FIU-compliant Suspicious Transaction Report generation.
              </li>
            </ul>
          </div>
        </div>

        {/* Note Box */}
        <div
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '6px',
            padding: '14px 18px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: 'var(--accent-primary, #3b82f6)' }}>Investigator Guidance:</strong> For current case analysis, utilize the structured tabs above (<strong>Evidence</strong>, <strong>Transactions</strong>, <strong>Network Graph</strong>, <strong>Risk Assessment</strong>, and <strong>Audit Timeline</strong>) to perform forensic reviews.
        </div>
      </div>
    </div>
  );
};
