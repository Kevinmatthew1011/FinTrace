import { prisma } from '@/lib/prisma';

export class GraphRepository {
  async getEntityWithAccounts(entityId: string) {
    return prisma.entity.findUnique({
      where: { id: entityId },
      include: {
        accounts: true,
      },
    });
  }

  async getAccountWithEntity(accountId: string) {
    return prisma.account.findUnique({
      where: { id: accountId },
      include: {
        entity: true,
      },
    });
  }

  async getTransactionsForAccounts(accountIds: string[]) {
    if (accountIds.length === 0) return [];

    return prisma.transaction.findMany({
      where: {
        OR: [
          { senderAccountId: { in: accountIds } },
          { receiverAccountId: { in: accountIds } },
        ],
      },
      include: {
        senderAccount: {
          include: { entity: true },
        },
        receiverAccount: {
          include: { entity: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 200,
    });
  }

  async getAllActiveTransactions(limit = 1000) {
    return prisma.transaction.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        senderAccount: {
          include: { entity: true },
        },
        receiverAccount: {
          include: { entity: true },
        },
      },
    });
  }

  async getAllEntitiesWithAccounts() {
    return prisma.entity.findMany({
      include: {
        accounts: true,
      },
    });
  }
}

export const graphRepository = new GraphRepository();
