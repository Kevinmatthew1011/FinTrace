import { RiskFactor, RiskEvidence } from './riskTypes';
import { STRUCTURING_CONFIG, TRANSACTION_RISK_WEIGHTS } from './riskConfig';

export interface StructuringCandidateTx {
  id: string;
  amount: number;
  timestamp: Date;
  senderAccountId: string;
  receiverAccountId: string;
}

export class StructuringAnalyzer {
  analyzeStructuring(
    transactions: StructuringCandidateTx[],
    maxWeight: number = TRANSACTION_RISK_WEIGHTS.PATTERN_STRUCTURING
  ): RiskFactor {
    const nearThreshold = transactions.filter(
      (tx) =>
        tx.amount >= STRUCTURING_CONFIG.LOWER_BOUND_INR &&
        tx.amount <= STRUCTURING_CONFIG.UPPER_BOUND_INR
    );

    const evidence: RiskEvidence[] = [];

    if (nearThreshold.length >= STRUCTURING_CONFIG.MIN_BURST_COUNT) {
      const totalStructuringVol = nearThreshold.reduce((sum, tx) => sum + tx.amount, 0);
      const contribution = nearThreshold.length >= 10 ? maxWeight : Math.round(maxWeight * 0.7);
      const severity = nearThreshold.length >= 10 ? 'CRITICAL' : 'HIGH';

      evidence.push({
        statement: `${nearThreshold.length} repetitive transactions clustered between ₹${STRUCTURING_CONFIG.LOWER_BOUND_INR.toLocaleString('en-IN')} and ₹${STRUCTURING_CONFIG.UPPER_BOUND_INR.toLocaleString('en-IN')}`,
        metricName: 'Sub-Threshold Transfer Count',
        metricValue: nearThreshold.length,
        threshold: `${STRUCTURING_CONFIG.MIN_BURST_COUNT} transactions beneath ₹50,000 threshold`,
        relatedTransactionIds: nearThreshold.map((t) => t.id),
      });

      evidence.push({
        statement: `Cumulative structured volume: ₹${(totalStructuringVol / 100000).toFixed(2)} Lakhs intended to evade single-ticket CTR filing`,
        metricName: 'Cumulative Structured Volume',
        metricValue: `₹${(totalStructuringVol / 100000).toFixed(2)} Lakhs`,
      });

      return {
        id: 'factor-structuring-smurfing',
        name: 'Sub-Threshold Structuring / Smurfing',
        category: 'PATTERN',
        contribution,
        weight: maxWeight,
        severity,
        explanation: `Detected repetitive micro-structuring: ${nearThreshold.length} transactions deliberately sized beneath statutory ₹50,000 reporting threshold.`,
        evidence,
        relatedRecords: { transactionIds: nearThreshold.map((t) => t.id) },
      };
    }

    return {
      id: 'factor-structuring-smurfing',
      name: 'Sub-Threshold Structuring / Smurfing',
      category: 'PATTERN',
      contribution: 0,
      weight: maxWeight,
      severity: 'LOW',
      explanation: 'No repetitive sub-threshold structuring patterns identified.',
      evidence: [],
      relatedRecords: {},
    };
  }
}

export const structuringAnalyzer = new StructuringAnalyzer();
