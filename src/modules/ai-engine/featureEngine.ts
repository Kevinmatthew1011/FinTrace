import { prisma } from '@/lib/prisma';
import { ExtractedFeatures, BehavioralBaseline, AIAssessmentTargetType } from './aiTypes';
import { graphIntelligenceService } from '../graph';
import { riskEngineService } from '../risk-engine';

export class FeatureEngine {
  /**
   * Build baseline statistics from historical records
   */
  calculateBaseline(amounts: number[], timestamps: Date[] = []): BehavioralBaseline {
    if (amounts.length === 0) {
      return {
        targetId: 'unknown',
        targetType: 'ACCOUNT',
        historyCount: 0,
        meanAmount: 0,
        medianAmount: 0,
        stdDevAmount: 0,
        maxAmount: 0,
        p95Amount: 0,
        meanDailyFrequency: 0,
        typicalCounterpartyIds: [],
        activeHoursDistribution: {},
        dormancyDays: 0,
        calculatedAt: new Date().toISOString(),
      };
    }

    const sorted = [...amounts].sort((a, b) => a - b);
    const meanAmount = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;
    const medianAmount =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    const variance =
      sorted.reduce((acc, v) => acc + Math.pow(v - meanAmount, 2), 0) / (sorted.length || 1);
    const stdDevAmount = Math.sqrt(variance);
    const maxAmount = sorted[sorted.length - 1];
    const p95Index = Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1);
    const p95Amount = sorted[p95Index];

    const hourCounts: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourCounts[h] = 0;
    for (const t of timestamps) {
      const h = t.getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    const totalTxs = timestamps.length || 1;
    const activeHoursDistribution: Record<number, number> = {};
    for (let h = 0; h < 24; h++) {
      activeHoursDistribution[h] = hourCounts[h] / totalTxs;
    }

    return {
      targetId: 'computed',
      targetType: 'ACCOUNT',
      historyCount: sorted.length,
      meanAmount: Math.round(meanAmount),
      medianAmount: Math.round(medianAmount),
      stdDevAmount: Math.round(stdDevAmount),
      maxAmount: Math.round(maxAmount),
      p95Amount: Math.round(p95Amount),
      meanDailyFrequency: Math.max(1, sorted.length / 30),
      typicalCounterpartyIds: [],
      activeHoursDistribution,
      dormancyDays: 0,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Extract features from a transaction in the database
   */
  async extractTransactionFeatures(transactionId: string): Promise<{
    features: ExtractedFeatures;
    baseline: BehavioralBaseline;
    targetInfo: {
      id: string;
      referenceNumber: string;
      senderEntityId: string;
      senderEntityName: string;
      receiverEntityId: string;
      receiverEntityName: string;
      amount: number;
      channel: string;
      timestamp: Date;
    };
  }> {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        senderAccount: { include: { entity: true } },
        receiverAccount: { include: { entity: true } },
      },
    });

    if (!tx) throw new Error(`Transaction not found: ${transactionId}`);

    const amount = Number(tx.amount);
    const txDate = tx.timestamp;
    const sAcc = tx.senderAccount;
    const rAcc = tx.receiverAccount;
    const sEnt = sAcc.entity;
    const rEnt = rAcc.entity;

    // 1. Historical past transactions of sender account
    const pastSenderTxs = await prisma.transaction.findMany({
      where: {
        senderAccountId: sAcc.id,
        timestamp: { lt: txDate },
      },
      select: { amount: true, timestamp: true, receiverAccountId: true },
      take: 60,
      orderBy: { timestamp: 'desc' },
    });

    const pastAmounts = pastSenderTxs.map((t) => Number(t.amount));
    const pastDates = pastSenderTxs.map((t) => t.timestamp);
    const baseline = this.calculateBaseline(pastAmounts, pastDates);
    baseline.targetId = sAcc.id;

    // 2. Amount Ratios & Z-Scores
    const meanAmt = baseline.meanAmount > 0 ? baseline.meanAmount : amount;
    const medianAmt = baseline.medianAmount > 0 ? baseline.medianAmount : amount;
    const stdAmt = baseline.stdDevAmount > 0 ? baseline.stdDevAmount : amount * 0.2;
    const amountToMeanRatio = Number((amount / meanAmt).toFixed(2));
    const amountToMedianRatio = Number((amount / medianAmt).toFixed(2));
    const amountZScore = Number(((amount - meanAmt) / (stdAmt || 1)).toFixed(2));
    const isRoundAmount = amount >= 10000 && amount % 10000 === 0;
    const isSubThresholdStructuring = amount >= 45000 && amount < 50000;

    // 3. Velocity in windows (5m, 15m, 1h, 24h)
    const fiveMinAgo = new Date(txDate.getTime() - 5 * 60 * 1000);
    const fifteenMinAgo = new Date(txDate.getTime() - 15 * 60 * 1000);
    const oneHourAgo = new Date(txDate.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(txDate.getTime() - 24 * 3600 * 1000);

    const recentTxs = await prisma.transaction.findMany({
      where: {
        senderAccountId: sAcc.id,
        timestamp: { gte: dayAgo, lte: txDate },
      },
      include: {
        receiverAccount: { include: { entity: true } },
      },
    });

    const count5m = recentTxs.filter((t) => t.timestamp >= fiveMinAgo).length;
    const count15m = recentTxs.filter((t) => t.timestamp >= fifteenMinAgo).length;
    const count1h = recentTxs.filter((t) => t.timestamp >= oneHourAgo).length;
    const count24h = recentTxs.length;
    const volume24h = recentTxs.reduce((sum, t) => sum + Number(t.amount), 0);

    // Expected daily frequency vs observed
    const expectedFreq = baseline.meanDailyFrequency || 1;
    const frequencyBurstZScore = Number(((count24h - expectedFreq) / Math.sqrt(expectedFreq)).toFixed(2));

    // 4. Timing & Dormancy
    const hour = txDate.getHours();
    const isOddHourTransfer = hour >= 23 || hour <= 4;

    let dormancyDays = 0;
    if (pastSenderTxs.length > 0) {
      const lastTxDate = pastSenderTxs[0].timestamp;
      dormancyDays = Math.max(0, Math.floor((txDate.getTime() - lastTxDate.getTime()) / (1000 * 3600 * 24)));
    }
    const isDormantAwakening = dormancyDays >= 60 && amount >= 50000;

    const accountAgeDays = Math.max(
      1,
      Math.floor((txDate.getTime() - sAcc.createdAt.getTime()) / (1000 * 3600 * 24))
    );
    const accountBalance = Number(sAcc.currentBalance);
    const accountBalanceToAmountRatio =
      accountBalance > 0 ? Number((accountBalance / amount).toFixed(2)) : 0.05;

    // 5. Counterparties & Diversity
    const uniqueRecv = new Set(recentTxs.map((t) => t.receiverAccountId));
    const uniqueCounterparties24h = uniqueRecv.size;
    const highRiskCounterpartiesCount = recentTxs.filter(
      (t) => t.receiverAccount?.entity?.riskScore >= 60
    ).length;

    const priorRecipientIds = new Set(pastSenderTxs.map((t) => t.receiverAccountId));
    const newCounterpartiesIn24h = Array.from(uniqueRecv).filter((id) => !priorRecipientIds.has(id)).length;
    const newCounterpartyRatio =
      uniqueCounterparties24h > 0 ? Number((newCounterpartiesIn24h / uniqueCounterparties24h).toFixed(2)) : 0;

    // Herfindahl-Hirschman Index for concentration
    let counterpartyConcentrationHHI = 1.0;
    if (recentTxs.length > 0) {
      const countsByReceiver: Record<string, number> = {};
      for (const t of recentTxs) {
        countsByReceiver[t.receiverAccountId] = (countsByReceiver[t.receiverAccountId] || 0) + 1;
      }
      const shares = Object.values(countsByReceiver).map((c) => c / recentTxs.length);
      counterpartyConcentrationHHI = Number(
        shares.reduce((sum, s) => sum + Math.pow(s, 2), 0).toFixed(2)
      );
    }

    // 6. Phase 3 Graph & Network Signals
    let cycleCount = 0;
    let highRiskNeighborRatio = 0;
    let compositeNetworkRisk = 0;
    try {
      const graphAnalysis = await graphIntelligenceService.analyzeEntityNetwork(sEnt.id);
      cycleCount = graphAnalysis.cycles.length;
      highRiskNeighborRatio =
        graphAnalysis.highRiskConnections.length > 0
          ? Number((graphAnalysis.highRiskConnections.length / Math.max(1, graphAnalysis.statistics.nodeCount)).toFixed(2))
          : 0;
      compositeNetworkRisk = graphAnalysis.networkRiskScore;
    } catch {
      compositeNetworkRisk = sEnt.riskScore >= 70 ? 75 : sEnt.riskScore >= 40 ? 45 : 15;
    }

    // 7. Phase 4 Deterministic Risk Score
    let deterministicRiskScore = tx.riskScore;
    if (deterministicRiskScore === 0) {
      try {
        const assessment = await riskEngineService.assessTransaction(tx.id);
        deterministicRiskScore = assessment.overallScore;
      } catch {
        deterministicRiskScore = tx.isSuspicious ? 65 : 15;
      }
    }

    const priorSuspiciousAlertsCount = await prisma.fraudAlert.count({
      where: {
        OR: [{ sourceEntityId: sEnt.id }, { targetEntityId: sEnt.id }],
      },
    });

    const isPEPOrSanctioned = sEnt.isPEP || sEnt.isSanctioned || rEnt.isPEP || rEnt.isSanctioned;

    const features: ExtractedFeatures = {
      amount,
      amountToMeanRatio,
      amountToMedianRatio,
      amountZScore,
      isRoundAmount,
      isSubThresholdStructuring,
      count5m,
      count15m,
      count1h,
      count24h,
      volume24h,
      frequencyBurstZScore,
      isOddHourTransfer,
      dormancyDays,
      isDormantAwakening,
      accountAgeDays,
      accountBalanceToAmountRatio,
      uniqueCounterparties24h,
      highRiskCounterpartiesCount,
      newCounterpartyRatio,
      counterpartyConcentrationHHI,
      cycleParticipationCount: cycleCount,
      muleChainLength: sAcc.isMuleFlagged ? 3 : 0,
      highRiskNeighborRatio,
      shortestPathToKnownBadActor: sEnt.riskScore >= 80 ? 1 : 2,
      networkClusteringCoeff: 0.42,
      compositeNetworkRisk,
      priorSuspiciousAlertsCount,
      deterministicRiskScore,
      isPEPOrSanctioned,
    };

    return {
      features,
      baseline,
      targetInfo: {
        id: tx.id,
        referenceNumber: tx.referenceNumber,
        senderEntityId: sEnt.id,
        senderEntityName: sEnt.name,
        receiverEntityId: rEnt.id,
        receiverEntityName: rEnt.name,
        amount,
        channel: tx.channel,
        timestamp: tx.timestamp,
      },
    };
  }

  /**
   * Extract features from an Entity in the database
   */
  async extractEntityFeatures(entityId: string): Promise<{
    features: ExtractedFeatures;
    baseline: BehavioralBaseline;
    entity: {
      id: string;
      name: string;
      entityType: string;
      taxIdentifier: string;
      riskScore: number;
      riskLevel: string;
      accountCount: number;
    };
  }> {
    const entity = await prisma.entity.findUnique({
      where: { id: entityId },
      include: {
        accounts: {
          include: {
            outgoingTx: { take: 30, orderBy: { timestamp: 'desc' } },
            incomingTx: { take: 30, orderBy: { timestamp: 'desc' } },
          },
        },
      },
    });

    if (!entity) throw new Error(`Entity not found: ${entityId}`);

    const allOutgoing = entity.accounts.flatMap((a) => a.outgoingTx);
    const allIncoming = entity.accounts.flatMap((a) => a.incomingTx);
    const allAmounts = allOutgoing.map((t) => Number(t.amount));
    const allDates = allOutgoing.map((t) => t.timestamp);

    const baseline = this.calculateBaseline(allAmounts, allDates);
    baseline.targetId = entity.id;
    baseline.targetType = 'ENTITY';

    const totalVolume = allAmounts.reduce((s, a) => s + a, 0);
    const avgAmount = baseline.meanAmount;
    const maxAmount = baseline.maxAmount;

    // Velocity across all entity accounts
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
    const txsIn24h = allOutgoing.filter((t) => t.timestamp >= dayAgo);
    const count24h = txsIn24h.length;
    const volume24h = txsIn24h.reduce((s, t) => s + Number(t.amount), 0);

    // Graph features from Phase 3
    let cycleCount = 0;
    let highRiskNeighborRatio = 0;
    let compositeNetworkRisk = 0;
    try {
      const graphAnalysis = await graphIntelligenceService.analyzeEntityNetwork(entity.id);
      cycleCount = graphAnalysis.cycles.length;
      highRiskNeighborRatio =
        graphAnalysis.highRiskConnections.length > 0
          ? Number((graphAnalysis.highRiskConnections.length / Math.max(1, graphAnalysis.statistics.nodeCount)).toFixed(2))
          : 0;
      compositeNetworkRisk = graphAnalysis.networkRiskScore;
    } catch {
      compositeNetworkRisk = entity.riskScore;
    }

    const priorSuspiciousAlertsCount = await prisma.fraudAlert.count({
      where: {
        OR: [{ sourceEntityId: entity.id }, { targetEntityId: entity.id }],
      },
    });

    const isPEPOrSanctioned = entity.isPEP || entity.isSanctioned;
    const hasMuleAccount = entity.accounts.some((a) => a.isMuleFlagged);

    const latestAmt = allOutgoing[0] ? Number(allOutgoing[0].amount) : avgAmount;
    const fifteenMinAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const count5m = allOutgoing.filter((t) => t.timestamp >= fiveMinAgo).length;
    const count15m = allOutgoing.filter((t) => t.timestamp >= fifteenMinAgo).length;
    const count1h = allOutgoing.filter((t) => t.timestamp >= oneHourAgo).length;

    const features: ExtractedFeatures = {
      amount: latestAmt || totalVolume / (allOutgoing.length || 1),
      amountToMeanRatio: avgAmount > 0 ? Number((latestAmt / avgAmount).toFixed(2)) : 1.0,
      amountToMedianRatio: baseline.medianAmount > 0 ? Number((latestAmt / baseline.medianAmount).toFixed(2)) : 1.0,
      amountZScore: baseline.stdDevAmount > 0 ? Number(((latestAmt - avgAmount) / baseline.stdDevAmount).toFixed(2)) : 0,
      isRoundAmount: false,
      isSubThresholdStructuring: allOutgoing.some((t) => Number(t.amount) >= 45000 && Number(t.amount) < 50000),
      count5m,
      count15m,
      count1h,
      count24h,
      volume24h,
      frequencyBurstZScore: Number(((count24h - baseline.meanDailyFrequency) / Math.max(1, Math.sqrt(baseline.meanDailyFrequency))).toFixed(2)),
      isOddHourTransfer: allDates.some((d) => d.getHours() >= 23 || d.getHours() <= 4),
      dormancyDays: 0,
      isDormantAwakening: false,
      accountAgeDays: 180,
      accountBalanceToAmountRatio: 1.2,
      uniqueCounterparties24h: new Set(allOutgoing.map((t) => t.receiverAccountId)).size,
      highRiskCounterpartiesCount: cycleCount > 0 ? 3 : entity.riskScore >= 70 ? 2 : 0,
      newCounterpartyRatio: 0.15,
      counterpartyConcentrationHHI: 0.28,
      cycleParticipationCount: cycleCount,
      muleChainLength: hasMuleAccount ? 4 : 0,
      highRiskNeighborRatio,
      shortestPathToKnownBadActor: entity.riskScore >= 80 ? 1 : 2,
      networkClusteringCoeff: 0.55,
      compositeNetworkRisk,
      priorSuspiciousAlertsCount,
      deterministicRiskScore: entity.riskScore,
      isPEPOrSanctioned,
    };

    return {
      features,
      baseline,
      entity: {
        id: entity.id,
        name: entity.name,
        entityType: entity.entityType,
        taxIdentifier: entity.taxIdentifier || 'N/A',
        riskScore: entity.riskScore,
        riskLevel: entity.riskLevel,
        accountCount: entity.accounts.length,
      },
    };
  }
}

export const featureEngine = new FeatureEngine();
