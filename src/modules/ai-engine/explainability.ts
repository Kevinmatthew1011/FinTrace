import {
  ExtractedFeatures,
  AnomalyDetectionResult,
  AIPredictionResult,
  RiskFusionResult,
  XAIEvidenceItem,
} from './aiTypes';

export class ExplainabilityService {
  /**
   * Synthesize understandable explainability evidence and recommended investigator action
   */
  generateEvidence(
    features: ExtractedFeatures,
    anomaly: AnomalyDetectionResult,
    prediction: AIPredictionResult,
    _fusion: RiskFusionResult
  ): {
    evidence: XAIEvidenceItem[];
    suggestedAction: string;
  } {
    const evidence: XAIEvidenceItem[] = [];

    // 1. Amount Anomaly Evidence
    if (features.amountToMeanRatio >= 2.0) {
      const dev = features.amountToMeanRatio;
      evidence.push({
        id: 'ev-amount-disparity',
        statement: `Transaction amount is ${dev.toFixed(1)}× above historical account average baseline.`,
        metricName: 'Amount-to-Baseline Ratio',
        metricValue: `₹${features.amount.toLocaleString('en-IN')}`,
        baselineValue: `₹${Math.round(features.amount / dev).toLocaleString('en-IN')}`,
        deviationRatio: dev,
        impactPercentage: Math.min(35, Math.round(dev * 5)),
        category: 'AMOUNT_ANOMALY',
        severity: dev >= 6.0 ? 'CRITICAL' : 'HIGH',
      });
    }

    // 2. Velocity & Frequency Evidence
    if (features.count15m >= 4) {
      evidence.push({
        id: 'ev-rapid-velocity',
        statement: `Unusual transaction velocity: ${features.count15m} transfers dispatched within a 15-minute window.`,
        metricName: '15-Minute Transfer Velocity',
        metricValue: `${features.count15m} transfers`,
        baselineValue: '1-2 transfers / day',
        deviationRatio: Number((features.count15m / 2).toFixed(1)),
        impactPercentage: 25,
        category: 'VELOCITY_BURST',
        severity: features.count15m >= 10 ? 'CRITICAL' : 'HIGH',
      });
    }

    // 3. Network Graph Evidence
    if (features.cycleParticipationCount > 0) {
      evidence.push({
        id: 'ev-graph-cycles',
        statement: `Subject entity actively participates in ${features.cycleParticipationCount} circular fund loops in Phase 3 graph intelligence.`,
        metricName: 'Circular Carousel Loops',
        metricValue: `${features.cycleParticipationCount} cycles`,
        baselineValue: '0 cycles (Acyclic)',
        deviationRatio: features.cycleParticipationCount,
        impactPercentage: 30,
        category: 'NETWORK_TOPOLOGY',
        severity: 'CRITICAL',
      });
    }

    if (features.highRiskCounterpartiesCount > 0) {
      evidence.push({
        id: 'ev-high-risk-counterparties',
        statement: `Direct transaction flow with ${features.highRiskCounterpartiesCount} high-risk or sanctioned counterparties.`,
        metricName: 'High-Risk Counterparty Adjacency',
        metricValue: `${features.highRiskCounterpartiesCount} entities`,
        baselineValue: '0 high-risk entities',
        deviationRatio: features.highRiskCounterpartiesCount,
        impactPercentage: 20,
        category: 'COUNTERPARTY_RISK',
        severity: features.highRiskCounterpartiesCount >= 2 ? 'CRITICAL' : 'HIGH',
      });
    }

    // 4. Structuring Evidence
    if (features.isSubThresholdStructuring) {
      evidence.push({
        id: 'ev-structuring',
        statement: `Transaction value of ₹${features.amount.toLocaleString('en-IN')} is strategically structured just below ₹50,000 reporting threshold.`,
        metricName: 'Threshold Proximity Margin',
        metricValue: `₹${features.amount.toLocaleString('en-IN')}`,
        baselineValue: '₹50,000 regulatory threshold',
        deviationRatio: 0.98,
        impactPercentage: 22,
        category: 'HISTORICAL_PATTERN',
        severity: 'HIGH',
      });
    }

    // 5. Dormancy Awakening Evidence
    if (features.isDormantAwakening || features.dormancyDays >= 45) {
      evidence.push({
        id: 'ev-dormant-spike',
        statement: `Account experienced an unexpected high-value surge after ${features.dormancyDays} days of dormancy.`,
        metricName: 'Inactivity Duration',
        metricValue: `${features.dormancyDays} days`,
        baselineValue: 'Active daily flows',
        deviationRatio: features.dormancyDays,
        impactPercentage: 20,
        category: 'BEHAVIORAL_DEVIATION',
        severity: features.dormancyDays >= 90 ? 'CRITICAL' : 'HIGH',
      });
    }

    // 6. Odd-Hour Evidence
    if (features.isOddHourTransfer) {
      evidence.push({
        id: 'ev-odd-hours',
        statement: 'Transaction was dispatched during nocturnal off-peak hours (11:00 PM - 5:00 AM IST).',
        metricName: 'Dispatched Timestamp Window',
        metricValue: 'Off-Peak Night',
        baselineValue: 'Business Hours (9 AM - 8 PM)',
        deviationRatio: 1.0,
        impactPercentage: 10,
        category: 'BEHAVIORAL_DEVIATION',
        severity: 'MEDIUM',
      });
    }

    // Fallback baseline statement if no strong anomalies
    if (evidence.length === 0) {
      evidence.push({
        id: 'ev-nominal-profile',
        statement: 'Transaction amount, velocity, and counterparty connections are well within standard historical baselines.',
        metricName: 'Baseline Alignment Index',
        metricValue: 'Conforming',
        baselineValue: 'Normal',
        deviationRatio: 1.0,
        impactPercentage: 100,
        category: 'BEHAVIORAL_DEVIATION',
        severity: 'LOW',
      });
    }

    // Determine actionable recommendation
    let suggestedAction = 'Monitor standard transaction feeds; no immediate intervention required.';
    if (prediction.classification === 'HIGH_CONFIDENCE_FRAUD') {
      suggestedAction =
        'IMMEDIATE ACTION: Temporarily freeze connected intermediary accounts, initiate Suspicious Transaction Report (STR) filing, and request comprehensive KYC re-verification.';
    } else if (prediction.classification === 'LIKELY_FRAUD') {
      suggestedAction =
        'URGENT REVIEW: Place subject under enhanced monitoring, require two-factor investigator sign-off for outgoing transfers > ₹1,00,000, and inspect counterparty syndicate.';
    } else if (prediction.classification === 'SUSPICIOUS') {
      suggestedAction =
        'FLAG FOR TRIAGE: Assign case to Financial Intelligence Unit analyst for behavioral trend review within 24 hours.';
    }

    return { evidence, suggestedAction };
  }
}

export const explainabilityService = new ExplainabilityService();
