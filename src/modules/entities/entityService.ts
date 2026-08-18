import { prisma } from '@/lib/prisma';
import { Prisma, RiskLevel, EntityType } from '@prisma/client';

export interface EntityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  riskLevel?: RiskLevel | 'ALL';
  entityType?: EntityType | 'ALL';
  jurisdiction?: string;
  sortBy?: 'riskScore' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class EntityService {
  async getEntities(params?: EntityQueryParams) {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.EntityWhereInput = {};

    if (params?.riskLevel && params.riskLevel !== 'ALL') {
      where.riskLevel = params.riskLevel;
    }

    if (params?.entityType && params.entityType !== 'ALL') {
      where.entityType = params.entityType;
    }

    if (params?.jurisdiction) {
      where.jurisdiction = { contains: params.jurisdiction, mode: 'insensitive' };
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { taxIdentifier: { contains: q, mode: 'insensitive' } },
        { registrationNum: { contains: q, mode: 'insensitive' } },
        { id: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortBy = params?.sortBy || 'riskScore';
    const sortOrder = params?.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          accounts: {
            select: { id: true, accountNumber: true, bankName: true, currentBalance: true, isMuleFlagged: true, isFrozen: true },
          },
          _count: {
            select: {
              sourceAlerts: true,
              targetAlerts: true,
              accounts: true,
            },
          },
        },
      }),
      prisma.entity.count({ where }),
    ]);

    const formatted = items.map((e) => {
      const totalBalance = e.accounts.reduce((acc, a) => acc + Number(a.currentBalance), 0);
      return {
        id: e.id,
        name: e.name,
        type: e.entityType,
        registrationNumber: e.registrationNum || undefined,
        taxIdentifier: e.taxIdentifier || 'UNSPECIFIED',
        jurisdiction: e.jurisdiction,
        riskScore: e.riskScore,
        riskLevel: e.riskLevel,
        isSanctioned: e.isSanctioned,
        isPEP: e.isPEP,
        accountsCount: e._count.accounts,
        alertCount: e._count.sourceAlerts + e._count.targetAlerts,
        totalBalanceRupees: totalBalance,
        status: e.accounts.some((a) => a.isFrozen)
          ? 'FROZEN'
          : e.riskScore >= 80
          ? 'UNDER_INVESTIGATION'
          : e.riskScore >= 60
          ? 'FLAGGED'
          : 'ACTIVE',
        accounts: e.accounts.map((a) => ({
          ...a,
          currentBalance: Number(a.currentBalance),
        })),
      };
    });

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

  async getHighRiskEntities(limit = 10) {
    return this.getEntities({
      limit,
      riskLevel: RiskLevel.CRITICAL,
      sortBy: 'riskScore',
      sortOrder: 'desc',
    });
  }

  async getEntityById(id: string) {
    const entity = await prisma.entity.findUnique({
      where: { id },
      include: {
        accounts: true,
        sourceAlerts: true,
        targetAlerts: true,
        riskAssessments: true,
      },
    });

    if (!entity) return null;

    return {
      ...entity,
      accounts: entity.accounts.map((a) => ({
        ...a,
        currentBalance: Number(a.currentBalance),
      })),
    };
  }
}

export const entityService = new EntityService();
