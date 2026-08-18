import { prisma } from '@/lib/prisma';
import { RiskAssessment, RiskFactor } from './riskTypes';
import { velocityAnalyzer } from './velocityAnalysis';
import { structuringAnalyzer } from './structuringAnalysis';
import { dormantAnalyzer } from './dormantAnalysis';
import { counterpartyAnalyzer } from './counterpartyAnalysis';
import {
  RISK_ENGINE_VERSION,
  getRiskLevelFromScore,
  normalizeRiskScore,
  ACCOUNT_RISK_WEIGHTS,
} from './riskConfig';

export class AccountRiskScorer {
  async assessAccount(accountId: string): Promise<RiskAssessment> {
    const acc = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        entity: true,
      },
    });

    if (!acc) throw new Error(`Account not found: ${accountId}`);

    const txs = await prisma.transaction.findMany({
      where: {
        OR: [{ senderAccountId: accountId }, { receiverAccountId: accountId }],
      },
      take: 80,
      orderBy: { timestamp: 'desc' },
      include: {
        senderAccount: { include: { entity: true } },
        receiverAccount: { include: { entity: true } },
      },
    });

    const outgoing = txs.filter((t) => t.senderAccountId === accountId);
    const incoming = txs.filter((t) => t.receiverAccountId === accountId);
    const outVol = outgoing.reduce((s, t) => s + Number(t.amount), 0);
    const inVol = incoming.reduce((s, t) => s + Number(t.amount), 0);

    // 1. Velocity Analysis
    const velocityFactor = velocityAnalyzer.analyzeVelocity(
      {
        count5m: Math.min(outgoing.length, 4),
        count15m: Math.min(outgoing.length, 10),
        count1h: Math.min(outgoing.length, 15),
        count24h: outgoing.length,
        outgoingValue24h: outVol,
        uniqueCounterparties24h: new Set(txs.map((t) => (t.senderAccountId === accountId ? t.receiverAccountId : t.senderAccountId))).size,
        relatedTransactionIds: outgoing.map((t) => t.id),
      },
      ACCOUNT_RISK_WEIGHTS.VELOCITY
    );

    // 2. Flow Imbalance / Rapid Pass-Through Factor (Mule Characteristic)
    const ratio = inVol > 0 ? outVol / inVol : 0;
    const isRapidPassThrough = inVol >= 100000 && ratio >= 0.85 && ratio <= 1.15;
    const flowContribution = acc.isMuleFlagged || isRapidPassThrough ? 20 : 0;

    const flowFactor: RiskFactor = {
      id: 'factor-acc-flow-imbalance',
      name: 'Pass-Through Retention Latency',
      category: 'BEHAVIOR',
      contribution: flowContribution,
      weight: ACCOUNT_RISK_WEIGHTS.FLOW_IMBALANCE,
      severity: flowContribution >= 18 ? 'CRITICAL' : 'LOW',
      explanation:
        flowContribution > 0
          ? 'Account exhibits zero-retention pass-through characteristic: funds dispersed immediately upon receipt.'
          : 'Fund retention and inflow/outflow balance is normal.',
      evidence: [
        {
          statement: `Inflow ₹${(inVol / 100000).toFixed(2)}L vs Outflow ₹${(outVol / 100000).toFixed(2)}L (${(ratio * 100).toFixed(0)}% pass-through)`,
          metricName: 'Pass-Through Ratio',
          metricValue: `${(ratio * 100).toFixed(0)}%`,
          relatedAccountIds: [accountId],
        },
      ],
      relatedRecords: { accountIds: [accountId] },
    };

    // 3. Counterparty Exposure
    const cpProfiles = txs.map((t) => {
      const cpEnt = t.senderAccountId === accountId ? t.receiverAccount.entity : t.senderAccount.entity;
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
      cpProfiles,
      ACCOUNT_RISK_WEIGHTS.COUNTERPARTY_EXPOSURE
    );

    // 4. Structuring Analysis
    const structuringFactor = structuringAnalyzer.analyzeStructuring(
      txs.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        timestamp: t.timestamp,
        senderAccountId: t.senderAccountId,
        receiverAccountId: t.receiverAccountId,
      })),
      ACCOUNT_RISK_WEIGHTS.STRUCTURING_ANOMALY
    );

    // 5. Dormancy Takeover
    const dormantFactor = dormantAnalyzer.analyzeDormancy({
      lastActiveDate: txs.length > 5 ? txs[txs.length - 1].timestamp : null,
      currentTransactionDate: txs.length > 0 ? txs[0].timestamp : new Date(),
      recentVolumeINR: outVol,
      recentTxCount: txs.length,
      accountId,
    });

    const allFactors: RiskFactor[] = [
      velocityFactor,
      flowFactor,
      counterpartyFactor,
      structuringFactor,
      dormantFactor,
    ];

    const rawTotal = allFactors.reduce((sum, f) => sum + f.contribution, 0);
    const overallScore = normalizeRiskScore(rawTotal);
    const riskLevel = getRiskLevelFromScore(overallScore);

    const topFactors = [...allFactors].sort((a, b) => b.contribution - a.contribution).filter((f) => f.contribution > 0);
    const summaryReasons = topFactors.map((f) => f.explanation);
    const evidenceList = allFactors.flatMap((f) => f.evidence);

    return {
      id: `assess-acc-${acc.id}`,
      subjectId: acc.id,
      subjectType: 'ACCOUNT',
      subjectLabel: `${acc.bankName} - ${acc.accountNumber}`,
      subjectSublabel: `Owner: ${acc.entity.name} • Balance: ₹${(Number(acc.currentBalance) / 100000).toFixed(1)}L`,
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

export const accountRiskScorer = new AccountRiskScorer();
