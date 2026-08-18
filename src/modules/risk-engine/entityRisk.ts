import { prisma } from '@/lib/prisma';
import { RiskAssessment, RiskFactor } from './riskTypes';
import { networkRiskAdapter } from './networkRiskAdapter';
import { velocityAnalyzer } from './velocityAnalysis';
import { structuringAnalyzer } from './structuringAnalysis';
import { counterpartyAnalyzer } from './counterpartyAnalysis';
import {
  RISK_ENGINE_VERSION,
  getRiskLevelFromScore,
  normalizeRiskScore,
  ENTITY_RISK_WEIGHTS,
} from './riskConfig';

export class EntityRiskScorer {
  async assessEntity(entityId: string): Promise<RiskAssessment> {
    const entity = await prisma.entity.findUnique({
      where: { id: entityId },
      include: {
        accounts: true,
        sourceAlerts: true,
        targetAlerts: true,
      },
    });

    if (!entity) throw new Error(`Entity not found: ${entityId}`);

    const accIds = entity.accounts.map((a) => a.id);

    // 1. Network Risk via Phase 3 Graph Adapter
    const networkFactor = await networkRiskAdapter.evaluateNetworkRiskForEntity(
      entityId,
      ENTITY_RISK_WEIGHTS.NETWORK_TOPOLOGY
    );

    // 2. Velocity & Transaction Volume
    const entityTxs = await prisma.transaction.findMany({
      where: {
        OR: [{ senderAccountId: { in: accIds } }, { receiverAccountId: { in: accIds } }],
      },
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: {
        senderAccount: { include: { entity: true } },
        receiverAccount: { include: { entity: true } },
      },
    });

    const outgoingTxs = entityTxs.filter((t) => accIds.includes(t.senderAccountId));
    const outVol = outgoingTxs.reduce((sum, t) => sum + Number(t.amount), 0);
    const uniqueCp = new Set(
      entityTxs.map((t) =>
        accIds.includes(t.senderAccountId) ? t.receiverAccount.entity.id : t.senderAccount.entity.id
      )
    ).size;

    const velocityFactor = velocityAnalyzer.analyzeVelocity(
      {
        count5m: Math.min(outgoingTxs.length, 5),
        count15m: Math.min(outgoingTxs.length, 12),
        count1h: Math.min(outgoingTxs.length, 20),
        count24h: outgoingTxs.length,
        outgoingValue24h: outVol,
        uniqueCounterparties24h: uniqueCp,
        relatedTransactionIds: outgoingTxs.map((t) => t.id),
      },
      ENTITY_RISK_WEIGHTS.VELOCITY_VOLUME
    );

    // 3. Counterparty Concentration Risk
    const counterparties = entityTxs.map((t) => {
      const isSender = accIds.includes(t.senderAccountId);
      const cpEnt = isSender ? t.receiverAccount.entity : t.senderAccount.entity;
      return {
        id: cpEnt.id,
        name: cpEnt.name,
        riskScore: cpEnt.riskScore,
        riskLevel: cpEnt.riskLevel,
        isSanctioned: cpEnt.isSanctioned,
        isPEP: cpEnt.isPEP,
        entityType: cpEnt.entityType,
      };
    });

    const counterpartyFactor = counterpartyAnalyzer.analyzeCounterparty(
      counterparties,
      ENTITY_RISK_WEIGHTS.COUNTERPARTY_CONCENTRATION
    );

    // 4. Structuring Behavior Factor
    const structuringFactor = structuringAnalyzer.analyzeStructuring(
      entityTxs.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        timestamp: t.timestamp,
        senderAccountId: t.senderAccountId,
        receiverAccountId: t.receiverAccountId,
      })),
      ENTITY_RISK_WEIGHTS.STRUCTURING_BEHAVIOR
    );

    // 5. Alert History Factor
    const alertCount = entity.sourceAlerts.length + entity.targetAlerts.length;
    const criticalAlerts = [...entity.sourceAlerts, ...entity.targetAlerts].filter((a) => a.severity === 'CRITICAL').length;
    const alertContribution = criticalAlerts > 0 ? 20 : alertCount >= 3 ? 14 : alertCount > 0 ? 8 : 0;

    const alertFactor: RiskFactor = {
      id: 'factor-alert-history',
      name: 'Historical Fraud Alerts & Indicators',
      category: 'HISTORY',
      contribution: alertContribution,
      weight: ENTITY_RISK_WEIGHTS.ALERT_HISTORY,
      severity: alertContribution >= 18 ? 'CRITICAL' : alertContribution >= 12 ? 'HIGH' : 'LOW',
      explanation:
        alertCount > 0
          ? `Entity linked to ${alertCount} historical alerts (${criticalAlerts} CRITICAL).`
          : 'No historical alert records associated with this entity.',
      evidence: [
        {
          statement: `Subject has ${alertCount} total alerts recorded in fraud queue`,
          metricName: 'Alert History Count',
          metricValue: alertCount,
          relatedEntityIds: [entityId],
        },
      ],
      relatedRecords: { entityIds: [entityId] },
    };

    const allFactors: RiskFactor[] = [
      networkFactor,
      velocityFactor,
      counterpartyFactor,
      structuringFactor,
      alertFactor,
    ];

    const rawTotal = allFactors.reduce((sum, f) => sum + f.contribution, 0);
    const overallScore = normalizeRiskScore(rawTotal);
    const riskLevel = getRiskLevelFromScore(overallScore);

    const topFactors = [...allFactors].sort((a, b) => b.contribution - a.contribution).filter((f) => f.contribution > 0);
    const summaryReasons = topFactors.map((f) => f.explanation);
    const evidenceList = allFactors.flatMap((f) => f.evidence);

    return {
      id: `assess-ent-${entity.id}`,
      subjectId: entity.id,
      subjectType: 'ENTITY',
      subjectLabel: entity.name,
      subjectSublabel: `${entity.entityType.replace('_', ' ')} • PAN: ${entity.taxIdentifier || 'N/A'} • ${entity.jurisdiction}`,
      overallScore,
      riskLevel,
      factors: allFactors,
      topFactors,
      summaryReasons,
      evidenceList,
      engineVersion: RISK_ENGINE_VERSION,
      calculatedAt: new Date().toISOString(),
    };
  }
}

export const entityRiskScorer = new EntityRiskScorer();
