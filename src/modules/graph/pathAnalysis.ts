import { GraphRepository, graphRepository } from './graphRepository';
import { GraphPath } from './graphTypes';
import { RiskLevel } from '@prisma/client';

export class PathAnalyzer {
  constructor(private repo: GraphRepository = graphRepository) {}

  async findPath(sourceEntityId: string, targetEntityId: string, maxHops = 5): Promise<GraphPath | null> {
    if (sourceEntityId === targetEntityId) return null;

    const allTxs = await this.repo.getAllActiveTransactions(2000);

    // Build Adjacency Map
    interface StepEdge {
      targetEntityId: string;
      senderEntityName: string;
      receiverEntityName: string;
      senderAccountId: string;
      receiverAccountId: string;
      transactionId: string;
      referenceNumber: string;
      amount: number;
      channel: string;
      timestamp: Date;
      riskScore: number;
      riskLevel: RiskLevel;
    }

    const adj = new Map<string, StepEdge[]>();
    const entityNames = new Map<string, string>();

    for (const tx of allTxs) {
      const s = tx.senderAccount.entity;
      const r = tx.receiverAccount.entity;
      entityNames.set(s.id, s.name);
      entityNames.set(r.id, r.name);

      if (!adj.has(s.id)) adj.set(s.id, []);
      adj.get(s.id)!.push({
        targetEntityId: r.id,
        senderEntityName: s.name,
        receiverEntityName: r.name,
        senderAccountId: tx.senderAccountId,
        receiverAccountId: tx.receiverAccountId,
        transactionId: tx.id,
        referenceNumber: tx.referenceNumber,
        amount: Number(tx.amount),
        channel: tx.channel,
        timestamp: tx.timestamp,
        riskScore: tx.riskScore,
        riskLevel: tx.riskLevel,
      });
    }

    // BFS Shortest Path
    const queue: Array<{ entityId: string; path: StepEdge[] }> = [{ entityId: sourceEntityId, path: [] }];
    const visited = new Set<string>([sourceEntityId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.entityId === targetEntityId) {
        // Path Found!
        const edges = current.path;
        const totalVal = edges.reduce((sum, e) => sum + e.amount, 0);
        const timestamps = edges.map((e) => e.timestamp.getTime());
        const hours = Math.max(0.1, (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 3600));
        const highestScore = Math.max(...edges.map((e) => e.riskScore), 0);
        const highestLevel: RiskLevel = highestScore >= 80 ? 'CRITICAL' : highestScore >= 60 ? 'HIGH' : 'MEDIUM';

        const nodePath = [sourceEntityId, ...edges.map((e) => e.targetEntityId)];
        const edgePath = edges.map((e) => e.transactionId);

        const transactions = edges.map((e) => ({
          id: e.transactionId,
          referenceNumber: e.referenceNumber,
          senderEntity: e.senderEntityName,
          receiverEntity: e.receiverEntityName,
          amount: e.amount,
          channel: e.channel,
          timestamp: e.timestamp.toISOString(),
          riskScore: e.riskScore,
          riskLevel: e.riskLevel,
        }));

        const chainStr = nodePath.map((id) => entityNames.get(id) || id).join(' ➔ ');

        return {
          sourceId: sourceEntityId,
          targetId: targetEntityId,
          sourceLabel: entityNames.get(sourceEntityId) || sourceEntityId,
          targetLabel: entityNames.get(targetEntityId) || targetEntityId,
          hops: edges.length,
          nodePath,
          edgePath,
          transactions,
          totalValueRupees: totalVal,
          timeSpanHours: Number(hours.toFixed(1)),
          highestRiskScore: highestScore,
          highestRiskLevel: highestLevel,
          evidence: [
            `Identified ${edges.length}-hop financial connection: ${chainStr}`,
            `Transferred ₹${(totalVal / 100000).toFixed(2)}L across ${edges.length} transactions in ${hours.toFixed(1)} hours`,
            `Highest intermediate transaction risk rating: ${highestScore}/100 (${highestLevel})`,
          ],
        };
      }

      if (current.path.length >= maxHops) continue;

      const neighbors = adj.get(current.entityId) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.targetEntityId)) {
          visited.add(edge.targetEntityId);
          queue.push({
            entityId: edge.targetEntityId,
            path: [...current.path, edge],
          });
        }
      }
    }

    return null;
  }
}

export const pathAnalyzer = new PathAnalyzer();
