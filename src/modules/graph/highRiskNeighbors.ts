import { GraphRepository, graphRepository } from './graphRepository';
import { HighRiskConnection, GraphFinding } from './graphTypes';

export class HighRiskNeighborAnalyzer {
  constructor(private repo: GraphRepository = graphRepository) {}

  async analyzeHighRiskNeighbors(entityId: string): Promise<{ connections: HighRiskConnection[]; findings: GraphFinding[] }> {
    const entity = await this.repo.getEntityWithAccounts(entityId);
    if (!entity) return { connections: [], findings: [] };

    const accIds = entity.accounts.map((a) => a.id);
    const txs = await this.repo.getTransactionsForAccounts(accIds);

    const directNeighbors = new Map<string, {
      name: string;
      type: string;
      riskScore: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      txCount: number;
      totalAmount: number;
      lastDate: Date;
    }>();

    for (const tx of txs) {
      const isSender = accIds.includes(tx.senderAccountId);
      const counterEntity = isSender ? tx.receiverAccount.entity : tx.senderAccount.entity;
      if (counterEntity.id === entityId) continue;

      if (!directNeighbors.has(counterEntity.id)) {
        directNeighbors.set(counterEntity.id, {
          name: counterEntity.name,
          type: counterEntity.entityType,
          riskScore: counterEntity.riskScore,
          riskLevel: counterEntity.riskLevel,
          txCount: 0,
          totalAmount: 0,
          lastDate: tx.timestamp,
        });
      }

      const entry = directNeighbors.get(counterEntity.id)!;
      entry.txCount++;
      entry.totalAmount += Number(tx.amount);
      if (tx.timestamp > entry.lastDate) entry.lastDate = tx.timestamp;
    }

    const connections: HighRiskConnection[] = [];
    for (const [cId, data] of directNeighbors.entries()) {
      if (data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL') {
        connections.push({
          entityId: cId,
          entityName: data.name,
          entityType: data.type,
          riskScore: data.riskScore,
          riskLevel: data.riskLevel,
          relationshipType: 'DIRECT',
          hopDistance: 1,
          transactionCount: data.txCount,
          totalAmountRupees: data.totalAmount,
          lastActive: data.lastDate.toISOString(),
        });
      }
    }

    connections.sort((a, b) => b.riskScore - a.riskScore);

    const findings: GraphFinding[] = [];
    if (connections.length >= 2) {
      const totalSuspiciousVol = connections.reduce((sum, c) => sum + c.totalAmountRupees, 0);
      findings.push({
        id: `finding-hrn-${entityId}`,
        type: 'HIGH_RISK_CONNECTION',
        severity: connections.some((c) => c.riskLevel === 'CRITICAL') ? 'CRITICAL' : 'HIGH',
        title: `High-Risk Counterparty Adjacency Density`,
        description: `Entity ${entity.name} is directly connected to ${connections.length} high-risk entities through ${connections.reduce((s, c) => s + c.transactionCount, 0)} transactions.`,
        evidence: [
          `${connections.length} direct counterparties flagged HIGH or CRITICAL risk`,
          `Total transaction exposure: ₹${(totalSuspiciousVol / 100000).toFixed(2)} Lakhs`,
          `Highest connected risk score: ${connections[0].riskScore}/100 (${connections[0].entityName})`,
        ],
        relatedNodeIds: [entityId, ...connections.map((c) => c.entityId)],
        relatedTransactionIds: [],
        riskScore: Math.min(95, 65 + connections.length * 8),
        riskLevel: connections.some((c) => c.riskLevel === 'CRITICAL') ? 'CRITICAL' : 'HIGH',
        recommendedFocus: 'Review invoices and commercial legitimacy between subject and top high-risk counterparties.',
      });
    }

    return { connections, findings };
  }
}

export const highRiskNeighborAnalyzer = new HighRiskNeighborAnalyzer();
