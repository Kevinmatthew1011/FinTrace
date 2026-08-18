import { prisma } from '@/lib/prisma';
import { Prisma, RiskLevel, AlertStatus, AlertType } from '@prisma/client';

export interface AlertQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  severity?: RiskLevel | 'ALL';
  status?: AlertStatus | 'ALL';
  alertType?: AlertType | 'ALL';
  sortBy?: 'createdAt' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export class AlertService {
  async getAlerts(params?: AlertQueryParams) {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.FraudAlertWhereInput = {};

    if (params?.severity && params.severity !== 'ALL') {
      where.severity = params.severity;
    }

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params?.alertType && params.alertType !== 'ALL') {
      where.alertType = params.alertType;
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { alertNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sourceEntity: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const sortBy = params?.sortBy || 'createdAt';
    const sortOrder = params?.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.fraudAlert.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          sourceEntity: {
            select: { id: true, name: true, riskLevel: true },
          },
          targetEntity: {
            select: { id: true, name: true, riskLevel: true },
          },
          case: {
            select: { id: true, caseNumber: true, title: true },
          },
        },
      }),
      prisma.fraudAlert.count({ where }),
    ]);

    const formatted = items.map((a) => ({
      id: a.id,
      alertNumber: a.alertNumber,
      title: a.title,
      description: a.description,
      typology: a.alertType,
      severity: a.severity,
      status: a.status,
      sourceEntityId: a.sourceEntityId || undefined,
      sourceEntityName: a.sourceEntity?.name || undefined,
      targetEntityId: a.targetEntityId || undefined,
      targetEntityName: a.targetEntity?.name || undefined,
      aiExplanation: a.aiExplanation || undefined,
      indicators: Array.isArray(a.indicators) ? (a.indicators as string[]) : [],
      caseId: a.caseId || undefined,
      caseNumber: a.case?.caseNumber || undefined,
      createdAt: a.createdAt.toISOString(),
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

  async getAlertById(id: string) {
    return prisma.fraudAlert.findUnique({
      where: { id },
      include: {
        sourceEntity: true,
        targetEntity: true,
        transactions: true,
        case: true,
      },
    });
  }
}

export const alertService = new AlertService();
