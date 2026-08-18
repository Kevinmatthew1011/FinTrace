import { GraphRepository, graphRepository } from './graphRepository';
import { GraphCluster } from './graphTypes';
import { RiskLevel } from '@prisma/client';

export class ClusterAnalyzer {
  constructor(private repo: GraphRepository = graphRepository) {}

  async detectClusters(): Promise<GraphCluster[]> {
    const allTxs = await this.repo.getAllActiveTransactions(1500);

    // Build Undirected Adjacency for Connected Components
    const adj = new Map<string, Set<string>>();
    const entityData = new Map<string, { id: string; name: string; riskScore: number; riskLevel: RiskLevel; type: string }>();

    for (const tx of allTxs) {
      const s = tx.senderAccount.entity;
      const r = tx.receiverAccount.entity;

      if (!entityData.has(s.id)) entityData.set(s.id, { id: s.id, name: s.name, riskScore: s.riskScore, riskLevel: s.riskLevel, type: s.entityType });
      if (!entityData.has(r.id)) entityData.set(r.id, { id: r.id, name: r.name, riskScore: r.riskScore, riskLevel: r.riskLevel, type: r.entityType });

      if (!adj.has(s.id)) adj.set(s.id, new Set());
      if (!adj.has(r.id)) adj.set(r.id, new Set());

      adj.get(s.id)!.add(r.id);
      adj.get(r.id)!.add(s.id);
    }

    const visited = new Set<string>();
    const clusters: GraphCluster[] = [];

    for (const startId of adj.keys()) {
      if (visited.has(startId)) continue;

      const componentNodes: string[] = [];
      const queue = [startId];
      visited.add(startId);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        componentNodes.push(curr);

        for (const neighbor of adj.get(curr) || []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      if (componentNodes.length >= 3) {
        // Calculate cluster metrics
        const entities = componentNodes.map((id) => entityData.get(id)!).filter(Boolean);
        const highestRisk = Math.max(...entities.map((e) => e.riskScore));
        const dominantLevel: RiskLevel = highestRisk >= 80 ? 'CRITICAL' : highestRisk >= 60 ? 'HIGH' : 'MEDIUM';

        // Filter transactions strictly within this cluster
        const clusterNodeSet = new Set(componentNodes);
        const clusterTxs = allTxs.filter(
          (tx) => clusterNodeSet.has(tx.senderAccount.entity.id) && clusterNodeSet.has(tx.receiverAccount.entity.id)
        );

        const totalVol = clusterTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const suspiciousCount = clusterTxs.filter((tx) => tx.isSuspicious || tx.riskScore >= 60).length;

        const hasShell = entities.some((e) => e.type === 'SHELL_COMPANY');
        const hasMule = entities.some((e) => e.type === 'MULE_AGGREGATOR' || e.name.includes('Mule'));

        const hint = hasShell && hasMule
          ? 'Shell Company & Mule Layering Syndicate'
          : hasShell
          ? 'Circular Layering Ring'
          : hasMule
          ? 'Mule Dispersal Network'
          : 'High-Density Transaction Mesh';

        clusters.push({
          id: `cluster-${clusters.length + 1}`,
          name: `${entities[0].name} Syndicate Mesh`,
          memberNodeIds: componentNodes,
          entityCount: entities.length,
          accountCount: entities.length * 2,
          edgeCount: clusterTxs.length,
          suspiciousTxCount: suspiciousCount,
          totalVolumeRupees: totalVol,
          highestRiskScore: highestRisk,
          dominantRiskLevel: dominantLevel,
          typologyHint: hint,
        });
      }
    }

    clusters.sort((a, b) => b.highestRiskScore - a.highestRiskScore);
    return clusters;
  }
}

export const clusterAnalyzer = new ClusterAnalyzer();
