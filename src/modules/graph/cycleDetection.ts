import { GraphRepository, graphRepository } from './graphRepository';
import { GraphCycle } from './graphTypes';
import { RiskLevel } from '@prisma/client';

export class CycleDetector {
  constructor(private repo: GraphRepository = graphRepository) {}

  async detectCycles(filterEntityId?: string): Promise<GraphCycle[]> {
    const allTxs = await this.repo.getAllActiveTransactions(1500);

    // Build directed adjacency list of Entity -> Entity with transaction list
    interface AdjEdge {
      targetEntityId: string;
      senderAccountId: string;
      receiverAccountId: string;
      transactionId: string;
      referenceNumber: string;
      amount: number;
      timestamp: Date;
    }

    const adj = new Map<string, AdjEdge[]>();
    const entityInfoMap = new Map<string, { id: string; name: string; riskScore: number; riskLevel: RiskLevel }>();
    const accountInfoMap = new Map<string, { id: string; accountNumber: string; bankName: string }>();

    for (const tx of allTxs) {
      const sEntity = tx.senderAccount.entity;
      const rEntity = tx.receiverAccount.entity;
      const sAcc = tx.senderAccount;
      const rAcc = tx.receiverAccount;

      if (!entityInfoMap.has(sEntity.id)) {
        entityInfoMap.set(sEntity.id, { id: sEntity.id, name: sEntity.name, riskScore: sEntity.riskScore, riskLevel: sEntity.riskLevel });
      }
      if (!entityInfoMap.has(rEntity.id)) {
        entityInfoMap.set(rEntity.id, { id: rEntity.id, name: rEntity.name, riskScore: rEntity.riskScore, riskLevel: rEntity.riskLevel });
      }
      if (!accountInfoMap.has(sAcc.id)) {
        accountInfoMap.set(sAcc.id, { id: sAcc.id, accountNumber: sAcc.accountNumber, bankName: sAcc.bankName });
      }
      if (!accountInfoMap.has(rAcc.id)) {
        accountInfoMap.set(rAcc.id, { id: rAcc.id, accountNumber: rAcc.accountNumber, bankName: rAcc.bankName });
      }

      if (sEntity.id === rEntity.id) continue; // ignore self-transfers

      if (!adj.has(sEntity.id)) adj.set(sEntity.id, []);
      adj.get(sEntity.id)!.push({
        targetEntityId: rEntity.id,
        senderAccountId: sAcc.id,
        receiverAccountId: rAcc.id,
        transactionId: tx.id,
        referenceNumber: tx.referenceNumber,
        amount: Number(tx.amount),
        timestamp: tx.timestamp,
      });
    }

    const detectedCycles: GraphCycle[] = [];
    const visited = new Set<string>();
    const recursionStack = new Map<string, { hop: number; edgeFromPrev?: AdjEdge }>();
    const recordedCycleKeys = new Set<string>();

    const startNodes = filterEntityId ? [filterEntityId] : Array.from(adj.keys());

    const dfs = (
      nodeId: string,
      currentHop: number,
      path: Array<{ entityId: string; edgeFromPrev?: AdjEdge }>
    ) => {
      visited.add(nodeId);
      recursionStack.set(nodeId, { hop: currentHop });

      const neighbors = adj.get(nodeId) || [];
      for (const edge of neighbors) {
        const nextId = edge.targetEntityId;

        if (recursionStack.has(nextId)) {
          // Found a cycle!
          const startIndex = path.findIndex((p) => p.entityId === nextId);
          if (startIndex !== -1) {
            const cyclePath = path.slice(startIndex);
            cyclePath.push({ entityId: nextId, edgeFromPrev: edge });

            if (cyclePath.length >= 3) {
              const entitiesInCycle = cyclePath.slice(0, -1).map((p) => entityInfoMap.get(p.entityId)!);
              const sortedIds = entitiesInCycle.map((e) => e.id).sort().join('::');

              if (!recordedCycleKeys.has(sortedIds)) {
                recordedCycleKeys.add(sortedIds);

                const cycleTxs = cyclePath.slice(1).map((p) => ({
                  id: p.edgeFromPrev!.transactionId,
                  referenceNumber: p.edgeFromPrev!.referenceNumber,
                  amount: p.edgeFromPrev!.amount,
                  senderAccount: p.edgeFromPrev!.senderAccountId,
                  receiverAccount: p.edgeFromPrev!.receiverAccountId,
                  timestamp: p.edgeFromPrev!.timestamp.toISOString(),
                }));

                const totalVal = cycleTxs.reduce((sum, t) => sum + t.amount, 0);
                const timestamps = cycleTxs.map((t) => new Date(t.timestamp).getTime());
                const startTs = new Date(Math.min(...timestamps)).toISOString();
                const endTs = new Date(Math.max(...timestamps)).toISOString();
                const durationMin = Math.round((Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60));

                const involvedAccounts = Array.from(
                  new Set(cycleTxs.flatMap((t) => [t.senderAccount, t.receiverAccount]))
                ).map((accId) => accountInfoMap.get(accId)!);

                const highestRisk = Math.max(...entitiesInCycle.map((e) => e.riskScore));
                const cycleRiskLevel: RiskLevel = highestRisk >= 80 ? 'CRITICAL' : highestRisk >= 60 ? 'HIGH' : 'MEDIUM';

                const entityChain = cyclePath.map((p) => entityInfoMap.get(p.entityId)?.name || p.entityId).join(' ➔ ');

                detectedCycles.push({
                  id: `cycle-${detectedCycles.length + 1}`,
                  entities: entitiesInCycle,
                  accounts: involvedAccounts,
                  transactions: cycleTxs,
                  hopCount: entitiesInCycle.length,
                  totalTransactionValue: totalVal,
                  startTimestamp: startTs,
                  endTimestamp: endTs,
                  durationMinutes: durationMin,
                  riskScore: Math.min(99, highestRisk + 5),
                  riskLevel: cycleRiskLevel,
                  evidence: `Detected ${entitiesInCycle.length}-hop circular carousel fund movement: ${entityChain} totaling ₹${(totalVal / 100000).toFixed(2)}L across ${cycleTxs.length} transactions.`,
                });
              }
            }
          }
        } else if (!visited.has(nextId) && currentHop < 6) {
          path.push({ entityId: nextId, edgeFromPrev: edge });
          dfs(nextId, currentHop + 1, path);
          path.pop();
        }
      }

      recursionStack.delete(nodeId);
    };

    for (const start of startNodes) {
      visited.clear();
      dfs(start, 0, [{ entityId: start }]);
    }

    return detectedCycles;
  }
}

export const cycleDetector = new CycleDetector();
