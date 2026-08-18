import { RiskFactor, RiskEvidence } from './riskTypes';
import { TRANSACTION_RISK_WEIGHTS } from './riskConfig';

export interface AmountHistoricalBaseline {
  averageAmount: number;
  medianAmount: number;
  maxHistoricalAmount: number;
  historyCount: number;
}

export class AmountAnomalyAnalyzer {
  analyzeAmountAnomaly(
    currentAmount: number,
    baseline: AmountHistoricalBaseline,
    transactionId?: string
  ): RiskFactor {
    const maxWeight = TRANSACTION_RISK_WEIGHTS.AMOUNT_ANOMALY;
    const evidence: RiskEvidence[] = [];

    if (baseline.historyCount < 3) {
      return {
        id: 'factor-amount-baseline-insufficient',
        name: 'Amount History Baseline',
        category: 'AMOUNT',
        contribution: 0,
        weight: maxWeight,
        severity: 'LOW',
        explanation: 'Insufficient historical transactions to establish statistical amount baseline (< 3 past transactions).',
        evidence: [
          {
            statement: 'Insufficient historical transactions',
            metricName: 'Historical Transaction Count',
            metricValue: baseline.historyCount,
          },
        ],
        relatedRecords: { transactionIds: transactionId ? [transactionId] : [] },
      };
    }

    const ratio = currentAmount / Math.max(1, baseline.averageAmount);
    let contribution = 0;
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (ratio >= 10 || (currentAmount >= 1000000 && ratio >= 5)) {
      contribution = maxWeight; // 15 pts
      severity = 'CRITICAL';
    } else if (ratio >= 5 || (currentAmount >= 500000 && ratio >= 3)) {
      contribution = Math.round(maxWeight * 0.75); // 11 pts
      severity = 'HIGH';
    } else if (ratio >= 2.5) {
      contribution = Math.round(maxWeight * 0.45); // 7 pts
      severity = 'MEDIUM';
    } else {
      contribution = 0;
      severity = 'LOW';
    }

    evidence.push({
      statement: `Current transaction of ₹${currentAmount.toLocaleString('en-IN')} is ${ratio.toFixed(1)}× historical average`,
      metricName: 'Amount-to-Average Ratio',
      metricValue: `${ratio.toFixed(1)}x`,
      threshold: '2.5x deviation',
      relatedTransactionIds: transactionId ? [transactionId] : [],
    });

    evidence.push({
      statement: `Account historical average: ₹${Math.round(baseline.averageAmount).toLocaleString('en-IN')} across ${baseline.historyCount} transactions`,
      metricName: 'Historical Mean Amount',
      metricValue: `₹${Math.round(baseline.averageAmount).toLocaleString('en-IN')}`,
    });

    return {
      id: 'factor-amount-anomaly',
      name: 'Transaction Amount Anomaly',
      category: 'AMOUNT',
      contribution,
      weight: maxWeight,
      severity,
      explanation:
        contribution > 0
          ? `Transaction amount (₹${currentAmount.toLocaleString('en-IN')}) deviates significantly from historical baseline (${ratio.toFixed(1)}× average).`
          : `Transaction amount is aligned with normal historical baseline profile.`,
      evidence,
      relatedRecords: { transactionIds: transactionId ? [transactionId] : [] },
    };
  }
}

export const amountAnomalyAnalyzer = new AmountAnomalyAnalyzer();
