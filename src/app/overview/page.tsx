'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MetricCard } from '@/components/common/MetricCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { RiskDistribution } from '@/components/dashboard/RiskDistribution';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
import { HighRiskEntities } from '@/components/dashboard/HighRiskEntities';
import { NetworkPreview } from '@/components/dashboard/NetworkPreview';
import { InvestigationSummary } from '@/components/dashboard/InvestigationSummary';
import { RegionalActivity } from '@/components/dashboard/RegionalActivity';
import { Header } from '@/components/common/Header';
import { LoadingState, ErrorState } from '@/components/common/StateViews';

interface DashboardSummaryState {
  summary: {
    totalTransactions: { count: number; formatted: string; changePercentage: number; periodComparison: string };
    suspiciousTransactions: { count: number; formatted: string; changePercentage: number; periodComparison: string; percentageOfTotal: number };
    activeAlerts: { count: number; criticalCount: number; highCount: number; mediumCount: number; lowCount: number; changePercentage: number };
    highRiskEntities: { count: number; formatted: string; changePercentage: number; periodComparison: string };
    investigationsSummary: { openCount: number; underReviewCount: number; criticalCount: number; recentlyClosedCount: number };
  };
  riskDistribution: Array<{ level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; label: string; count: number; percentage: number; volumeRupees: number }>;
  regionalActivity: Array<{ region: string; transactionCount: number; volumeRupees: number; percentage: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }>;
}

export default function OverviewPage() {
  const [data, setData] = useState<DashboardSummaryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/dashboard/summary');
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        throw new Error(json.error?.message || 'Failed to load summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header bar with dynamic refresh */}
      <Header onRefresh={fetchSummary} lastUpdated={lastUpdated} isRefreshing={isRefreshing} />

      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Financial Crime Intelligence Overview
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Live PostgreSQL 16 Telemetry • 560+ Transations • 120+ Entities • Real-Time Fraud Triage
        </p>
      </div>

      {loading ? (
        <LoadingState message="Calculating real-time KPI metrics from PostgreSQL..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSummary} />
      ) : data ? (
        <>
          {/* KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <MetricCard
              title="Total Transactions (DB)"
              value={data.summary.totalTransactions.formatted}
              changePercentage={data.summary.totalTransactions.changePercentage}
              periodComparison={data.summary.totalTransactions.periodComparison}
            />

            <MetricCard
              title="Suspicious Transactions"
              value={data.summary.suspiciousTransactions.formatted}
              subValue={`${(data.summary.suspiciousTransactions.percentageOfTotal * 100).toFixed(2)}% of total volume`}
              changePercentage={data.summary.suspiciousTransactions.changePercentage}
              periodComparison={data.summary.suspiciousTransactions.periodComparison}
              isAlert={true}
            />

            <MetricCard
              title="Active Alerts"
              value={data.summary.activeAlerts.count}
              subValue={`${data.summary.activeAlerts.criticalCount} Critical • ${data.summary.activeAlerts.highCount} High`}
              changePercentage={data.summary.activeAlerts.changePercentage}
              periodComparison="in active queue"
              isAlert={true}
            />

            <MetricCard
              title="High-Risk Entities"
              value={data.summary.highRiskEntities.formatted}
              changePercentage={data.summary.highRiskEntities.changePercentage}
              periodComparison={data.summary.highRiskEntities.periodComparison}
            />
          </div>

          {/* Section 1: Activity Chart & Risk Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <ActivityChart />
            <RiskDistribution />
          </div>

          {/* Section 2: Network Flow Preview & Active Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            <NetworkPreview />
            <AlertsSection limit={3} />
          </div>

          {/* Section 3: Suspicious Transaction Table */}
          <TransactionTable limit={8} showFilters={true} />

          {/* Section 4: High-Risk Entities & Regional Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
            <HighRiskEntities limit={5} />
            <RegionalActivity />
          </div>

          {/* Section 5: Investigation Case Management */}
          <InvestigationSummary />
        </>
      ) : null}
    </div>
  );
}
