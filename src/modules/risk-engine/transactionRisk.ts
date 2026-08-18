import { prisma } from '@/lib/prisma';
import { RiskAssessment, RiskFactor } from './riskTypes';
import { amountAnomalyAnalyzer } from './amountAnalysis';
import { velocityAnalyzer } from './velocityAnalysis';
import { structuringAnalyzer } from './structuringAnalysis';
import { counterpartyAnalyzer } from './counterpartyAnalysis';
import {
  RISK_ENGINE_VERSION,
  getRiskLevelFromScore,
  normalizeRiskScore,
  TRANSACTION_RISK_WEIGHTS,
} from './riskConfig';

export class TransactionRiskScorer {
  async assessTransaction(transactionId: string): Promise<RiskAssessment> {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        senderAccount: { include: { entity: true } },
        receiverAccount: { include: { entity: true } },
      },
    });

    if (!tx) throw new Error(`Transaction not found: ${transactionId}`);

    const sAcc = tx.senderAccount;
    const rAcc = tx.receiverAccount;
    const sEnt = sAcc.entity;
    const rEnt = rAcc.entity;
    const currentAmt = Number(tx.amount);

    // 1. Historical Baseline for Amount Anomaly
    const pastSenderTxs = await prisma.transaction.findMany({
      where: { senderAccountId: sAcc.id, timestamp: { lt: tx.timestamp } },
      select: { amount: true },
      take: 50,
    });

    const amounts = pastSenderTxs.map((t) => Number(t.amount));
    const avgAmt = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : currentAmt;
    const maxAmt = amounts.length > 0 ? Math.max(...amounts) : currentAmt;

    const amountFactor = amountAnomalyAnalyzer.analyzeAmountAnomaly(
      currentAmt,
      { averageAmount: avgAmt, medianAmount: avgAmt, maxHistoricalAmount: maxAmt, historyCount: amounts.length },
      tx.id
    );

    // 2. Velocity Analysis around this transaction
    const txDate = tx.timestamp;
    const fifteenMinAgo = new Date(txDate.getTime() - 15 * 60 * 1000);
    const dayAgo = new Date(txDate.getTime() - 24 * 3600 * 1000);

    const recentTxs = await prisma.transaction.findMany({
      where: {
        senderAccountId: sAcc.id,
        timestamp: { gte: dayAgo, lte: txDate },
      },
      include: { receiverAccount: true },
    });

    const count15m = recentTxs.filter((t) => t.timestamp >= fifteenMinAgo).length;
    const count24h = recentTxs.length;
    const outVal24h = recentTxs.reduce((sum, t) => sum + Number(t.amount), 0);
    const uniqueRecv = new Set(recentTxs.map((t) => t.receiverAccountId)).size;

    const velocityFactor = velocityAnalyzer.analyzeVelocity({
      count5m: Math.min(count15m, 4),
      count15m,
      count1h: count15m + 2,
      count24h,
      outgoingValue24h: outVal24h,
      uniqueCounterparties24h: uniqueRecv,
      relatedTransactionIds: recentTxs.map((t) => t.id),
    });

    // 3. Structuring Analysis
    const structuringCandidateList = recentTxs.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      timestamp: t.timestamp,
      senderAccountId: t.senderAccountId,
      receiverAccountId: t.receiverAccountId,
    }));

    const structuringFactor = structuringAnalyzer.analyzeStructuring(structuringCandidateList);

    // 4. Counterparty Analysis
    const counterpartyFactor = counterpartyAnalyzer.analyzeCounterparty([
      {
        id: rEnt.id,
        name: rEnt.name,
        riskScore: rEnt.riskScore,
        riskLevel: rEnt.riskLevel,
        isSanctioned: rEnt.isSanctioned,
        isPEP: rEnt.isPEP,
        entityType: rEnt.entityType,
      },
    ]);

    // 5. Network Risk Contribution
    const networkContribution = sEnt.riskScore >= 80 || rEnt.riskScore >= 80 ? 20 : sEnt.riskScore >= 60 ? 12 : 0;
    const networkFactor: RiskFactor = {
      id: 'factor-tx-network-proximity',
      name: 'Counterparty Network Risk Level',
      category: 'NETWORK',
      contribution: networkContribution,
      weight: TRANSACTION_RISK_WEIGHTS.NETWORK_TOPOLOGY,
      severity: networkContribution >= 18 ? 'CRITICAL' : networkContribution >= 10 ? 'HIGH' : 'LOW',
      explanation:
        networkContribution > 0
          ? `Transaction counterparties belong to flagged high-risk network cluster (${sEnt.name}: ${sEnt.riskScore}/100, ${rEnt.name}: ${rEnt.riskScore}/100).`
          : 'Counterparties are not associated with elevated network laundering clusters.',
      evidence: [
        {
          statement: `Sender Risk Rating: ${sEnt.riskScore}/100 (${sEnt.riskLevel})`,
          metricName: 'Sender Composite Risk',
          metricValue: sEnt.riskScore,
          relatedEntityIds: [sEnt.id],
        },
        {
          statement: `Receiver Risk Rating: ${rEnt.riskScore}/100 (${rEnt.riskLevel})`,
          metricName: 'Receiver Composite Risk',
          metricValue: rEnt.riskScore,
          relatedEntityIds: [rEnt.id],
        },
      ],
      relatedRecords: { entityIds: [sEnt.id, rEnt.id], transactionIds: [tx.id] },
    };

    // 6. Behavior / Flagged Rules
    const behaviorContribution = tx.flaggedRules.length > 0 ? 15 : tx.isSuspicious ? 10 : 0;
    const behaviorFactor: RiskFactor = {
      id: 'factor-tx-behavior',
      name: 'Rule Engine Flagged Violations',
      category: 'BEHAVIOR',
      contribution: behaviorContribution,
      weight: TRANSACTION_RISK_WEIGHTS.BEHAVIOR,
      severity: behaviorContribution >= 15 ? 'CRITICAL' : behaviorContribution >= 10 ? 'HIGH' : 'LOW',
      explanation:
        tx.flaggedRules.length > 0
          ? `Triggered ${tx.flaggedRules.length} explicit forensic rules: ${tx.flaggedRules.join(', ')}.`
          : 'No explicit rule violations triggered.',
      evidence: tx.flaggedRules.map((r) => ({
        statement: `Violated detection rule: ${r}`,
        metricName: 'Rule Name',
        metricValue: r,
        relatedTransactionIds: [tx.id],
      })),
      relatedRecords: { transactionIds: [tx.id] },
    };

    const allFactors: RiskFactor[] = [
      amountFactor,
      velocityFactor,
      structuringFactor,
      counterpartyFactor,
      networkFactor,
      behaviorFactor,
    ];

    const rawTotal = allFactors.reduce((sum, f) => sum + f.contribution, 0);
    const overallScore = normalizeRiskScore(rawTotal);
    const riskLevel = getRiskLevelFromScore(overallScore);

    const topFactors = [...allFactors].sort((a, b) => b.contribution - a.contribution).filter((f) => f.contribution > 0);
    const summaryReasons = topFactors.map((f) => f.explanation);
    const evidenceList = allFactors.flatMap((f) => f.evidence);

    return {
      id: `assess-tx-${tx.id}`,
      subjectId: tx.id,
      subjectType: 'TRANSACTION',
      subjectLabel: tx.referenceNumber,
      subjectSublabel: `₹${currentAmt.toLocaleString('en-IN')} • ${tx.channel} • ${sEnt.name} ➔ ${rEnt.name}`,
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

export const transactionRiskScorer = new TransactionRiskScorer();
