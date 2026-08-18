'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/common/Header';
import { MetricCard } from '@/components/common/MetricCard';
import { AIPredictionCard } from '@/components/ai/AIPredictionCard';
import { AnomalyScoreCard } from '@/components/ai/AnomalyScoreCard';
import { RiskFusionMatrix } from '@/components/ai/RiskFusionMatrix';
import { XAIExplanationView } from '@/components/ai/XAIExplanationView';
import { SuspiciousPatternGraph } from '@/components/ai/SuspiciousPatternGraph';
import { AIAssessmentTimeline } from '@/components/ai/AIAssessmentTimeline';
import { FullAIAssessment, AIOverviewStats, AIAssessmentTargetType } from '@/modules/ai-engine';
import { LoadingState, ErrorState } from '@/components/common/StateViews';

export default function AIPredictiveIntelligencePage() {
  const [targetType, setTargetType] = useState<AIAssessmentTargetType>('ENTITY');
  const [selectedTargetId, setSelectedTargetId] = useState('ENT-8821'); // Apex Logistics default
  const [assessment, setAssessment] = useState<FullAIAssessment | null>(null);
  const [overview, setOverview] = useState<AIOverviewStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAIData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, assessRes] = await Promise.all([
        fetch('/api/v1/ai/overview'),
        fetch(`/api/v1/ai/assessment?targetType=${targetType}&targetId=${encodeURIComponent(selectedTargetId)}`),
      ]);

      if (!overviewRes.ok || !assessRes.ok) {
        throw new Error('Failed to retrieve AI predictive intelligence records');
      }

      const overviewJson = await overviewRes.json();
      const assessJson = await assessRes.json();

      if (overviewJson.success && assessJson.success) {
        setOverview(overviewJson.data);
        setAssessment(assessJson.data);
      } else {
        throw new Error(assessJson.error?.message || 'Error loading AI intelligence data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI Predictive Engine query failed');
    } finally {
      setLoading(false);
    }
  }, [targetType, selectedTargetId]);

  useEffect(() => {
    loadAIData();
  }, [loadAIData]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const res = await fetch('/api/v1/ai/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId: selectedTargetId }),
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
      const q = searchQuery.trim();
      if (q.startsWith('TX-') || q.startsWith('tx-')) {
        setTargetType('TRANSACTION');
      } else if (q.startsWith('ACC-') || q.startsWith('acc-')) {
        setTargetType('ACCOUNT');
      } else {
        setTargetType('ENTITY');
      }
      setSelectedTargetId(q);
      setSearchQuery('');
    }
  };

  const handleSelectFromTimeline = (tType: AIAssessmentTargetType, tId: string) => {
    setTargetType(tType);
    setSelectedTargetId(tId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Header />

      {/* Page Title & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Automated Anomaly Detection & Behavioral Baselines
            </h1>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontWeight: 700,
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              INTELLIGENCE ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Statistical Anomaly Baselines • Multi-Factor Risk Fusion • Explainable Pattern Detection • Generative AI Assistant: Coming Soon
          </p>
        </div>

        {/* Search / Target Select Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as AIAssessmentTargetType)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRight: 'none',
              borderRadius: '4px 0 0 4px',
              padding: '6px 10px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          >
            <option value="ENTITY">Entity</option>
            <option value="TRANSACTION">Transaction</option>
            <option value="ACCOUNT">Account</option>
          </select>
          <input
            type="text"
            placeholder="Subject ID (e.g. ENT-8821, ENT-4109, TX-9001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              outline: 'none',
              minWidth: '220px',
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ borderRadius: '0 4px 4px 0', padding: '6px 12px', fontSize: '12px' }}
          >
            AI Inspect
          </button>
        </form>
      </div>

      {/* Top Overview KPI Ribbon */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <MetricCard
            title="Total AI Inferences"
            value={overview.totalAssessments}
            periodComparison="PostgreSQL Neural Store"
          />
          <MetricCard
            title="High-Confidence Fraud"
            value={overview.highConfidenceFraudCount}
            subValue={`${overview.likelyFraudCount} Likely Fraud Flags`}
            isAlert={true}
          />
          <MetricCard
            title="Average Fraud Probability"
            value={`${(overview.averageFraudProbability * 100).toFixed(1)}%`}
            subValue={`Anomaly Base: ${overview.averageAnomalyScore.toFixed(1)}/100`}
            isAlert={overview.averageFraudProbability >= 0.4}
          />
          <MetricCard
            title="AI Model Version"
            value="v1.5.0"
            subValue="FinTrace-NeuralEnsemble-v1"
          />
        </div>
      )}

      {loading ? (
        <LoadingState message="Calculating statistical baseline deviations and multi-factor risk fusion..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadAIData} />
      ) : assessment ? (
        <>
          {/* Main Inspection Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* AI Prediction & Probability Card */}
              <AIPredictionCard
                assessment={assessment}
                onRecalculate={handleRecalculate}
                isRecalculating={isRecalculating}
              />

              {/* Anomaly Score Card */}
              <AnomalyScoreCard anomalyResult={assessment.anomalyResult} />

              {/* Complex Detected Patterns */}
              <SuspiciousPatternGraph patterns={assessment.suspiciousPatterns} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Risk Fusion Matrix (Phase 3 + Phase 4 + Phase 5) */}
              <RiskFusionMatrix fusionResult={assessment.fusionResult} />

              {/* Explainable AI (XAI) Evidence Dossier */}
              <XAIExplanationView
                evidenceList={assessment.evidence}
                predictionResult={assessment.predictionResult}
              />
            </div>
          </div>

          {/* Bottom Stream: Real-Time AI Assessment Timeline */}
          {overview && (
            <AIAssessmentTimeline
              recentAssessments={overview.recentAssessments}
              onSelectSubject={handleSelectFromTimeline}
            />
          )}
        </>
      ) : null}
    </div>
  );
}
