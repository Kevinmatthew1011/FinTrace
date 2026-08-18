import { prisma } from '@/lib/prisma';
import {
  Prisma,
  CasePriority,
  CaseStatus,
  CaseResolutionType,
  EvidenceType,
  RiskLevel,
} from '@prisma/client';
import { graphIntelligenceService } from '../graph';
import { riskEngineService } from '../risk-engine';
import { aiFraudEngineService } from '../ai-engine';
import { ValidationError, NotFoundError } from '@/lib/errors';

export interface CaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  priority?: CasePriority | 'ALL';
  status?: CaseStatus | 'ALL';
  riskLevel?: RiskLevel | 'ALL';
  assignedToId?: string;
  sortBy?: 'createdAt' | 'priority' | 'status' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCaseInput {
  title: string;
  description: string;
  priority?: CasePriority;
  primaryEntityId?: string;
  assignedToId?: string;
  tags?: string[];
  alertId?: string;
}

export interface AddEvidenceInput {
  evidenceType: EvidenceType;
  title: string;
  description: string;
  source: string;
  sourceId?: string;
  severity?: RiskLevel;
  metadata?: Record<string, unknown>;
  createdById?: string;
}

export interface AddNoteInput {
  content: string;
  authorId?: string;
  authorName?: string;
  isSystemGenerated?: boolean;
}

export class CaseService {
  /**
   * Helper to generate unique case number (e.g. CASE-2026-1082)
   */
  private async generateCaseNumber(): Promise<string> {
    const count = await prisma.case.count();
    const year = new Date().getFullYear();
    const seq = String(count + 101).padStart(4, '0');
    return `CASE-${year}-${seq}`;
  }

  /**
   * List cases with filtering, search, and pagination
   */
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

    if (params?.riskLevel && params.riskLevel !== 'ALL') {
      where.riskLevel = params.riskLevel;
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
        { primaryEntity: { name: { contains: q, mode: 'insensitive' } } },
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
          primaryEntity: {
            select: { id: true, name: true, entityType: true, riskScore: true, riskLevel: true },
          },
          alerts: {
            select: { id: true, severity: true, title: true, alertNumber: true },
          },
          _count: {
            select: { alerts: true, evidences: true, notes: true },
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
      riskScore: c.riskScore,
      riskLevel: c.riskLevel,
      primaryEntityId: c.primaryEntityId || undefined,
      primaryEntityName: c.primaryEntity?.name || undefined,
      assignedInvestigator: c.assignedTo?.name || 'Unassigned',
      assignedInvestigatorId: c.assignedTo?.id || undefined,
      investigatorBadge: c.assignedTo?.badgeNumber || undefined,
      alertCount: c._count.alerts,
      evidenceCount: c._count.evidences,
      noteCount: c._count.notes,
      resolutionType: c.resolutionType || undefined,
      resolutionSummary: c.resolutionSummary || undefined,
      escalationReason: c.escalationReason || undefined,
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

  /**
   * Retrieve complete Case Dossier for investigator workstation
   */
  async getCaseDossier(caseId: string) {
    const c = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        assignedTo: true,
        resolvedBy: true,
        primaryEntity: {
          include: {
            accounts: true,
          },
        },
        alerts: {
          include: {
            sourceEntity: true,
            targetEntity: true,
            transactions: true,
          },
        },
        evidences: {
          include: {
            createdBy: {
              select: { id: true, name: true, badgeNumber: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true, badgeNumber: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        auditLogs: {
          include: {
            user: {
              select: { id: true, name: true, badgeNumber: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!c) throw new NotFoundError(`Case not found: ${caseId}`);

    // If primaryEntityId is not explicitly set, deduce from first attached alert
    let primaryEntity = c.primaryEntity;
    if (!primaryEntity && c.alerts.length > 0 && c.alerts[0].sourceEntity) {
      primaryEntity = c.alerts[0].sourceEntity as any;
    }

    // Retrieve linked transactions from alerts and accounts
    const alertTransactions = c.alerts.flatMap((a) => a.transactions);
    let allLinkedTransactions = [...alertTransactions];

    if (primaryEntity && primaryEntity.id) {
      const entityTxs = await prisma.transaction.findMany({
        where: {
          OR: [
            { senderAccount: { entityId: primaryEntity.id } },
            { receiverAccount: { entityId: primaryEntity.id } },
          ],
        },
        include: {
          senderAccount: { include: { entity: true } },
          receiverAccount: { include: { entity: true } },
        },
        take: 25,
        orderBy: { timestamp: 'desc' },
      });

      // Deduplicate transactions
      const existingTxIds = new Set(allLinkedTransactions.map((t) => t.id));
      for (const tx of entityTxs) {
        if (!existingTxIds.has(tx.id)) {
          allLinkedTransactions.push(tx as any);
        }
      }
    }

    // Fetch Phase 3 Graph Network Findings if entity available
    let networkFindings: any = null;
    if (primaryEntity && primaryEntity.id) {
      try {
        networkFindings = await graphIntelligenceService.analyzeEntityNetwork(primaryEntity.id);
      } catch (err) {
        console.warn('[CaseService] Error fetching network findings:', err);
      }
    }

    // Fetch Phase 4 & Phase 5 Risk Assessments if entity available
    let deterministicRisk: any = null;
    let aiRiskAssessment: any = null;
    if (primaryEntity && primaryEntity.id) {
      try {
        [deterministicRisk, aiRiskAssessment] = await Promise.all([
          riskEngineService.assessEntity(primaryEntity.id),
          aiFraudEngineService.assessEntityAI(primaryEntity.id),
        ]);
      } catch (err) {
        console.warn('[CaseService] Error fetching risk assessment:', err);
      }
    }

    // Build Evidence Summary Counters
    const criticalEvidenceCount = c.evidences.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH').length;
    const distinctEntitiesCount = new Set([
      ...(primaryEntity ? [primaryEntity.id] : []),
      ...c.alerts.flatMap((a) => [a.sourceEntityId, a.targetEntityId]).filter(Boolean),
    ]).size;

    const distinctAccountsCount = new Set([
      ...(primaryEntity?.accounts?.map((a) => a.id) || []),
      ...allLinkedTransactions.flatMap((t: any) => [t.senderAccountId, t.receiverAccountId]).filter(Boolean),
    ]).size;

    const evidenceSummary = {
      totalEvidenceCount: c.evidences.length,
      criticalEvidenceCount,
      linkedAlertsCount: c.alerts.length,
      linkedTransactionsCount: allLinkedTransactions.length,
      linkedEntitiesCount: Math.max(1, distinctEntitiesCount),
      linkedAccountsCount: Math.max(1, distinctAccountsCount),
      networkCyclesCount: networkFindings?.cycles?.length || 0,
      riskAssessmentsCount: deterministicRisk ? 1 : 0,
    };

    return {
      caseDetails: {
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        description: c.description,
        priority: c.priority,
        status: c.status,
        riskScore: c.riskScore || primaryEntity?.riskScore || 0,
        riskLevel: c.riskLevel || primaryEntity?.riskLevel || 'LOW',
        primaryEntityId: primaryEntity?.id || undefined,
        primaryEntityName: primaryEntity?.name || undefined,
        assignedInvestigator: c.assignedTo
          ? {
              id: c.assignedTo.id,
              name: c.assignedTo.name,
              email: c.assignedTo.email,
              badgeNumber: c.assignedTo.badgeNumber,
              role: c.assignedTo.role,
            }
          : null,
        escalationReason: c.escalationReason || undefined,
        escalatedAt: c.escalatedAt ? c.escalatedAt.toISOString() : undefined,
        resolutionType: c.resolutionType || undefined,
        resolutionSummary: c.resolutionSummary || undefined,
        resolvedAt: c.resolvedAt ? c.resolvedAt.toISOString() : undefined,
        resolvedBy: c.resolvedBy
          ? {
              id: c.resolvedBy.id,
              name: c.resolvedBy.name,
              badgeNumber: c.resolvedBy.badgeNumber,
            }
          : null,
        tags: c.tags,
        findings: c.findings || undefined,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      },
      primaryEntity,
      alerts: c.alerts,
      evidences: c.evidences,
      notes: c.notes,
      transactions: allLinkedTransactions,
      networkFindings,
      deterministicRisk,
      aiRiskAssessment,
      auditTimeline: c.auditLogs,
      evidenceSummary,
    };
  }

  /**
   * Create a manual Case
   */
  async createCase(input: CreateCaseInput) {
    if (!input.title || !input.description) {
      throw new ValidationError('Case title and description are required.');
    }

    const caseNumber = await this.generateCaseNumber();

    // Default investigator if not specified
    let assignedToId = input.assignedToId;
    if (!assignedToId) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'INVESTIGATOR' } });
      if (defaultUser) assignedToId = defaultUser.id;
    }

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title: input.title,
        description: input.description,
        priority: input.priority || 'HIGH',
        status: 'OPEN',
        assignedToId,
        primaryEntityId: input.primaryEntityId,
        tags: input.tags || ['MANUAL_CASE'],
      },
    });

    // Create Audit Event
    await prisma.auditLog.create({
      data: {
        caseId: newCase.id,
        userId: assignedToId,
        action: 'CASE_CREATED',
        resource: `CASE_${newCase.caseNumber}`,
        metadata: {
          title: newCase.title,
          priority: newCase.priority,
          initialStatus: newCase.status,
        },
      },
    });

    return this.getCaseDossier(newCase.id);
  }

  /**
   * Create Case from an Alert (With Deduplication & Automatic Inheritance)
   */
  async createCaseFromAlert(alertId: string, investigatorId?: string) {
    const alert = await prisma.fraudAlert.findUnique({
      where: { id: alertId },
      include: {
        sourceEntity: true,
        targetEntity: true,
        transactions: true,
        case: true,
      },
    });

    if (!alert) throw new NotFoundError(`Alert not found: ${alertId}`);

    // Deduplication check: If alert already has an active case attached, return it
    if (alert.caseId && alert.case) {
      if (
        alert.case.status !== 'CLOSED' &&
        alert.case.status !== 'CLOSED_CONFIRMED_FRAUD' &&
        alert.case.status !== 'CLOSED_FALSE_POSITIVE'
      ) {
        return {
          case: await this.getCaseDossier(alert.case.id),
          isExisting: true,
          message: `Alert ${alert.alertNumber} is already tracked in active Case ${alert.case.caseNumber}`,
        };
      }
    }

    // Determine assigned investigator
    let assignedToId = investigatorId;
    if (!assignedToId) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'INVESTIGATOR' } });
      if (defaultUser) assignedToId = defaultUser.id;
    }

    const caseNumber = await this.generateCaseNumber();
    const primaryEntity = alert.sourceEntity || alert.targetEntity;
    const priority: CasePriority = alert.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH';

    // Atomic creation of Case, Alert attachment, initial Evidence snapshots, and Audit Log
    const newCase = await prisma.$transaction(async (tx) => {
      const created = await tx.case.create({
        data: {
          caseNumber,
          title: `Investigation: ${alert.title}`,
          description: `Formally opened investigation initiated from Alert ${alert.alertNumber} (${alert.alertType}).\n\nAlert Details: ${alert.description}`,
          priority,
          status: 'OPEN',
          assignedToId,
          primaryEntityId: primaryEntity?.id,
          riskScore: primaryEntity?.riskScore || 75,
          riskLevel: primaryEntity?.riskLevel || alert.severity,
          tags: ['ALERT_ORIGINATED', alert.alertType, alert.severity],
        },
      });

      // Attach Alert to new Case
      await tx.fraudAlert.update({
        where: { id: alert.id },
        data: {
          caseId: created.id,
          status: 'INVESTIGATING',
        },
      });

      // 1. Initial Evidence: Alert Snapshot
      await tx.caseEvidence.create({
        data: {
          caseId: created.id,
          evidenceType: 'ALERT',
          title: `Originating Alert: ${alert.title}`,
          description: alert.description,
          source: 'ALERT_ENGINE',
          sourceId: alert.id,
          severity: alert.severity,
          metadata: {
            alertNumber: alert.alertNumber,
            alertType: alert.alertType,
            indicators: alert.indicators,
          } as unknown as Prisma.InputJsonValue,
          createdById: assignedToId,
        },
      });

      // 2. Initial Evidence: Entity Snapshot
      if (primaryEntity) {
        await tx.caseEvidence.create({
          data: {
            caseId: created.id,
            evidenceType: 'ENTITY',
            title: `Primary Entity Subject: ${primaryEntity.name}`,
            description: `Entity Type: ${primaryEntity.entityType} • Tax ID: ${primaryEntity.taxIdentifier || 'N/A'} • Risk Score: ${primaryEntity.riskScore}/100`,
            source: 'ENTITY_REGISTRY',
            sourceId: primaryEntity.id,
            severity: primaryEntity.riskLevel,
            createdById: assignedToId,
          },
        });
      }

      // 3. Initial Evidence: Transactions
      for (const txn of alert.transactions) {
        await tx.caseEvidence.create({
          data: {
            caseId: created.id,
            evidenceType: 'TRANSACTION',
            title: `Flagged Transfer: ₹${Number(txn.amount).toLocaleString('en-IN')}`,
            description: `Ref: ${txn.referenceNumber} • Status: ${txn.status} • Risk Level: ${txn.riskLevel}`,
            source: 'TRANSACTION_STORE',
            sourceId: txn.id,
            severity: txn.riskLevel,
            createdById: assignedToId,
          },
        });
      }

      // 4. Initial System Note
      await tx.caseNote.create({
        data: {
          caseId: created.id,
          authorId: assignedToId,
          authorName: 'FinTrace Alert Engine',
          content: `Investigation automatically opened from Alert ${alert.alertNumber}. Initial evidence docket initialized with 1 alert, ${primaryEntity ? '1 entity' : '0 entities'}, and ${alert.transactions.length} transactions.`,
          isSystemGenerated: true,
        },
      });

      // 5. Initial Audit Log
      await tx.auditLog.create({
        data: {
          caseId: created.id,
          userId: assignedToId,
          action: 'CASE_CREATED_FROM_ALERT',
          resource: `CASE_${created.caseNumber}`,
          metadata: {
            alertId: alert.id,
            alertNumber: alert.alertNumber,
            priority: created.priority,
          },
        },
      });

      return created;
    });

    return {
      case: await this.getCaseDossier(newCase.id),
      isExisting: false,
      message: `Successfully created Investigation ${newCase.caseNumber} from Alert ${alert.alertNumber}`,
    };
  }

  /**
   * Attach an existing alert to a case
   */
  async attachAlertToCase(caseId: string, alertId: string, actorUserId?: string) {
    const [targetCase, alert] = await Promise.all([
      prisma.case.findUnique({ where: { id: caseId } }),
      prisma.fraudAlert.findUnique({ where: { id: alertId } }),
    ]);

    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);
    if (!alert) throw new NotFoundError(`Alert not found: ${alertId}`);

    if (alert.caseId === caseId) {
      return { message: `Alert ${alert.alertNumber} is already attached to this case.` };
    }

    await prisma.$transaction(async (tx) => {
      await tx.fraudAlert.update({
        where: { id: alertId },
        data: { caseId, status: 'INVESTIGATING' },
      });

      // Create Evidence item for alert
      await tx.caseEvidence.create({
        data: {
          caseId,
          evidenceType: 'ALERT',
          title: `Attached Alert: ${alert.title}`,
          description: alert.description,
          source: 'ALERT_ENGINE',
          sourceId: alert.id,
          severity: alert.severity,
          createdById: actorUserId,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          caseId,
          userId: actorUserId,
          action: 'ALERT_ATTACHED',
          resource: `ALERT_${alert.alertNumber}`,
          metadata: { alertId: alert.id, alertType: alert.alertType },
        },
      });
    });

    return this.getCaseDossier(caseId);
  }

  /**
   * Add structured evidence to a case (with duplicate prevention)
   */
  async addEvidence(caseId: string, input: AddEvidenceInput) {
    const targetCase = await prisma.case.findUnique({ where: { id: caseId } });
    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);

    if (!input.title || !input.description) {
      throw new ValidationError('Evidence title and description are required.');
    }

    // Deduplication check
    if (input.sourceId) {
      const existing = await prisma.caseEvidence.findFirst({
        where: {
          caseId,
          evidenceType: input.evidenceType,
          sourceId: input.sourceId,
        },
      });
      if (existing) {
        return {
          evidence: existing,
          isDuplicate: true,
          message: `Evidence referencing ${input.sourceId} is already attached to this case.`,
        };
      }
    }

    let validCreatedById = input.createdById;
    if (validCreatedById) {
      const userExists = await prisma.user.findUnique({ where: { id: validCreatedById } });
      if (!userExists) validCreatedById = undefined;
    }

    const evidence = await prisma.caseEvidence.create({
      data: {
        caseId,
        evidenceType: input.evidenceType,
        title: input.title,
        description: input.description,
        source: input.source,
        sourceId: input.sourceId,
        severity: input.severity || 'LOW',
        metadata: input.metadata ? (input.metadata as unknown as Prisma.InputJsonValue) : undefined,
        createdById: validCreatedById,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        caseId,
        userId: input.createdById,
        action: 'EVIDENCE_ADDED',
        resource: `EVIDENCE_${evidence.id}`,
        metadata: {
          title: evidence.title,
          evidenceType: evidence.evidenceType,
          source: evidence.source,
        },
      },
    });

    return { evidence, isDuplicate: false, message: 'Evidence successfully attached to case.' };
  }

  /**
   * Add investigator note
   */
  async addNote(caseId: string, input: AddNoteInput) {
    const targetCase = await prisma.case.findUnique({ where: { id: caseId } });
    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);

    if (!input.content || !input.content.trim()) {
      throw new ValidationError('Note content cannot be empty.');
    }

    let authorName = input.authorName || 'Investigator';
    if (input.authorId && !input.authorName) {
      const user = await prisma.user.findUnique({ where: { id: input.authorId } });
      if (user) authorName = user.name;
    }

    const note = await prisma.caseNote.create({
      data: {
        caseId,
        authorId: input.authorId,
        authorName,
        content: input.content.trim(),
        isSystemGenerated: input.isSystemGenerated ?? false,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        caseId,
        userId: input.authorId,
        action: 'NOTE_ADDED',
        resource: `NOTE_${note.id}`,
        metadata: {
          authorName: note.authorName,
          isSystem: note.isSystemGenerated,
        },
      },
    });

    return note;
  }

  /**
   * Assign or reassign case investigator
   */
  async assignInvestigator(caseId: string, userId: string, actorUserId?: string) {
    const [targetCase, user] = await Promise.all([
      prisma.case.findUnique({ where: { id: caseId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);
    if (!user) throw new NotFoundError(`User not found: ${userId}`);

    const isReassignment = !!targetCase.assignedToId && targetCase.assignedToId !== userId;

    await prisma.case.update({
      where: { id: caseId },
      data: { assignedToId: userId },
    });

    await prisma.auditLog.create({
      data: {
        caseId,
        userId: actorUserId || userId,
        action: isReassignment ? 'CASE_REASSIGNED' : 'CASE_ASSIGNED',
        resource: `USER_${user.name}`,
        metadata: {
          assignedToId: user.id,
          assignedToName: user.name,
          assignedToBadge: user.badgeNumber,
        },
      },
    });

    return this.getCaseDossier(caseId);
  }

  /**
   * Update Case Status with state transition validation
   */
  async updateCaseStatus(caseId: string, newStatus: CaseStatus, reason?: string, actorUserId?: string) {
    const targetCase = await prisma.case.findUnique({ where: { id: caseId } });
    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);

    const currentStatus = targetCase.status;

    // State transition rules: A closed case cannot directly become OPEN without explicit reopen reasoning
    if (
      (currentStatus === 'CLOSED' ||
        currentStatus === 'CLOSED_CONFIRMED_FRAUD' ||
        currentStatus === 'CLOSED_FALSE_POSITIVE') &&
      newStatus === 'OPEN' &&
      !reason
    ) {
      throw new ValidationError('Reopening a closed case requires an explicit justification reason.');
    }

    await prisma.case.update({
      where: { id: caseId },
      data: { status: newStatus },
    });

    // Add note if reason provided
    if (reason) {
      await this.addNote(caseId, {
        authorId: actorUserId,
        authorName: 'System Case Manager',
        content: `Case status transitioned from ${currentStatus} to ${newStatus}.\nReason: ${reason}`,
        isSystemGenerated: true,
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        caseId,
        userId: actorUserId,
        action: 'STATUS_CHANGED',
        resource: `STATUS_${newStatus}`,
        metadata: {
          fromStatus: currentStatus,
          toStatus: newStatus,
          reason,
        },
      },
    });

    return this.getCaseDossier(caseId);
  }

  /**
   * Update Case Priority independently with PRIORITY_CHANGED audit event
   */
  async updateCasePriority(caseId: string, newPriority: CasePriority, actorUserId?: string) {
    const targetCase = await prisma.case.findUnique({ where: { id: caseId } });
    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);

    const previousPriority = targetCase.priority;

    if (previousPriority === newPriority) {
      return this.getCaseDossier(caseId);
    }

    await prisma.case.update({
      where: { id: caseId },
      data: { priority: newPriority },
    });

    // Add note
    await this.addNote(caseId, {
      authorId: actorUserId,
      authorName: 'System Case Manager',
      content: `Case priority changed from ${previousPriority} to ${newPriority}.`,
      isSystemGenerated: true,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        caseId,
        userId: actorUserId,
        action: 'PRIORITY_CHANGED',
        resource: `PRIORITY_${newPriority}`,
        metadata: {
          previousPriority,
          newPriority,
          caseId,
          actor: actorUserId || 'Investigator',
        },
      },
    });

    return this.getCaseDossier(caseId);
  }

  /**
   * Escalate case with reasoning
   */
  async escalateCase(caseId: string, reason: string, priority?: CasePriority, actorUserId?: string) {
    const targetCase = await prisma.case.findUnique({ where: { id: caseId } });
    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);

    if (!reason || !reason.trim()) {
      throw new ValidationError('Escalation reason is required.');
    }

    const updatedPriority = priority || (targetCase.priority === 'LOW' ? 'HIGH' : 'CRITICAL');

    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'ESCALATED',
        priority: updatedPriority,
        escalationReason: reason.trim(),
        escalatedAt: new Date(),
      },
    });

    // Add system note
    await this.addNote(caseId, {
      authorId: actorUserId,
      authorName: 'Senior Investigator',
      content: `CASE ESCALATED to ${updatedPriority} Priority.\nReason: ${reason.trim()}`,
      isSystemGenerated: false,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        caseId,
        userId: actorUserId,
        action: 'CASE_ESCALATED',
        resource: `PRIORITY_${updatedPriority}`,
        metadata: {
          escalationReason: reason.trim(),
          updatedPriority,
        },
      },
    });

    return this.getCaseDossier(caseId);
  }

  /**
   * Resolve case
   */
  async resolveCase(
    caseId: string,
    resolutionType: CaseResolutionType,
    summary: string,
    resolvedById?: string
  ) {
    const targetCase = await prisma.case.findUnique({ where: { id: caseId } });
    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);

    if (!summary || !summary.trim()) {
      throw new ValidationError('Resolution summary is required.');
    }

    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'RESOLVED',
        resolutionType,
        resolutionSummary: summary.trim(),
        resolvedAt: new Date(),
        resolvedById,
      },
    });

    // Add resolution note
    await this.addNote(caseId, {
      authorId: resolvedById,
      authorName: 'Lead Investigator',
      content: `CASE RESOLVED (${resolutionType.replace(/_/g, ' ')}).\nFindings & Summary: ${summary.trim()}`,
      isSystemGenerated: false,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        caseId,
        userId: resolvedById,
        action: 'CASE_RESOLVED',
        resource: `RESOLUTION_${resolutionType}`,
        metadata: {
          resolutionType,
          summary: summary.trim(),
        },
      },
    });

    return this.getCaseDossier(caseId);
  }

  /**
   * Close case
   */
  async closeCase(caseId: string, summary: string, closedById?: string) {
    const targetCase = await prisma.case.findUnique({ where: { id: caseId } });
    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);

    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'CLOSED',
        resolutionSummary: summary ? summary.trim() : targetCase.resolutionSummary,
        resolvedAt: new Date(),
        resolvedById: closedById || targetCase.resolvedById,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        caseId,
        userId: closedById,
        action: 'CASE_CLOSED',
        resource: `CASE_${targetCase.caseNumber}`,
        metadata: { summary },
      },
    });

    return this.getCaseDossier(caseId);
  }

  /**
   * Recalculate case risk using Phase 4 and Phase 5 engines
   */
  async recalculateCaseRisk(caseId: string, actorUserId?: string) {
    const targetCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { primaryEntity: true, alerts: true },
    });

    if (!targetCase) throw new NotFoundError(`Case not found: ${caseId}`);

    const entityId = targetCase.primaryEntityId || targetCase.alerts[0]?.sourceEntityId;
    if (!entityId) {
      throw new ValidationError('No linked primary entity available to recalculate risk.');
    }

    // Run Phase 4 & Phase 5 assessments
    const [riskAssess, aiAssess] = await Promise.all([
      riskEngineService.assessEntity(entityId),
      aiFraudEngineService.assessEntityAI(entityId),
    ]);

    const newScore = aiAssess.combinedScore;
    const newLevel = aiAssess.combinedRiskLevel;

    await prisma.case.update({
      where: { id: caseId },
      data: {
        riskScore: newScore,
        riskLevel: newLevel,
      },
    });

    // Add Evidence item with recalculated risk
    await prisma.caseEvidence.create({
      data: {
        caseId,
        evidenceType: 'RISK_ASSESSMENT',
        title: `Multi-Factor Risk Assessment (Score: ${newScore}/100)`,
        description: `Deterministic Risk: ${riskAssess.overallScore}/100 • AI Fraud Prob: ${(aiAssess.fraudProbability * 100).toFixed(0)}% • Fused Risk Level: ${newLevel}`,
        source: 'RISK_AI_ENGINE',
        sourceId: entityId,
        severity: newLevel,
        metadata: {
          deterministicScore: riskAssess.overallScore,
          aiFraudProbability: aiAssess.fraudProbability,
          fusedScore: newScore,
        } as unknown as Prisma.InputJsonValue,
        createdById: actorUserId,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        caseId,
        userId: actorUserId,
        action: 'RISK_RECALCULATED',
        resource: `RISK_${newScore}`,
        metadata: {
          previousScore: targetCase.riskScore,
          updatedScore: newScore,
          updatedLevel: newLevel,
        },
      },
    });

    return this.getCaseDossier(caseId);
  }

  /**
   * Aggregate KPI overview stats for investigations dashboard
   */
  async getOverviewStats() {
    const [
      total,
      open,
      pending,
      inReview,
      escalated,
      resolved,
      critical,
    ] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: 'OPEN' } }),
      prisma.case.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.case.count({ where: { status: 'IN_REVIEW' } }),
      prisma.case.count({ where: { status: 'ESCALATED' } }),
      prisma.case.count({ where: { status: { in: ['RESOLVED', 'CLOSED', 'CLOSED_CONFIRMED_FRAUD'] } } }),
      prisma.case.count({ where: { priority: 'CRITICAL' } }),
    ]);

    return {
      totalCases: total,
      openCases: open,
      pendingReviewCount: pending,
      inReviewCount: inReview,
      escalatedCount: escalated,
      resolvedCount: resolved,
      criticalPriorityCount: critical,
    };
  }
}

export const caseService = new CaseService();
