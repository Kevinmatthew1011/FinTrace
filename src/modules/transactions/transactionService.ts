import { prisma } from '@/lib/prisma';
import { Prisma, RiskLevel, TransactionChannel, TransactionStatus } from '@prisma/client';

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  riskLevel?: RiskLevel | 'ALL';
  status?: TransactionStatus | 'ALL';
  channel?: TransactionChannel | 'ALL';
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'timestamp' | 'amount' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
}

export class TransactionService {
  async getTransactions(params?: TransactionQueryParams) {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};

    if (params?.riskLevel && params.riskLevel !== 'ALL') {
      where.riskLevel = params.riskLevel;
    }

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params?.channel && params.channel !== 'ALL') {
      where.channel = params.channel;
    }

    if (params?.minAmount !== undefined || params?.maxAmount !== undefined) {
      where.amount = {};
      if (params.minAmount !== undefined) {
        where.amount.gte = new Prisma.Decimal(params.minAmount);
      }
      if (params.maxAmount !== undefined) {
        where.amount.lte = new Prisma.Decimal(params.maxAmount);
      }
    }

    if (params?.startDate || params?.endDate) {
      where.timestamp = {};
      if (params.startDate) {
        where.timestamp.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.timestamp.lte = new Date(params.endDate);
      }
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { referenceNumber: { contains: q, mode: 'insensitive' } },
        { narrative: { contains: q, mode: 'insensitive' } },
        { senderAccount: { accountNumber: { contains: q, mode: 'insensitive' } } },
        { receiverAccount: { accountNumber: { contains: q, mode: 'insensitive' } } },
        { senderAccount: { entity: { name: { contains: q, mode: 'insensitive' } } } },
        { receiverAccount: { entity: { name: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const sortBy = params?.sortBy || 'timestamp';
    const sortOrder = params?.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          senderAccount: {
            include: {
              entity: {
                select: { id: true, name: true, entityType: true, riskLevel: true },
              },
            },
          },
          receiverAccount: {
            include: {
              entity: {
                select: { id: true, name: true, entityType: true, riskLevel: true },
              },
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Format for consistent API response
    const formatted = items.map((tx) => ({
      id: tx.id,
      referenceNumber: tx.referenceNumber,
      timestamp: tx.timestamp.toISOString(),
      senderAccountId: tx.senderAccountId,
      senderAccount: tx.senderAccount.accountNumber,
      senderEntityId: tx.senderAccount.entity.id,
      senderEntityName: tx.senderAccount.entity.name,
      receiverAccountId: tx.receiverAccountId,
      receiverAccount: tx.receiverAccount.accountNumber,
      receiverEntityId: tx.receiverAccount.entity.id,
      receiverEntityName: tx.receiverAccount.entity.name,
      amount: Number(tx.amount),
      currency: tx.currency,
      channel: tx.channel,
      riskScore: tx.riskScore,
      riskLevel: tx.riskLevel,
      status: tx.status,
      isSuspicious: tx.isSuspicious,
      flags: tx.flaggedRules,
      narrative: tx.narrative || undefined,
    }));

    return {
      items: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(id: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: {
        senderAccount: { include: { entity: true } },
        receiverAccount: { include: { entity: true } },
        alerts: true,
        riskAssessments: true,
      },
    });

    if (!tx) return null;

    return {
      ...tx,
      amount: Number(tx.amount),
      senderAccount: {
        ...tx.senderAccount,
        currentBalance: Number(tx.senderAccount.currentBalance),
      },
      receiverAccount: {
        ...tx.receiverAccount,
        currentBalance: Number(tx.receiverAccount.currentBalance),
      },
    };
  }
}

export const transactionService = new TransactionService();
