import { GraphRepository, graphRepository } from './graphRepository';
import { GraphFinding } from './graphTypes';
import { RiskLevel } from '@prisma/client';

export class MuleChainDetector {
  constructor(private repo: GraphRepository = graphRepository) {}

  async detectMuleChains(entityId?: string): Promise<GraphFinding[]> {
    const allTxs = await this.repo.getAllActiveTransactions(1500);
    const findings: GraphFinding[] = [];

    // Group transactions by sender entity to detect fan-out rapid dispersal
    const senderGroups = new Map<string, typeof allTxs>();
    for (const tx of allTxs) {
      const sId = tx.senderAccount.entity.id;
      if (entityId && sId !== entityId) continue;
      if (!senderGroups.has(sId)) senderGroups.set(sId, []);
      senderGroups.get(sId)!.push(tx);
    }

    for (const [sId, txs] of senderGroups.entries()) {
      const muleTxs = txs.filter((t) => t.receiverAccount.isMuleFlagged || t.isSuspicious);
      const uniqueReceivers = new Set(muleTxs.map((t) => t.receiverAccount.entity.id));

      if (uniqueReceivers.size >= 3 && muleTxs.length >= 5) {
        const senderEntity = txs[0].senderAccount.entity;
        const totalDispersed = muleTxs.reduce((sum, t) => sum + Number(t.amount), 0);
        const relatedNodes = [sId, ...Array.from(uniqueReceivers)];
        const relatedTxIds = muleTxs.map((t) => t.id);

        findings.push({
          id: `finding-mule-${sId}`,
          type: 'MULE_CHAIN',
          severity: 'CRITICAL',
          title: `Rapid Mule Account Dispersal Chain`,
          description: `Entity ${senderEntity.name} (${sId}) initiated high-velocity fan-out dispersal to ${uniqueReceivers.size} distinct mule/flagged receiver nodes.`,
          evidence: [
            `${muleTxs.length} rapid transfers totaling ₹${(totalDispersed / 100000).toFixed(2)} Lakhs`,
            `Dispersed across ${uniqueReceivers.size} accounts flagged with mule characteristics`,
            `Average transfer amount: ₹${(totalDispersed / muleTxs.length / 1000).toFixed(1)}k`,
          ],
          relatedNodeIds: relatedNodes,
          relatedTransactionIds: relatedTxIds,
          riskScore: 92,
          riskLevel: 'CRITICAL',
          recommendedFocus: 'Freezing downstream mule accounts and tracing final P2P/crypto cash-out settlement nodes.',
        });
      }
    }

    return findings;
  }
}

export const muleChainDetector = new MuleChainDetector();
