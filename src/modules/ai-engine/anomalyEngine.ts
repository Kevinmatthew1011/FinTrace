import {
  ExtractedFeatures,
  BehavioralBaseline,
  AnomalyDetectionResult,
  AnomalyDeviationItem,
} from './aiTypes';
import { RiskLevel } from '@prisma/client';

export class AnomalyEngine {
  /**
   * Evaluate multi-dimensional deviations against behavioral baseline
   */
  detectAnomalies(
    features: ExtractedFeatures,
    baseline: BehavioralBaseline
  ): AnomalyDetectionResult {
    const deviations: AnomalyDeviationItem[] = [];
    let cumulativeAnomalyPoints = 0;

    // 1. Amount Anomaly Detection (Z-Score & Baseline Ratio)
    if (baseline.historyCount >= 3) {
      if (features.amountToMeanRatio >= 4.0 || features.amountZScore >= 3.0) {
        const severity: RiskLevel = features.amountToMeanRatio >= 8.0 ? 'CRITICAL' : 'HIGH';
        const points = features.amountToMeanRatio >= 8.0 ? 30 : 20;
        cumulativeAnomalyPoints += points;
        deviations.push({
          feature: 'Transaction Amount Deviation',
          observedValue: `₹${features.amount.toLocaleString('en-IN')}`,
          expectedBaseline: `₹${baseline.meanAmount.toLocaleString('en-IN')} (±₹${baseline.stdDevAmount.toLocaleString('en-IN')})`,
          deviationRatio: features.amountToMeanRatio,
          zScore: features.amountZScore,
          isAnomaly: true,
          severity,
          explanation: `Transaction amount is ${features.amountToMeanRatio.toFixed(1)}× above historical account average (Z-Score: +${features.amountZScore.toFixed(1)}σ).`,
        });
      } else if (features.amountToMeanRatio >= 2.2 || features.amountZScore >= 1.8) {
        cumulativeAnomalyPoints += 10;
        deviations.push({
          feature: 'Moderate Amount Elevation',
          observedValue: `₹${features.amount.toLocaleString('en-IN')}`,
          expectedBaseline: `₹${baseline.meanAmount.toLocaleString('en-IN')}`,
          deviationRatio: features.amountToMeanRatio,
          zScore: features.amountZScore,
          isAnomaly: true,
          severity: 'MEDIUM',
          explanation: `Transaction amount is ${features.amountToMeanRatio.toFixed(1)}× higher than usual baseline.`,
        });
      }
    }

    // 2. Velocity & Frequency Burst Anomaly
    if (features.count15m >= 8 || features.frequencyBurstZScore >= 4.0) {
      const severity: RiskLevel = features.count15m >= 12 ? 'CRITICAL' : 'HIGH';
      const points = features.count15m >= 12 ? 25 : 18;
      cumulativeAnomalyPoints += points;
      deviations.push({
        feature: 'Rapid Velocity Burst',
        observedValue: `${features.count15m} transfers in 15 mins (${features.count24h} in 24h)`,
        expectedBaseline: `${(baseline.meanDailyFrequency || 1).toFixed(1)} transfers/day`,
        deviationRatio: Number((features.count24h / Math.max(1, baseline.meanDailyFrequency)).toFixed(1)),
        zScore: features.frequencyBurstZScore,
        isAnomaly: true,
        severity,
        explanation: `Extreme transaction frequency burst: ${features.count15m} transfers dispatched within 15 minutes (Z-Score: +${features.frequencyBurstZScore.toFixed(1)}σ).`,
      });
    } else if (features.count1h >= 5) {
      cumulativeAnomalyPoints += 10;
      deviations.push({
        feature: 'Elevated Hourly Velocity',
        observedValue: `${features.count1h} transfers in 1 hour`,
        expectedBaseline: `${(baseline.meanDailyFrequency || 1).toFixed(1)} transfers/day`,
        deviationRatio: Number((features.count1h / Math.max(1, baseline.meanDailyFrequency)).toFixed(1)),
        zScore: features.frequencyBurstZScore,
        isAnomaly: true,
        severity: 'MEDIUM',
        explanation: `Unusual transaction acceleration: ${features.count1h} transfers dispatched in the past hour.`,
      });
    }

    // 3. Sub-threshold Structuring / Smurfing Pattern
    if (features.isSubThresholdStructuring) {
      cumulativeAnomalyPoints += 18;
      deviations.push({
        feature: 'Sub-Threshold Structuring Pattern',
        observedValue: `₹${features.amount.toLocaleString('en-IN')}`,
        expectedBaseline: '₹50,000 Mandatory Regulatory Reporting Limit',
        deviationRatio: 0.98,
        zScore: 1.5,
        isAnomaly: true,
        severity: 'HIGH',
        explanation: `Transaction amount clustered just below the ₹50,000 regulatory reporting threshold, indicating potential Smurfing/Structuring evasion.`,
      });
    }

    // 4. Dormancy Awakening Anomaly
    if (features.isDormantAwakening || features.dormancyDays >= 60) {
      const severity: RiskLevel = features.dormancyDays >= 90 ? 'CRITICAL' : 'HIGH';
      const points = features.dormancyDays >= 90 ? 22 : 14;
      cumulativeAnomalyPoints += points;
      deviations.push({
        feature: 'Dormant Account High-Value Awakening',
        observedValue: `${features.dormancyDays} dormant days prior to ₹${features.amount.toLocaleString('en-IN')} transfer`,
        expectedBaseline: 'Active continuous transaction stream',
        deviationRatio: features.dormancyDays,
        zScore: 3.2,
        isAnomaly: true,
        severity,
        explanation: `Account was dormant for ${features.dormancyDays} consecutive days before suddenly initiating high-volume fund transfers.`,
      });
    }

    // 5. Odd-Hour Night Timing Deviation
    if (features.isOddHourTransfer) {
      cumulativeAnomalyPoints += 10;
      deviations.push({
        feature: 'Abnormal Timing / Odd-Hour Transfer',
        observedValue: 'Dispatched between 11:00 PM and 5:00 AM IST',
        expectedBaseline: 'Standard commercial daytime operating hours (9:00 AM - 8:00 PM)',
        deviationRatio: 1.0,
        zScore: 1.8,
        isAnomaly: true,
        severity: 'MEDIUM',
        explanation: 'Transaction initiated during nocturnal off-peak hours (11 PM - 5 AM IST), deviating from typical customer activity schedules.',
      });
    }

    // 6. Counterparty Novelty & High-Risk Exposure
    if (features.highRiskCounterpartiesCount >= 2 || features.highRiskNeighborRatio >= 0.3) {
      const points = features.highRiskCounterpartiesCount >= 3 ? 20 : 12;
      cumulativeAnomalyPoints += points;
      deviations.push({
        feature: 'High-Risk Counterparty Adjacency',
        observedValue: `${features.highRiskCounterpartiesCount} high-risk entities interacted (${(features.highRiskNeighborRatio * 100).toFixed(0)}% high-risk neighbor ratio)`,
        expectedBaseline: '0 connections to flagged/sanctioned entities',
        deviationRatio: features.highRiskCounterpartiesCount,
        zScore: 2.5,
        isAnomaly: true,
        severity: 'HIGH',
        explanation: `Interacted with ${features.highRiskCounterpartiesCount} flagged high-risk entities in the immediate transaction neighborhood.`,
      });
    }

    // 7. Graph Topology Anomaly (Cycles, Mule Chains)
    if (features.cycleParticipationCount > 0 || features.muleChainLength >= 3) {
      const points = features.cycleParticipationCount > 0 ? 25 : 15;
      cumulativeAnomalyPoints += points;
      deviations.push({
        feature: 'Suspicious Network Graph Topology',
        observedValue: `${features.cycleParticipationCount} circular fund loops detected, mule chain depth: ${features.muleChainLength}`,
        expectedBaseline: 'Acyclic standard merchant-consumer flow',
        deviationRatio: features.cycleParticipationCount || 1,
        zScore: 3.5,
        isAnomaly: true,
        severity: 'CRITICAL',
        explanation: `Graph intelligence identified participation in ${features.cycleParticipationCount} closed fund-routing carousel loops and multi-tier mule chains.`,
      });
    }

    // Normalize aggregate anomaly score to [0, 100]
    const anomalyScore = Math.min(100, Math.max(0, cumulativeAnomalyPoints));
    const isAnomalous = anomalyScore >= 35;
    const severity: RiskLevel =
      anomalyScore >= 80 ? 'CRITICAL' : anomalyScore >= 60 ? 'HIGH' : anomalyScore >= 30 ? 'MEDIUM' : 'LOW';

    const topAnomalyDrivers = deviations
      .sort((a, b) => (b.severity === 'CRITICAL' ? 3 : b.severity === 'HIGH' ? 2 : 1) - (a.severity === 'CRITICAL' ? 3 : a.severity === 'HIGH' ? 2 : 1))
      .map((d) => d.explanation);

    return {
      anomalyScore,
      isAnomalous,
      severity,
      deviations,
      topAnomalyDrivers,
      baselineSnapshot: baseline,
    };
  }
}

export const anomalyEngine = new AnomalyEngine();
