import { prisma } from '@/lib/prisma';

export class SearchService {
  async searchAll(query: string, limit = 5) {
    const q = query.trim();
    if (!q) {
      return { transactions: [], entities: [], alerts: [], investigations: [] };
    }

    const [transactions, entities, alerts, cases] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [
            { referenceNumber: { contains: q, mode: 'insensitive' } },
            { narrative: { contains: q, mode: 'insensitive' } },
            { senderAccount: { accountNumber: { contains: q, mode: 'insensitive' } } },
            { receiverAccount: { accountNumber: { contains: q, mode: 'insensitive' } } },
            { senderAccount: { entity: { name: { contains: q, mode: 'insensitive' } } } },
            { receiverAccount: { entity: { name: { contains: q, mode: 'insensitive' } } } },
          ],
        },
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          senderAccount: { include: { entity: true } },
          receiverAccount: { include: { entity: true } },
        },
      }),

      prisma.entity.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { taxIdentifier: { contains: q, mode: 'insensitive' } },
            { registrationNum: { contains: q, mode: 'insensitive' } },
            { id: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { riskScore: 'desc' },
      }),

      prisma.fraudAlert.findMany({
        where: {
          OR: [
            { alertNumber: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { sourceEntity: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),

      prisma.case.findMany({
        where: {
          OR: [
            { caseNumber: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: true },
      }),
    ]);

    return {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        referenceNumber: tx.referenceNumber,
        senderEntityName: tx.senderAccount.entity.name,
        receiverEntityName: tx.receiverAccount.entity.name,
        amount: Number(tx.amount),
        riskScore: tx.riskScore,
        riskLevel: tx.riskLevel,
      })),
      entities: entities.map((e) => ({
        id: e.id,
        name: e.name,
        taxIdentifier: e.taxIdentifier || 'N/A',
        riskScore: e.riskScore,
        riskLevel: e.riskLevel,
      })),
      alerts: alerts.map((a) => ({
        id: a.id,
        alertNumber: a.alertNumber,
        title: a.title,
        severity: a.severity,
      })),
      investigations: cases.map((c) => ({
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        priority: c.priority,
      })),
    };
  }
}

export const searchService = new SearchService();
