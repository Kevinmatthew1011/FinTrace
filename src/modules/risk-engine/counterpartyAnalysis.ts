import { RiskFactor, RiskEvidence } from './riskTypes';
import { TRANSACTION_RISK_WEIGHTS, ENTITY_RISK_WEIGHTS } from './riskConfig';

export interface CounterpartyProfile {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isSanctioned: boolean;
  isPEP: boolean;
  entityType: string;
}

export class CounterpartyAnalyzer {
  analyzeCounterparty(
    counterparties: CounterpartyProfile[],
    maxWeight: number = TRANSACTION_RISK_WEIGHTS.COUNTERPARTY
  ): RiskFactor {
    const evidence: RiskEvidence[] = [];

    const criticalCounterparties = counterparties.filter((c) => c.riskLevel === 'CRITICAL' || c.isSanctioned);
    const highCounterparties = counterparties.filter((c) => c.riskLevel === 'HIGH');

    let contribution = 0;
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let explanation = '';

    if (criticalCounterparties.length > 0) {
      contribution = maxWeight; // 15 pts
      severity = 'CRITICAL';
      const names = criticalCounterparties.map((c) => `${c.name} (${c.riskScore}/100)`).join(', ');
      explanation = `Direct transaction interaction with CRITICAL-risk counterparty: ${names}.`;
      evidence.push({
        statement: `Connected to ${criticalCounterparties.length} counterparty rated CRITICAL risk / Sanctioned`,
        metricName: 'Critical Counterparty Score',
        metricValue: criticalCounterparties[0].riskScore,
        relatedEntityIds: criticalCounterparties.map((c) => c.id),
      });
    } else if (highCounterparties.length > 0) {
      contribution = Math.round(maxWeight * 0.65); // 10 pts
      severity = 'HIGH';
      explanation = `Transacting with HIGH-risk counterparties: ${highCounterparties.map((c) => c.name).join(', ')}.`;
      evidence.push({
        statement: `Connected to ${highCounterparties.length} HIGH-risk counterparties`,
        metricName: 'High-Risk Counterparty Count',
        metricValue: highCounterparties.length,
        relatedEntityIds: highCounterparties.map((c) => c.id),
      });
    } else {
      contribution = 0;
      severity = 'LOW';
      explanation = 'Counterparty entities exhibit low baseline risk indicators.';
    }

    return {
      id: 'factor-counterparty-risk',
      name: 'Counterparty Risk Exposure',
      category: 'COUNTERPARTY',
      contribution,
      weight: maxWeight,
      severity,
      explanation,
      evidence,
      relatedRecords: { entityIds: counterparties.map((c) => c.id) },
    };
  }
}

export const counterpartyAnalyzer = new CounterpartyAnalyzer();
