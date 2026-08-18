import { GraphRepository, graphRepository } from './graphRepository';
import { FinancialGraph, GraphEdge, GraphNode, GraphStatistics } from './graphTypes';
import { RiskLevel } from '@prisma/client';

export class GraphBuilder {
  constructor(private repo: GraphRepository = graphRepository) {}

  async buildEntityGraph(entityId: string, depth = 2): Promise<FinancialGraph> {
    const clampedDepth = Math.min(5, Math.max(1, depth));
    const visitedEntities = new Set<string>();
    const visitedAccounts = new Set<string>();
    const visitedTransactions = new Set<string>();

    const nodesMap = new Map<string, GraphNode>();
    const edgesMap = new Map<string, GraphEdge>();

    // Queue for BFS traversal: [entityId, currentHop]
    const entityQueue: Array<{ id: string; hop: number }> = [{ id: entityId, hop: 0 }];

    while (entityQueue.length > 0) {
      const current = entityQueue.shift()!;
      if (visitedEntities.has(current.id) || current.hop > clampedDepth) continue;
      visitedEntities.add(current.id);

      const entity = await this.repo.getEntityWithAccounts(current.id);
      if (!entity) continue;

      // Add Entity Node
      if (!nodesMap.has(entity.id)) {
        nodesMap.set(entity.id, {
          id: entity.id,
          type: 'ENTITY',
          label: entity.name,
          sublabel: `${entity.entityType.replace('_', ' ')} • ${entity.taxIdentifier || entity.jurisdiction}`,
          entityId: entity.id,
          entityType: entity.entityType,
          riskScore: entity.riskScore,
          riskLevel: entity.riskLevel,
          isFlagged: entity.riskScore >= 60,
        });
      }

      const accountIds: string[] = [];

      // Add Accounts for this Entity & connect Entity ➔ OWNS_ACCOUNT ➔ Account
      for (const acc of entity.accounts) {
        accountIds.push(acc.id);
        if (!nodesMap.has(acc.id)) {
          nodesMap.set(acc.id, {
            id: acc.id,
            type: 'ACCOUNT',
            label: `${acc.bankName} - ${acc.accountNumber.slice(-4)}`,
            sublabel: `Bal: ₹${(Number(acc.currentBalance) / 100000).toFixed(1)}L`,
            entityId: entity.id,
            accountId: acc.id,
            accountNumber: acc.accountNumber,
            bankName: acc.bankName,
            riskScore: acc.riskScore,
            riskLevel: (acc.riskScore >= 80 ? 'CRITICAL' : acc.riskScore >= 60 ? 'HIGH' : acc.riskScore >= 30 ? 'MEDIUM' : 'LOW') as RiskLevel,
            isMule: acc.isMuleFlagged,
            isFrozen: acc.isFrozen,
          });
        }

        const ownEdgeId = `edge-own-${entity.id}-${acc.id}`;
        if (!edgesMap.has(ownEdgeId)) {
          edgesMap.set(ownEdgeId, {
            id: ownEdgeId,
            source: entity.id,
            target: acc.id,
            type: 'OWNS_ACCOUNT',
          });
        }
        visitedAccounts.add(acc.id);
      }

      // Fetch transactions involving these accounts
      const txs = await this.repo.getTransactionsForAccounts(accountIds);

      for (const tx of txs) {
        if (visitedTransactions.has(tx.id)) continue;
        visitedTransactions.add(tx.id);

        const senderAcc = tx.senderAccount;
        const receiverAcc = tx.receiverAccount;
        const senderEntity = senderAcc.entity;
        const receiverEntity = receiverAcc.entity;

        // Ensure Sender Account Node exists
        if (!nodesMap.has(senderAcc.id)) {
          nodesMap.set(senderAcc.id, {
            id: senderAcc.id,
            type: 'ACCOUNT',
            label: `${senderAcc.bankName} - ${senderAcc.accountNumber.slice(-4)}`,
            sublabel: `Bal: ₹${(Number(senderAcc.currentBalance) / 100000).toFixed(1)}L`,
            entityId: senderEntity.id,
            accountId: senderAcc.id,
            accountNumber: senderAcc.accountNumber,
            bankName: senderAcc.bankName,
            riskScore: senderAcc.riskScore,
            riskLevel: (senderAcc.riskScore >= 80 ? 'CRITICAL' : senderAcc.riskScore >= 60 ? 'HIGH' : 'LOW') as RiskLevel,
            isMule: senderAcc.isMuleFlagged,
            isFrozen: senderAcc.isFrozen,
          });
        }

        // Ensure Receiver Account Node exists
        if (!nodesMap.has(receiverAcc.id)) {
          nodesMap.set(receiverAcc.id, {
            id: receiverAcc.id,
            type: 'ACCOUNT',
            label: `${receiverAcc.bankName} - ${receiverAcc.accountNumber.slice(-4)}`,
            sublabel: `Bal: ₹${(Number(receiverAcc.currentBalance) / 100000).toFixed(1)}L`,
            entityId: receiverEntity.id,
            accountId: receiverAcc.id,
            accountNumber: receiverAcc.accountNumber,
            bankName: receiverAcc.bankName,
            riskScore: receiverAcc.riskScore,
            riskLevel: (receiverAcc.riskScore >= 80 ? 'CRITICAL' : receiverAcc.riskScore >= 60 ? 'HIGH' : 'LOW') as RiskLevel,
            isMule: receiverAcc.isMuleFlagged,
            isFrozen: receiverAcc.isFrozen,
          });
        }

        // Ensure Counterparty Entity Nodes exist
        if (!nodesMap.has(senderEntity.id)) {
          nodesMap.set(senderEntity.id, {
            id: senderEntity.id,
            type: 'ENTITY',
            label: senderEntity.name,
            sublabel: `${senderEntity.entityType.replace('_', ' ')} • ${senderEntity.taxIdentifier || senderEntity.jurisdiction}`,
            entityId: senderEntity.id,
            entityType: senderEntity.entityType,
            riskScore: senderEntity.riskScore,
            riskLevel: senderEntity.riskLevel,
            isFlagged: senderEntity.riskScore >= 60,
          });
        }

        if (!nodesMap.has(receiverEntity.id)) {
          nodesMap.set(receiverEntity.id, {
            id: receiverEntity.id,
            type: 'ENTITY',
            label: receiverEntity.name,
            sublabel: `${receiverEntity.entityType.replace('_', ' ')} • ${receiverEntity.taxIdentifier || receiverEntity.jurisdiction}`,
            entityId: receiverEntity.id,
            entityType: receiverEntity.entityType,
            riskScore: receiverEntity.riskScore,
            riskLevel: receiverEntity.riskLevel,
            isFlagged: receiverEntity.riskScore >= 60,
          });
        }

        // Add Transaction Transfer Edge: Sender Account ➔ Receiver Account
        const txEdgeId = `edge-tx-${tx.id}`;
        if (!edgesMap.has(txEdgeId)) {
          edgesMap.set(txEdgeId, {
            id: txEdgeId,
            source: senderAcc.id,
            target: receiverAcc.id,
            type: 'TRANSFERRED_TO',
            transactionId: tx.id,
            referenceNumber: tx.referenceNumber,
            amount: Number(tx.amount),
            currency: tx.currency,
            channel: tx.channel,
            timestamp: tx.timestamp.toISOString(),
            riskScore: tx.riskScore,
            riskLevel: tx.riskLevel,
            status: tx.status,
            isSuspicious: tx.isSuspicious,
          });
        }

        // Connect counterparties to their respective accounts if not already
        const sendOwnEdge = `edge-own-${senderEntity.id}-${senderAcc.id}`;
        if (!edgesMap.has(sendOwnEdge)) {
          edgesMap.set(sendOwnEdge, {
            id: sendOwnEdge,
            source: senderEntity.id,
            target: senderAcc.id,
            type: 'OWNS_ACCOUNT',
          });
        }

        const recvOwnEdge = `edge-own-${receiverEntity.id}-${receiverAcc.id}`;
        if (!edgesMap.has(recvOwnEdge)) {
          edgesMap.set(recvOwnEdge, {
            id: recvOwnEdge,
            source: receiverEntity.id,
            target: receiverAcc.id,
            type: 'OWNS_ACCOUNT',
          });
        }

        // Enqueue discovered counterparties for next hop
        if (current.hop < clampedDepth) {
          if (!visitedEntities.has(senderEntity.id)) {
            entityQueue.push({ id: senderEntity.id, hop: current.hop + 1 });
          }
          if (!visitedEntities.has(receiverEntity.id)) {
            entityQueue.push({ id: receiverEntity.id, hop: current.hop + 1 });
          }
        }
      }
    }

    const nodes = Array.from(nodesMap.values());
    const edges = Array.from(edgesMap.values());

    const entityCount = nodes.filter((n) => n.type === 'ENTITY').length;
    const accountCount = nodes.filter((n) => n.type === 'ACCOUNT').length;
    const transactionEdges = edges.filter((e) => e.type === 'TRANSFERRED_TO');
    const suspiciousNodes = nodes.filter((n) => n.riskLevel === 'HIGH' || n.riskLevel === 'CRITICAL');
    const suspiciousEdges = transactionEdges.filter((e) => e.isSuspicious || e.riskScore! >= 60);
    const totalVolume = transactionEdges.reduce((acc, e) => acc + (e.amount || 0), 0);

    const statistics: GraphStatistics = {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      entityCount,
      accountCount,
      transactionCount: transactionEdges.length,
      suspiciousNodeCount: suspiciousNodes.length,
      suspiciousEdgeCount: suspiciousEdges.length,
      totalVolumeRupees: totalVolume,
      maxHopDistance: clampedDepth,
    };

    return {
      rootId: entityId,
      rootType: 'ENTITY',
      depth: clampedDepth,
      nodes,
      edges,
      statistics,
    };
  }
}

export const graphBuilder = new GraphBuilder();
