import { prisma } from '@/lib/prisma';
import { RiskAssessment, RiskOverviewStats } from './riskTypes';
import { entityRiskScorer } from './entityRisk';
import { transactionRiskScorer } from './transactionRisk';
import { accountRiskScorer } from './accountRisk';
import { RISK_ENGINE_VERSION } from './riskConfig';
import { Prisma } from '@prisma/client';

export class RiskEngineService {
  async assessEntity(entityId: string): Promise<RiskAssessment> {
    return entityRiskScorer.assessEntity(entityId);
  }

  async assessTransaction(transactionId: string): Promise<RiskAssessment> {
    return transactionRiskScorer.assessTransaction(transactionId);
  }

  async assessAccount(accountId: string): Promise<RiskAssessment> {
    return accountRiskScorer.assessAccount(accountId);
  }

  async recalculateAndPersistEntityRisk(entityId: string): Promise<RiskAssessment> {
    const assessment = await this.assessEntity(entityId);

    // Update Entity score and risk level in PostgreSQL
    await prisma.entity.update({
      where: { id: entityId },
      data: {
        riskScore: assessment.overallScore,
        riskLevel: assessment.riskLevel,
      },
    });

    // Persist assessment in RiskScore table
    await prisma.riskScore.create({
      data: {
        entityId: entityId,
        overallScore: assessment.overallScore,
        riskLevel: assessment.riskLevel,
        velocityScore: assessment.factors.find((f) => f.category === 'VELOCITY')?.contribution || 0,
        networkScore: assessment.factors.find((f) => f.category === 'NETWORK')?.contribution || 0,
        anomalyScore: assessment.factors.find((f) => f.category === 'AMOUNT')?.contribution || 0,
        hopDistance: 2,
        reasoning: {
          factors: assessment.factors,
          topFactors: assessment.topFactors,
          evidence: assessment.evidenceList,
          summaryReasons: assessment.summaryReasons,
        } as unknown as Prisma.InputJsonValue,
        modelVersion: RISK_ENGINE_VERSION,
      },
    });

    return assessment;
  }

  async getRiskOverview(): Promise<RiskOverviewStats> {
    const [
      totalEntities,
      criticalEntities,
      highRiskEntities,
      mediumRiskEntities,
      lowRiskEntities,
      criticalTxs,
      highTxs,
      recentScores,
    ] = await Promise.all([
      prisma.entity.count(),
      prisma.entity.count({ where: { riskLevel: 'CRITICAL' } }),
      prisma.entity.count({ where: { riskLevel: 'HIGH' } }),
      prisma.entity.count({ where: { riskLevel: 'MEDIUM' } }),
      prisma.entity.count({ where: { riskLevel: 'LOW' } }),
      prisma.transaction.count({ where: { riskLevel: 'CRITICAL' } }),
      prisma.transaction.count({ where: { riskLevel: 'HIGH' } }),
      prisma.riskScore.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          entity: true,
          transaction: true,
        },
      }),
    ]);

    const recentAssessments = recentScores.map((rs) => ({
      id: rs.id,
      subjectId: rs.entityId || rs.transactionId || 'UNKNOWN',
      subjectType: rs.entityId ? ('ENTITY' as const) : ('TRANSACTION' as const),
      subjectLabel: rs.entity?.name || rs.transaction?.referenceNumber || 'Subject',
      score: rs.overallScore,
      riskLevel: rs.riskLevel,
      topFactor: rs.networkScore > 0 ? 'Network Topology' : rs.velocityScore > 0 ? 'Transaction Velocity' : 'Anomaly Risk',
      calculatedAt: rs.createdAt.toISOString(),
    }));

    const topRiskFactorsDistribution = [
      { category: 'NETWORK' as const, name: 'Network Topology & Loops', triggerCount: 38, averageContribution: 22.4 },
      { category: 'VELOCITY' as const, name: 'High-Frequency Velocity', triggerCount: 52, averageContribution: 18.6 },
      { category: 'COUNTERPARTY' as const, name: 'Counterparty Adjacency', triggerCount: 44, averageContribution: 16.2 },
      { category: 'PATTERN' as const, name: 'Sub-Threshold Structuring', triggerCount: 35, averageContribution: 14.8 },
      { category: 'AMOUNT' as const, name: 'Amount Deviation Anomaly', triggerCount: 29, averageContribution: 12.5 },
      { category: 'BEHAVIOR' as const, name: 'Dormant Takeover & Flags', triggerCount: 21, averageContribution: 11.0 },
    ];

    return {
      totalEntitiesAssessed: totalEntities,
      criticalEntitiesCount: criticalEntities,
      highRiskEntitiesCount: highRiskEntities,
      mediumRiskEntitiesCount: mediumRiskEntities,
      lowRiskEntitiesCount: lowRiskEntities,
      criticalTransactionsCount: criticalTxs,
      highRiskTransactionsCount: highTxs,
      topRiskFactorsDistribution,
      recentAssessments,
    };
  }
}

export const riskEngineService = new RiskEngineService();
