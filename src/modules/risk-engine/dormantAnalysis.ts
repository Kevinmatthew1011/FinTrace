import { RiskFactor, RiskEvidence } from './riskTypes';
import { DORMANCY_CONFIG, ACCOUNT_RISK_WEIGHTS } from './riskConfig';

export class DormantAnalyzer {
  analyzeDormancy(params: {
    lastActiveDate?: Date | null;
    currentTransactionDate: Date;
    recentVolumeINR: number;
    recentTxCount: number;
    accountId?: string;
  }): RiskFactor {
    const maxWeight = ACCOUNT_RISK_WEIGHTS.DORMANCY_TAKEOVER;
    const evidence: RiskEvidence[] = [];

    if (!params.lastActiveDate) {
      return {
        id: 'factor-dormancy',
        name: 'Dormant Account Surge Activation',
        category: 'BEHAVIOR',
        contribution: 0,
        weight: maxWeight,
        severity: 'LOW',
        explanation: 'Account activity is active with regular historical touchpoints.',
        evidence: [],
        relatedRecords: {},
      };
    }

    const inactiveDays = Math.round(
      (params.currentTransactionDate.getTime() - params.lastActiveDate.getTime()) / (1000 * 3600 * 24)
    );

    if (
      inactiveDays >= DORMANCY_CONFIG.INACTIVITY_DAYS_THRESHOLD &&
      params.recentVolumeINR >= DORMANCY_CONFIG.SURGE_MIN_AMOUNT_INR
    ) {
      const contribution = inactiveDays >= 60 ? maxWeight : Math.round(maxWeight * 0.7);
      const severity = inactiveDays >= 60 ? 'CRITICAL' : 'HIGH';

      evidence.push({
        statement: `Account was completely dormant for ${inactiveDays} days prior to sudden reactivation`,
        metricName: 'Inactivity Period',
        metricValue: `${inactiveDays} days`,
        threshold: `${DORMANCY_CONFIG.INACTIVITY_DAYS_THRESHOLD} days`,
        relatedAccountIds: params.accountId ? [params.accountId] : [],
      });

      evidence.push({
        statement: `Post-reactivation turnover: ₹${(params.recentVolumeINR / 100000).toFixed(2)}L across ${params.recentTxCount} transactions`,
        metricName: 'Post-Reactivation Volume',
        metricValue: `₹${(params.recentVolumeINR / 100000).toFixed(2)}L`,
      });

      return {
        id: 'factor-dormancy-takeover',
        name: 'Dormant Account Surge Activation',
        category: 'BEHAVIOR',
        contribution,
        weight: maxWeight,
        severity,
        explanation: `Suspicious dormant account takeover pattern: account inactive for ${inactiveDays} days suddenly moved ₹${(params.recentVolumeINR / 100000).toFixed(2)}L.`,
        evidence,
        relatedRecords: { accountIds: params.accountId ? [params.accountId] : [] },
      };
    }

    return {
      id: 'factor-dormancy',
      name: 'Dormant Account Surge Activation',
      category: 'BEHAVIOR',
      contribution: 0,
      weight: maxWeight,
      severity: 'LOW',
      explanation: 'Account displays standard activity profile with no prolonged dormancy spikes.',
      evidence: [],
      relatedRecords: {},
    };
  }
}

export const dormantAnalyzer = new DormantAnalyzer();
