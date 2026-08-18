import { prisma } from '@/lib/prisma';
import { Prisma, CasePriority, CaseStatus } from '@prisma/client';

export interface CaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  priority?: CasePriority | 'ALL';
  status?: CaseStatus | 'ALL';
  assignedToId?: string;
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export class CaseService {
  async getCases(params?: CaseQueryParams) {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.CaseWhereInput = {};

    if (params?.priority && params.priority !== 'ALL') {
      where.priority = params.priority;
    }

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params?.assignedToId) {
      where.assignedToId = params.assignedToId;
    }

    if (params?.search) {
      const q = params.search.trim();
      where.OR = [
        { caseNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { findings: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortBy = params?.sortBy || 'createdAt';
    const sortOrder = params?.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.case.findMany({
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, badgeNumber: true },
          },
          alerts: {
            select: { id: true, severity: true, title: true },
          },
          _count: {
            select: { alerts: true },
          },
        },
      }),
      prisma.case.count({ where }),
    ]);

    const formatted = items.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      title: c.title,
      description: c.description,
      priority: c.priority,
      status: c.status,
      assignedInvestigator: c.assignedTo?.name || 'Unassigned',
      investigatorBadge: c.assignedTo?.badgeNumber || undefined,
      alertCount: c._count.alerts,
      findings: c.findings || undefined,
      tags: c.tags,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
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

  async getCaseById(id: string) {
    return prisma.case.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        alerts: {
          include: {
            sourceEntity: true,
            targetEntity: true,
          },
        },
      },
    });
  }
}

export const caseService = new CaseService();
