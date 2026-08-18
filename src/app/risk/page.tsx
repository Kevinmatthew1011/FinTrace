'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/common/Header';
import { MetricCard } from '@/components/common/MetricCard';
import { RiskScoreCard } from '@/components/risk/RiskScoreCard';
import { FactorBreakdown } from '@/components/risk/FactorBreakdown';
import { EvidenceDossier } from '@/components/risk/EvidenceDossier';
import { RiskDistribution } from '@/components/dashboard/RiskDistribution';
import { HighRiskEntities } from '@/components/dashboard/HighRiskEntities';
import { RiskAssessment, RiskOverviewStats } from '@/modules/risk-engine';
import { LoadingState, ErrorState } from '@/components/common/StateViews';

export default function RiskIntelligencePage() {
  const [selectedEntityId, setSelectedEntityId] = useState('ENT-8821'); // Apex Logistics default
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [overview, setOverview] = useState<RiskOverviewStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRiskData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, assessRes] = await Promise.all([
        fetch('/api/v1/risk/overview'),
        fetch(`/api/v1/risk/entity?entityId=${encodeURIComponent(selectedEntityId)}`),
      ]);

      if (!overviewRes.ok || !assessRes.ok) {
        throw new Error('Failed to retrieve risk intelligence records from database');
      }

      const overviewJson = await overviewRes.json();
      const assessJson = await assessRes.json();

      if (overviewJson.success && assessJson.success) {
        setOverview(overviewJson.data);
        setAssessment(assessJson.data);
      } else {
        throw new Error(assessJson.error?.message || 'Error loading risk data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Risk Engine query failed');
    } finally {
      setLoading(false);
    }
  }, [selectedEntityId]);

  useEffect(() => {
    loadRiskData();
  }, [loadRiskData]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const res = await fetch('/api/v1/risk/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId: selectedEntityId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAssessment(json.data);
      }
    } catch (err) {
      console.error('Recalculate error:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedEntityId(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />

      {/* Page Title & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Risk Intelligence & Multi-Factor Engine
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Deterministic, explainable risk scoring across amounts, velocity, structuring, counterparties & network graph
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search Subject ID (e.g. ENT-4109, ENT-8821)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px 0 0 4px',
              padding: '6px 12px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              outline: 'none',
              minWidth: '260px',
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ borderRadius: '0 4px 4px 0', padding: '6px 12px', fontSize: '12px' }}
          >
            Inspect Subject
          </button>
        </form>
      </div>

      {/* Phase 5 AI Intelligence Quick-Jump Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
              AI Investigation Assistant — Coming Soon
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Next-generation releases will introduce conversational case summarization and automated STR report drafting.
            </div>
          </div>
        </div>

        <a
          href="/ai"
          className="btn-primary"
          style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none' }}
        >
          View AI Roadmap ➔
        </a>
      </div>

      {/* Top Overview KPI Ribbon */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <MetricCard
            title="Total Assessed Entities"
            value={overview.totalEntitiesAssessed}
            periodComparison="PostgreSQL Data Store"
          />
          <MetricCard
            title="Critical Risk Entities"
            value={overview.criticalEntitiesCount}
            subValue={`${overview.highRiskEntitiesCount} High Risk Subjects`}
            isAlert={true}
          />
          <MetricCard
            title="Critical Risk Transactions"
            value={overview.criticalTransactionsCount}
            subValue={`${overview.highRiskTransactionsCount} High Risk Transfers`}
            isAlert={true}
          />
          <MetricCard
            title="Engine Version"
            value="v1.0.0"
            subValue="risk-engine-v1"
          />
        </div>
      )}

      {loading ? (
        <LoadingState message="Executing multi-factor risk assessment algorithms..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadRiskData} />
      ) : assessment ? (
        <>
          {/* Main Inspection Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Score Card */}
              <RiskScoreCard
                assessment={assessment}
                onRecalculate={handleRecalculate}
                isRecalculating={isRecalculating}
              />

              {/* Evidence Dossier */}
              <EvidenceDossier evidence={assessment.evidenceList} />
            </div>

            {/* Factor Contribution Breakdown */}
            <FactorBreakdown factors={assessment.factors} />
          </div>

          {/* Bottom Grid: Risk Distribution & High Risk Entity Queue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <RiskDistribution />
            <HighRiskEntities limit={8} />
          </div>
        </>
      ) : null}
    </div>
  );
}
