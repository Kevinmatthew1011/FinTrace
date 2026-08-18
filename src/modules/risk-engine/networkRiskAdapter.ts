import { RiskFactor, RiskEvidence } from './riskTypes';
import { graphIntelligenceService } from '@/modules/graph';
import { ENTITY_RISK_WEIGHTS, TRANSACTION_RISK_WEIGHTS } from './riskConfig';

export class NetworkRiskAdapter {
  async evaluateNetworkRiskForEntity(
    entityId: string,
    maxWeight: number = ENTITY_RISK_WEIGHTS.NETWORK_TOPOLOGY
  ): Promise<RiskFactor> {
    const analysis = await graphIntelligenceService.analyzeEntityNetwork(entityId);
    const evidence: RiskEvidence[] = [];

    const cycleCount = analysis.cycles.length;
    const muleFindings = analysis.findings.filter((f) => f.type === 'MULE_CHAIN');
    const highRiskNeighbors = analysis.highRiskConnections.length;

    let contribution = 0;
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (cycleCount > 0 && muleFindings.length > 0) {
      contribution = maxWeight; // 25 pts
      severity = 'CRITICAL';
    } else if (cycleCount > 0 || analysis.networkRiskScore >= 80) {
      contribution = Math.round(maxWeight * 0.85); // 21 pts
      severity = 'CRITICAL';
    } else if (highRiskNeighbors >= 2 || analysis.networkRiskScore >= 60) {
      contribution = Math.round(maxWeight * 0.6); // 15 pts
      severity = 'HIGH';
    } else if (analysis.networkRiskScore >= 30) {
      contribution = Math.round(maxWeight * 0.3); // 8 pts
      severity = 'MEDIUM';
    } else {
      contribution = 0;
      severity = 'LOW';
    }

    if (cycleCount > 0) {
      evidence.push({
        statement: `Entity participates in ${cycleCount} detected circular carousel laundering loop(s)`,
        metricName: 'Circular Loops Detected',
        metricValue: cycleCount,
        threshold: '0 loops permitted',
        relatedEntityIds: analysis.cycles.flatMap((c) => c.entities.map((e) => e.id)),
      });
    }

    if (muleFindings.length > 0) {
      evidence.push({
        statement: `Active money mule dispersal chain identified (${muleFindings[0].title})`,
        metricName: 'Mule Dispersal Chain',
        metricValue: muleFindings.length,
      });
    }

    if (highRiskNeighbors > 0) {
      evidence.push({
        statement: `Direct topological connection to ${highRiskNeighbors} HIGH/CRITICAL risk neighboring entities`,
        metricName: 'High-Risk Neighbors Count',
        metricValue: highRiskNeighbors,
        relatedEntityIds: analysis.highRiskConnections.map((c) => c.entityId),
      });
    }

    return {
      id: 'factor-network-topology',
      name: 'Graph Network Topology Risk',
      category: 'NETWORK',
      contribution,
      weight: maxWeight,
      severity,
      explanation:
        contribution > 0
          ? `Topological analysis revealed ${cycleCount} circular loop(s), ${muleFindings.length} mule chain(s), and ${highRiskNeighbors} high-risk adjacent node(s).`
          : 'Network graph exhibits decentralized low-risk topology.',
      evidence,
      relatedRecords: {
        entityIds: [entityId, ...analysis.highRiskConnections.map((c) => c.entityId)],
      },
    };
  }
}

export const networkRiskAdapter = new NetworkRiskAdapter();
