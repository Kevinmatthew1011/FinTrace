'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';

export default function AIAssistantComingSoonPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Header />

      {/* Main Container Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Header Ribbon */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
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
                padding: '3px 10px',
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

          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            AI-Assisted Financial Crime Investigation
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
            FinTrace currently provides comprehensive evidence-grounded fraud detection, behavioral anomaly analysis, multi-factor risk scoring, graph network intelligence, and end-to-end case management. The next generation will introduce an AI Investigation Assistant to help investigators summarize cases, explain risk drivers, and surface relevant evidence.
          </p>
        </div>

        {/* Feature Comparison Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Active Features */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>✓</span>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current FinTrace Platform (Active & Verified)
              </h2>
            </div>

            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Deterministic Multi-Factor Risk Intelligence:</strong> Rule-based evaluation with transparent scoring across velocity, amount anomalies, structuring, and counterparty exposure.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Fraud Network & Graph Intelligence:</strong> Multi-hop traversal, circular fund loop detection, and mule-chain account topology analysis.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Alert Prioritization & Investigator Triage:</strong> Real-time severity scoring, deduplication, and direct case conversion.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Full Investigation Dossier Management:</strong> Case lifecycle tracking, evidence docketing, immutable audit trails, and investigator notes.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Explainable Risk Attribution:</strong> Direct evidence-grounded factor contribution breakdown in the Risk tab.
              </li>
            </ul>
          </div>

          {/* Planned AI Capabilities */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>⏳</span>
              <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Advanced AI Capabilities (Coming Soon)
              </h2>
            </div>

            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Natural Language Case Summaries:</strong> Automated synthesis of multi-source investigation dossiers into executive briefs.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Interactive Investigation Q&A:</strong> Natural language querying across subpoenaed bank records and transaction histories.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Evidence Gap Discovery:</strong> Automated identification of missing KYC, corporate registrar filings, and wire documentation.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Automated STR Report Drafting:</strong> FIU-compliant Suspicious Transaction Report narrative generation.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Cross-Case Syndicate Discovery:</strong> Machine learning pattern correlation across independent investigations.
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Navigation Footer */}
        <div
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '8px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary, #3b82f6)' }}>
              Ready for Live Investigation Work
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Access the operational investigation queue, fraud network graph, and risk intelligence engine today.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/investigations"
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '12px', textDecoration: 'none' }}
            >
              Open Investigations Queue ➔
            </Link>
            <Link
              href="/network"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
            >
              Inspect Fraud Network ➔
            </Link>
            <Link
              href="/risk"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
            >
              View Risk Intelligence ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
