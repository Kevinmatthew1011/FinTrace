import { prisma } from '@/lib/prisma';
import { caseService } from '@/modules/cases';
import { NotFoundError } from '@/lib/errors';
import { InvestigationContext } from './intelligenceTypes';

export class EvidenceCollector {
  /**
   * Aggregate complete structured context for a case
   */
  async collectInvestigationContext(caseId: string): Promise<InvestigationContext> {
    const dossier = await caseService.getCaseDossier(caseId);
    if (!dossier) throw new NotFoundError(`Case not found: ${caseId}`);

    const context: InvestigationContext = {
      caseDetails: {
        id: dossier.caseDetails.id,
        caseNumber: dossier.caseDetails.caseNumber,
        title: dossier.caseDetails.title,
        description: dossier.caseDetails.description,
        priority: dossier.caseDetails.priority,
        status: dossier.caseDetails.status,
        riskScore: dossier.caseDetails.riskScore,
        riskLevel: dossier.caseDetails.riskLevel,
        escalationReason: dossier.caseDetails.escalationReason,
        resolutionType: dossier.caseDetails.resolutionType,
        resolutionSummary: dossier.caseDetails.resolutionSummary,
        createdAt: dossier.caseDetails.createdAt,
        updatedAt: dossier.caseDetails.updatedAt,
        assignedInvestigator: dossier.caseDetails.assignedInvestigator,
      },
      primaryEntity: dossier.primaryEntity
        ? {
            id: dossier.primaryEntity.id,
            name: dossier.primaryEntity.name,
            entityType: dossier.primaryEntity.entityType,
            taxId: dossier.primaryEntity.taxIdentifier,
            registrationNumber: dossier.primaryEntity.registrationNum,
            jurisdiction: dossier.primaryEntity.jurisdiction,
            riskScore: dossier.primaryEntity.riskScore,
            riskLevel: dossier.primaryEntity.riskLevel,
            isSanctioned: dossier.primaryEntity.isSanctioned,
            isPEP: dossier.primaryEntity.isPEP,
            accounts: dossier.primaryEntity.accounts.map((a: any) => ({
              id: a.id,
              accountNumber: a.accountNumber,
              accountType: a.accountType,
              bankName: a.bankName,
              balance: Number(a.currentBalance || 0),
              currency: a.currency,
              status: a.isFrozen ? 'FROZEN' : 'ACTIVE',
            })),
          }
        : null,
      alerts: dossier.alerts.map((a: any) => ({
        id: a.id,
        alertNumber: a.alertNumber,
        alertType: a.alertType,
        title: a.title,
        description: a.description,
        severity: a.severity,
        status: a.status,
        indicators: Array.isArray(a.indicators) ? a.indicators : [],
        createdAt: a.createdAt,
      })),
      transactions: dossier.transactions.map((t: any) => ({
        id: t.id,
        transactionNumber: t.transactionNumber || t.id,
        amount: Number(t.amount),
        currency: t.currency || 'INR',
        channel: t.channel || 'IMPS',
        status: t.status || 'COMPLETED',
        riskScore: t.riskScore || 0,
        riskLevel: t.riskLevel || 'LOW',
        timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
        senderAccountNumber: t.senderAccount?.accountNumber,
        senderEntityName: t.senderAccount?.entity?.name,
        receiverAccountNumber: t.receiverAccount?.accountNumber,
        receiverEntityName: t.receiverAccount?.entity?.name,
        isCircular: t.isCircular || false,
        isMuleCandidate: t.isMuleCandidate || false,
      })),
      networkFindings: dossier.networkFindings
        ? {
            compositeRiskScore: dossier.networkFindings.compositeRiskScore || 0,
            riskLevel: dossier.networkFindings.riskLevel || 'LOW',
            connectedEntitiesCount: dossier.networkFindings.connectedEntitiesCount || 0,
            cycles: (dossier.networkFindings.cycles || []).map((c: any, idx: number) => ({
              cycleId: c.cycleId || `CYC-${idx + 1}`,
              length: c.length || (Array.isArray(c.entities) ? c.entities.length : 0),
              entities: Array.isArray(c.entities)
                ? c.entities.map((e: any) => (typeof e === 'string' ? e : e.name || e.id || String(e)))
                : [],
              totalAmount: Number(c.totalAmount || c.amount || c.volume || 0),
              description: c.description || 'Circular transaction loop detected',
            })),
            highRiskNeighbors: (dossier.networkFindings.highRiskNeighbors || []).map((n: any) => ({
              entityId: n.entityId,
              name: n.name,
              riskLevel: n.riskLevel,
              riskScore: n.riskScore,
              relationship: n.relationship || 'DIRECT_TRANSFER',
            })),
            muleFindings: (dossier.networkFindings.muleFindings || []).map((m: any) => ({
              accountNumber: m.accountNumber,
              fanIn: m.fanIn || 0,
              fanOut: m.fanOut || 0,
              velocityMinutes: m.velocityMinutes || 0,
              dispersalRatio: m.dispersalRatio || 0,
            })),
          }
        : null,
      deterministicRisk: dossier.deterministicRisk
        ? {
            overallScore: dossier.deterministicRisk.overallScore || 0,
            riskLevel: dossier.deterministicRisk.riskLevel || 'LOW',
            factors: (dossier.deterministicRisk.factors || []).map((f: any) => ({
              factorName: f.factorName,
              scoreContribution: f.scoreContribution || 0,
              explanation: f.explanation || '',
              evidenceCount: f.evidenceCount || 1,
            })),
            engineVersion: dossier.deterministicRisk.engineVersion || 'v1.0.0',
            calculatedAt: dossier.deterministicRisk.calculatedAt || new Date().toISOString(),
          }
        : null,
      aiRiskAssessment: dossier.aiRiskAssessment
        ? {
            fraudProbability: dossier.aiRiskAssessment.fraudProbability || 0,
            anomalyScore: dossier.aiRiskAssessment.anomalyScore || 0,
            classification: dossier.aiRiskAssessment.classification || 'NORMAL',
            fusedRiskScore: dossier.aiRiskAssessment.fusedRiskScore || 0,
            fusedLevel: dossier.aiRiskAssessment.fusedLevel || 'LOW',
            modelVersion: dossier.aiRiskAssessment.modelVersion || 'fin-tree-v1',
            topAnomalies: dossier.aiRiskAssessment.topAnomalies || [],
          }
        : null,
      evidences: dossier.evidences.map((e: any) => ({
        id: e.id,
        evidenceType: e.evidenceType,
        title: e.title,
        description: e.description,
        source: e.source,
        sourceId: e.sourceId,
        severity: e.severity,
        metadata: e.metadata,
        createdAt: e.createdAt,
      })),
      notes: dossier.notes.map((n: any) => ({
        id: n.id,
        authorName: n.authorName || n.author?.name || 'Investigator',
        content: n.content,
        isSystemGenerated: n.isSystemGenerated,
        createdAt: n.createdAt,
      })),
      auditTimeline: dossier.auditTimeline.map((l: any) => ({
        id: l.id,
        action: l.action,
        actorName: l.actorName || l.user?.name || 'System',
        createdAt: l.createdAt,
        metadata: l.metadata,
      })),
    };

    return context;
  }

  /**
   * Aggregate transaction baseline context
   */
  async collectTransactionContext(transactionId: string) {
    const txn = await prisma.transaction.findFirst({
      where: {
        OR: [{ id: transactionId }, { referenceNumber: transactionId }],
      },
      include: {
        senderAccount: { include: { entity: true } },
        receiverAccount: { include: { entity: true } },
      },
    });

    if (!txn) throw new NotFoundError(`Transaction not found: ${transactionId}`);

    // Compute historical baseline of sender account
    const historicalTxns = await prisma.transaction.findMany({
      where: {
        senderAccountId: txn.senderAccountId,
        id: { not: txn.id },
      },
      take: 50,
      orderBy: { timestamp: 'desc' },
    });

    const amounts = historicalTxns.map((t) => Number(t.amount));
    const count = amounts.length;
    const mean = count > 0 ? amounts.reduce((a, b) => a + b, 0) / count : Number(txn.amount);

    return {
      transaction: txn,
      historicalCount: count,
      historicalMean: mean,
      deviationMultiplier: mean > 0 ? Number(txn.amount) / mean : 1.0,
    };
  }

  /**
   * Aggregate alert context
   */
  async collectAlertContext(alertId: string) {
    const alert = await prisma.fraudAlert.findFirst({
      where: {
        OR: [{ id: alertId }, { alertNumber: alertId }],
      },
      include: {
        sourceEntity: true,
        targetEntity: true,
        transactions: true,
      },
    });

    if (!alert) throw new NotFoundError(`Alert not found: ${alertId}`);
    return alert;
  }
}

export const evidenceCollector = new EvidenceCollector();
