import { evidenceCollector } from './evidenceCollector';
import {
  GroundedEvidenceReference,
  TransactionExplanationPayload,
} from './intelligenceTypes';

export class TransactionExplainer {
  /**
   * Explain why a specific transaction is anomalous or suspicious
   */
  async explainTransaction(transactionId: string): Promise<TransactionExplanationPayload> {
    const ctx = await evidenceCollector.collectTransactionContext(transactionId);
    const txn = ctx.transaction;
    const amount = Number(txn.amount);
    const mean = ctx.historicalMean;
    const deviation = ctx.deviationMultiplier;

    const evidenceReferences: GroundedEvidenceReference[] = [];

    const isStructuring = amount >= 45000 && amount < 50000;
    const isHighValue = amount >= 1000000;
    const isAnomalousDeviation = deviation >= 3.0;

    const txnDate = new Date(txn.timestamp);
    const hour = txnDate.getUTCHours();
    const isOddHours = hour >= 23 || hour <= 4;

    let narrative = `Transaction **${txn.referenceNumber || txn.id}** for **₹${amount.toLocaleString('en-IN')}** was evaluated for behavioral anomalies.\n\n`;

    if (isAnomalousDeviation) {
      narrative += `• **Amount Anomaly:** The transaction amount of ₹${amount.toLocaleString('en-IN')} is **${deviation.toFixed(1)}×** higher than the account's historical average of ₹${Math.round(mean).toLocaleString('en-IN')}.\n`;
      evidenceReferences.push({
        id: `EV-TXN-DEV-${txn.id}`,
        type: 'HISTORICAL_BASELINE_DEVIATION',
        title: `Amount Spike (${deviation.toFixed(1)}x Baseline)`,
        source: 'TRANSACTION_ENGINE',
        sourceId: txn.id,
        snippet: `Amount ₹${amount.toLocaleString('en-IN')} exceeds historical baseline of ₹${Math.round(mean).toLocaleString('en-IN')}`,
        severity: deviation >= 10 ? 'CRITICAL' : 'HIGH',
      });
    }

    if (isStructuring) {
      narrative += `• **Structuring Pattern:** Amount of ₹${amount.toLocaleString('en-IN')} is clustered just beneath the regulatory reporting threshold (₹50,000).\n`;
      evidenceReferences.push({
        id: `EV-TXN-STRUCT-${txn.id}`,
        type: 'STRUCTURING_THRESHOLD',
        title: 'Near-Threshold Structuring Flag',
        source: 'TRANSACTION_ENGINE',
        sourceId: txn.id,
        snippet: `Transfer of ₹${amount.toLocaleString('en-IN')} positioned near ₹50K mandatory STR reporting cutoff.`,
        severity: 'HIGH',
      });
    }

    if (isOddHours) {
      narrative += `• **Timing Anomaly:** Executed during nocturnal off-hours (${txnDate.toLocaleTimeString()}).\n`;
      evidenceReferences.push({
        id: `EV-TXN-TIME-${txn.id}`,
        type: 'ODD_HOURS_EXECUTION',
        title: 'Nocturnal Transaction Spike',
        source: 'TRANSACTION_ENGINE',
        sourceId: txn.id,
        snippet: `Executed at off-peak nocturnal interval (${txnDate.toISOString()})`,
        severity: 'MEDIUM',
      });
    }

    const senderName = txn.senderAccount?.entity?.name || 'Sender Entity';
    const receiverName = txn.receiverAccount?.entity?.name || 'Receiver Entity';
    const receiverRisk = txn.receiverAccount?.entity?.riskLevel || 'LOW';

    narrative += `• **Counterparty Exposure:** Transferred from ${senderName} to ${receiverName} (${receiverRisk} risk).\n`;

    return {
      transactionId: txn.referenceNumber || txn.id,
      amount,
      historicalMean: Math.round(mean),
      deviationMultiplier: Number(deviation.toFixed(2)),
      velocityObserved: 'Standard interval batch',
      isStructuringSuspect: isStructuring,
      channel: txn.channel || 'IMPS',
      counterpartyRisk: receiverRisk,
      evidenceReferences,
      narrativeExplanation: narrative,
    };
  }
}

export const transactionExplainer = new TransactionExplainer();
