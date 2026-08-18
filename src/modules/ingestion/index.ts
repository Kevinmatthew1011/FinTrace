export interface RawTransactionRecord {
  referenceNumber: string;
  senderAccount: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  channel: string;
  timestamp: string;
  narrative?: string;
}

export interface IngestionBatchResult {
  batchId: string;
  totalRecords: number;
  acceptedCount: number;
  rejectedCount: number;
  errors: Array<{ row: number; error: string }>;
}

export interface IIngestionService {
  ingestBatch(transactions: RawTransactionRecord[]): Promise<IngestionBatchResult>;
  validateRecord(record: RawTransactionRecord): { valid: boolean; error?: string };
}

export class IngestionServiceStub implements IIngestionService {
  validateRecord(record: RawTransactionRecord): { valid: boolean; error?: string } {
    if (!record.referenceNumber || !record.senderAccount || !record.receiverAccount) {
      return { valid: false, error: 'Missing mandatory fields' };
    }
    if (record.amount <= 0) {
      return { valid: false, error: 'Amount must be greater than zero' };
    }
    return { valid: true };
  }

  async ingestBatch(transactions: RawTransactionRecord[]): Promise<IngestionBatchResult> {
    const batchId = `BATCH-${Date.now()}`;
    let accepted = 0;
    const errors: Array<{ row: number; error: string }> = [];

    transactions.forEach((tx, idx) => {
      const val = this.validateRecord(tx);
      if (val.valid) accepted++;
      else errors.push({ row: idx + 1, error: val.error! });
    });

    return {
      batchId,
      totalRecords: transactions.length,
      acceptedCount: accepted,
      rejectedCount: errors.length,
      errors,
    };
  }
}

export const ingestionService = new IngestionServiceStub();
