import { RiskFactor, RiskEvidence } from './riskTypes';
import { TRANSACTION_RISK_WEIGHTS, ENTITY_RISK_WEIGHTS, ACCOUNT_RISK_WEIGHTS } from './riskConfig';

export interface VelocityMetrics {
  count5m: number;
  count15m: number;
  count1h: number;
  count24h: number;
  outgoingValue24h: number;
  incomingValue24h?: number;
  uniqueCounterparties24h: number;
  relatedTransactionIds: string[];
}

export class VelocityAnalyzer {
  analyzeVelocity(metrics: VelocityMetrics, maxWeight: number = TRANSACTION_RISK_WEIGHTS.VELOCITY): RiskFactor {
    const evidence: RiskEvidence[] = [];
    let contribution = 0;
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let explanation = '';

    if (metrics.count15m >= 8 || metrics.count5m >= 5) {
      contribution = maxWeight; // e.g. 20 pts
      severity = 'CRITICAL';
      explanation = `Extreme transaction velocity detected: ${metrics.count15m} transactions initiated within a 15-minute window.`;
    } else if (metrics.count1h >= 10 || (metrics.count24h >= 20 && metrics.uniqueCounterparties24h >= 8)) {
      contribution = Math.round(maxWeight * 0.75); // 15 pts
      severity = 'HIGH';
      explanation = `Elevated transaction frequency: ${metrics.count1h} transactions within 1 hour across ${metrics.uniqueCounterparties24h} counterparties.`;
    } else if (metrics.count24h >= 8) {
      contribution = Math.round(maxWeight * 0.4); // 8 pts
      severity = 'MEDIUM';
      explanation = `Moderate transaction density: ${metrics.count24h} transactions in 24 hours.`;
    } else {
      contribution = 0;
      severity = 'LOW';
      explanation = 'Transaction velocity is within normal expected parameters.';
    }

    if (contribution > 0) {
      evidence.push({
        statement: `${metrics.count15m} transactions totaling ₹${(metrics.outgoingValue24h / 100000).toFixed(2)}L within 15-minute window`,
        metricName: '15-Minute Velocity Count',
        metricValue: metrics.count15m,
        timeWindow: '15 minutes',
        threshold: '5 transactions',
        relatedTransactionIds: metrics.relatedTransactionIds.slice(0, 10),
      });

      evidence.push({
        statement: `Interacted with ${metrics.uniqueCounterparties24h} distinct counterparties over 24-hour window`,
        metricName: '24-Hour Counterparty Diversity',
        metricValue: metrics.uniqueCounterparties24h,
        timeWindow: '24 hours',
      });
    }

    return {
      id: 'factor-velocity-burst',
      name: 'High-Frequency Transaction Velocity',
      category: 'VELOCITY',
      contribution,
      weight: maxWeight,
      severity,
      explanation,
      evidence,
      relatedRecords: { transactionIds: metrics.relatedTransactionIds.slice(0, 15) },
    };
  }
}

export const velocityAnalyzer = new VelocityAnalyzer();
